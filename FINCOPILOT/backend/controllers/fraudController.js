const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");
const { evaluateTransaction } = require("../ml/fraudDetectionService");

async function getHistoryFor(senderAccount, isAdmin, userId) {
  if (global.FINCOPILOT_DEMO_MODE) {
    return memoryStore
      .recent("transactions", 200, isAdmin ? null : userId)
      .filter((t) => t.senderAccount === senderAccount);
  }
  const { Transaction } = getModels();
  return Transaction.findAll({
    where: { senderAccount, ...(isAdmin ? {} : { userId }) },
    order: [["createdAt", "DESC"]],
    limit: 200,
  });
}

async function checkTransaction(req, res) {
  try {
    const body = req.body || {};
    const required = ["senderAccount", "receiverAccount", "amount"];
    const missing = required.filter((f) => body[f] === undefined || body[f] === "");
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }

    const txn = {
      senderAccount: body.senderAccount,
      receiverAccount: body.receiverAccount,
      amount: Number(body.amount),
      channel: body.channel || "UPI",
      newDevice: !!body.newDevice,
      newBeneficiary: !!body.newBeneficiary,
    };

    const isAdmin = req.user.role === "admin";
    const history = await getHistoryFor(txn.senderAccount, isAdmin, req.user.id);
    const evaluation = evaluateTransaction(txn, history);
    const record = { ...txn, ...evaluation, userId: req.user.id };

    const saved = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.insertTransaction(record)
      : await getModels().Transaction.create(record);

    res.status(201).json(saved);
  } catch (err) {
    console.error("[fraudController] checkTransaction error:", err);
    res.status(500).json({ error: "Failed to evaluate transaction" });
  }
}

async function listTransactions(req, res) {
  try {
    const isAdmin = req.user.role === "admin";
    const records = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.recent("transactions", 30, isAdmin ? null : req.user.id)
      : await getModels().Transaction.findAll({
          where: isAdmin ? {} : { userId: req.user.id },
          order: [["createdAt", "DESC"]],
          limit: 30,
        });
    res.json(records);
  } catch (err) {
    console.error("[fraudController] listTransactions error:", err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
}

module.exports = { checkTransaction, listTransactions };
