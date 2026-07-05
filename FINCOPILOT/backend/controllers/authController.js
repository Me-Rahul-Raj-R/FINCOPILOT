const { getModels } = require("../models");
const memoryStore = require("../utils/memoryStore");
const { hashPassword, comparePassword, signToken } = require("../utils/authUtils");

const STARTER_BALANCE = 25000;

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

async function signup(req, res) {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const passwordHash = await hashPassword(password);
    // Signup always creates a regular "user" - admin accounts are provisioned
    // separately via `npm run seed:admin`, never through public signup.
    const role = "user";

    let user;
    let wallet;

    if (global.FINCOPILOT_DEMO_MODE) {
      if (memoryStore.findUserByEmail(email)) {
        return res.status(409).json({ error: "An account with that email already exists" });
      }
      user = memoryStore.insertUser({ name, email, passwordHash, role });
      wallet = memoryStore.insertWalletAccount({
        userId: user.id,
        accountCode: `FCP-${user.id}`,
        balance: STARTER_BALANCE,
        currency: "INR",
      });
    } else {
      const { User, WalletAccount } = getModels();
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(409).json({ error: "An account with that email already exists" });
      }
      user = await User.create({ name, email, passwordHash, role });
      wallet = await WalletAccount.create({
        userId: user.id,
        accountCode: `FCP-${user.id}`,
        balance: STARTER_BALANCE,
        currency: "INR",
      });
    }

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user), wallet: { balance: wallet.balance, accountCode: wallet.accountCode } });
  } catch (err) {
    console.error("[authController] signup error:", err);
    res.status(500).json({ error: "Failed to create account" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const user = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.findUserByEmail(email)
      : await getModels().User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error("[authController] login error:", err);
    res.status(500).json({ error: "Failed to log in" });
  }
}

async function me(req, res) {
  try {
    const user = global.FINCOPILOT_DEMO_MODE
      ? memoryStore.findUserById(req.user.id)
      : await getModels().User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error("[authController] me error:", err);
    res.status(500).json({ error: "Failed to load profile" });
  }
}

module.exports = { signup, login, me };
