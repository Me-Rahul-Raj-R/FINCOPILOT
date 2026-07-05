/**
 * Creates (or updates the password of) the FinCopilot admin account.
 *
 * Run with: npm run seed:admin
 *
 * Reads ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env.
 * This only works in PERSISTENT MODE (a real MySQL connection via
 * DB_HOST in .env) - admin accounts are deliberately NOT created through
 * the public /api/auth/signup route, and demo-mode's in-memory store
 * resets every time the server restarts, so seeding it from a separate
 * one-off script wouldn't carry over anyway.
 */
require("dotenv").config();
const { Sequelize } = require("sequelize");
const initModels = require("../models");
const { hashPassword } = require("../utils/authUtils");

async function main() {
  const { ADMIN_NAME = "FinCopilot Admin", ADMIN_EMAIL, ADMIN_PASSWORD, DB_HOST } = process.env;

  if (!DB_HOST) {
    console.error(
      "[seed:admin] DB_HOST is not set in backend/.env - admin seeding requires PERSISTENT MODE (MySQL).\n" +
        "See the README's 'Connect MySQL Workbench' section, then re-run `npm run seed:admin`."
    );
    process.exit(1);
  }
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("[seed:admin] Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.");
    process.exit(1);
  }
  if (ADMIN_PASSWORD.length < 8) {
    console.error("[seed:admin] ADMIN_PASSWORD should be at least 8 characters.");
    process.exit(1);
  }

  const sequelize = new Sequelize(
    process.env.DB_NAME || "fincopilot",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    { host: DB_HOST, port: process.env.DB_PORT || 3306, dialect: "mysql", logging: false }
  );

  await sequelize.authenticate();
  const { User } = initModels(sequelize);
  await sequelize.sync();

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const [admin, created] = await User.findOrCreate({
    where: { email: ADMIN_EMAIL },
    defaults: { name: ADMIN_NAME, passwordHash, role: "admin" },
  });

  if (!created) {
    admin.passwordHash = passwordHash;
    admin.role = "admin";
    admin.name = ADMIN_NAME;
    await admin.save();
    console.log(`[seed:admin] Updated existing admin account: ${ADMIN_EMAIL}`);
  } else {
    console.log(`[seed:admin] Created admin account: ${ADMIN_EMAIL}`);
  }

  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("[seed:admin] Failed:", err.message);
  process.exit(1);
});
