const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");
const { evaluateTransaction } = require("../ml/fraudDetectionService");

const MOCK_CONTACTS = [
  { name: "Priya Sharma", account: "MOCK-PRIYA-21" },
  { name: "Rahul Verma", account: "MOCK-RAHUL-44" },
  { name: "Anita Desai", account: "MOCK-ANITA-09" },
  { name: "Vikram Iyer", account: "MOCK-VIKRAM-67" },
  { name: "Sneha Nair", account: "MOCK-SNEHA-12" },
];

// ---------- helpers that branch on demo vs persistent mode ----------

async function getOrCreateWallet(userId) {
  if (global.FINCOPILOT_DEMO_MODE) {
    let wallet = memoryStore.findWalletByUserId(userId);
    if (!wallet) {
      wallet = memoryStore.insertWalletAccount({
        userId,
        accountCode: `FCP-${userId}`,
        balance: 25000,
        currency: "INR",
      });
    }
    return wallet;
  }
  const { WalletAccount } = getModels();
  let wallet = await WalletAccount.findOne({ where: { userId } });
  if (!wallet) {
    wallet = await WalletAccount.create({ userId, accountCode: `FCP-${userId}`, balance: 25000 });
  }
  return wallet;
}

async function findWalletByAccountCode(accountCode) {
  if (global.FINCOPILOT_DEMO_MODE) {
    return memoryStore.recent("walletAccounts", 9999).find((w) => w.accountCode === accountCode) || null;
  }
  const { WalletAccount } = getModels();
  return WalletAccount.findOne({ where: { accountCode } });
}

async function senderTxnHistory(senderAccount) {
  if (global.FINCOPILOT_DEMO_MODE) {
    return memoryStore.recent("transactions", 200).filter((t) => t.senderAccount === senderAccount);
  }
  const { Transaction } = getModels();
  return Transaction.findAll({ where: { senderAccount }, order: [["createdAt", "DESC"]], limit: 200 });
}

async function logSharedTransaction(record) {
  return global.FINCOPILOT_DEMO_MODE
    ? memoryStore.insertTransaction(record)
    : getModels().Transaction.create(record);
}

async function logWalletTransaction(record) {
  return global.FINCOPILOT_DEMO_MODE
    ? memoryStore.insertWalletTransaction(record)
    : getModels().WalletTransaction.create(record);
}

async function saveWallet(wallet, newBalance) {
  if (global.FINCOPILOT_DEMO_MODE) {
    wallet.balance = newBalance;
    return wallet;
  }
  wallet.balance = newBalance;
  await wallet.save();
  return wallet;
}

// ---------- routes ----------

async function getWallet(req, res) {
  try {
    const wallet = await getOrCreateWallet(req.user.id);
    const recentTxns = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.walletTransactionsForUser(req.user.id, 20)
      : await getModels().WalletTransaction.findAll({
          where: { userId: req.user.id },
          order: [["createdAt", "DESC"]],
          limit: 20,
        });
    res.json({
      balance: wallet.balance,
      currency: wallet.currency,
      accountCode: wallet.accountCode,
      transactions: recentTxns,
    });
  } catch (err) {
    console.error("[walletController] getWallet error:", err);
    res.status(500).json({ error: "Failed to load wallet" });
  }
}

async function contacts(req, res) {
  try {
    const others = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.listUsers().filter((u) => u.id !== req.user.id)
      : await getModels().User.findAll({ where: {}, attributes: ["id", "name"] });

    const platformContacts = (global.FINCOPILOT_DEMO_MODE ? others : others.map((u) => u.get({ plain: true })))
      .filter((u) => u.id !== req.user.id)
      .map((u) => ({ name: u.name, account: `FCP-${u.id}`, platformUser: true }));

    res.json({ contacts: [...platformContacts, ...MOCK_CONTACTS] });
  } catch (err) {
    console.error("[walletController] contacts error:", err);
    res.status(500).json({ error: "Failed to load contacts" });
  }
}

async function sendMoney(req, res) {
  try {
    const { contactName, contactAccount, amount, note, confirmStepUp } = req.body || {};
    if (!contactName || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "contactName and a positive amount are required" });
    }

    const wallet = await getOrCreateWallet(req.user.id);
    const amt = Number(amount);

    if (amt > wallet.balance) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    const receiverAccount = contactAccount || `CONTACT-${contactName.toUpperCase().replace(/\s+/g, "-")}`;
    const history = await senderTxnHistory(wallet.accountCode);
    const evaluation = evaluateTransaction(
      { senderAccount: wallet.accountCode, receiverAccount, amount: amt, channel: "UPI", newBeneficiary: !history.some((h) => h.receiverAccount === receiverAccount) },
      history
    );

    // Anything other than a clean ALLOW needs to be confirmed (or is rejected) before money moves.
    if (evaluation.decision === "BLOCK" || evaluation.decision === "HOLD_FOR_REVIEW") {
      await logSharedTransaction({
        senderAccount: wallet.accountCode,
        receiverAccount,
        amount: amt,
        channel: "UPI",
        ...evaluation,
        userId: req.user.id,
      });
      await logWalletTransaction({
        userId: req.user.id,
        type: "SEND",
        counterparty: contactName,
        amount: amt,
        note,
        fraudRiskScore: evaluation.fraudRiskScore,
        fraudDecision: evaluation.decision,
        status: "BLOCKED",
      });
      return res.status(403).json({
        error: `Payment stopped by Fraud Shield (${evaluation.decision.replace(/_/g, " ")})`,
        fraudRiskScore: evaluation.fraudRiskScore,
        flags: evaluation.flags,
      });
    }

    if (evaluation.decision === "STEP_UP_AUTH" && !confirmStepUp) {
      return res.json({
        requiresStepUp: true,
        fraudRiskScore: evaluation.fraudRiskScore,
        flags: evaluation.flags,
        message: "This payment looks unusual. Confirm with a one-time code to proceed.",
      });
    }

    // Cleared - move the money.
    const newBalance = wallet.balance - amt;
    await saveWallet(wallet, newBalance);

    await logSharedTransaction({
      senderAccount: wallet.accountCode,
      receiverAccount,
      amount: amt,
      channel: "UPI",
      ...evaluation,
      userId: req.user.id,
    });

    const walletTxn = await logWalletTransaction({
      userId: req.user.id,
      type: "SEND",
      counterparty: contactName,
      amount: amt,
      note,
      fraudRiskScore: evaluation.fraudRiskScore,
      fraudDecision: evaluation.decision,
      status: "SUCCESS",
    });

    // If the recipient is a real platform user, credit their wallet too -
    // a nice live demo of two FinCopilot accounts actually paying each other.
    const recipientWallet = await findWalletByAccountCode(receiverAccount);
    if (recipientWallet && recipientWallet.userId !== req.user.id) {
      await saveWallet(recipientWallet, recipientWallet.balance + amt);
      await logWalletTransaction({
        userId: recipientWallet.userId,
        type: "RECEIVE",
        counterparty: req.user.email,
        amount: amt,
        note,
        status: "SUCCESS",
      });
    }

    res.status(201).json({ wallet: { balance: newBalance }, transaction: walletTxn, fraudRiskScore: evaluation.fraudRiskScore });
  } catch (err) {
    console.error("[walletController] sendMoney error:", err);
    res.status(500).json({ error: "Failed to send money" });
  }
}

async function billPay(req, res) {
  try {
    const { billType, amount } = req.body || {};
    if (!billType || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "billType and a positive amount are required" });
    }
    const wallet = await getOrCreateWallet(req.user.id);
    const amt = Number(amount);
    if (amt > wallet.balance) return res.status(400).json({ error: "Insufficient wallet balance" });

    await saveWallet(wallet, wallet.balance - amt);
    const txn = await logWalletTransaction({
      userId: req.user.id,
      type: "BILL_PAY",
      counterparty: billType,
      amount: amt,
      status: "SUCCESS",
    });
    res.status(201).json({ wallet: { balance: wallet.balance }, transaction: txn });
  } catch (err) {
    console.error("[walletController] billPay error:", err);
    res.status(500).json({ error: "Failed to pay bill" });
  }
}

module.exports = { getWallet, contacts, sendMoney, billPay };
