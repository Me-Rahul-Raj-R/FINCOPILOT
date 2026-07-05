/**
 * Minimal in-memory data layer used in DEMO MODE (see config/db.js).
 * Mirrors the handful of operations each controller needs so controllers
 * stay agnostic about whether MySQL is actually connected.
 *
 * This is intentionally simple (arrays + incrementing ids) - it exists so
 * the whole app, including signup/login, is runnable with zero external
 * setup. It is not a production data store.
 */

let nextId = 1;
const makeId = () => nextId++;

const db = {
  users: [],
  walletAccounts: [],
  walletTransactions: [],
  loanApplications: [],
  transactions: [],
  kycRecords: [],
  climateAssessments: [],
};

// ---------------- Users ----------------
function insertUser(doc) {
  const record = { id: makeId(), createdAt: new Date(), ...doc };
  db.users.push(record);
  return record;
}
function findUserByEmail(email) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}
function findUserById(id) {
  return db.users.find((u) => u.id === Number(id));
}
function listUsers() {
  return db.users;
}
function updateUserRole(id, role) {
  const u = findUserById(id);
  if (u) u.role = role;
  return u;
}

// ---------------- Wallets ----------------
function insertWalletAccount(doc) {
  const record = { id: makeId(), createdAt: new Date(), ...doc };
  db.walletAccounts.push(record);
  return record;
}
function findWalletByUserId(userId) {
  return db.walletAccounts.find((w) => w.userId === Number(userId));
}
function insertWalletTransaction(doc) {
  const record = { id: makeId(), createdAt: new Date(), ...doc };
  db.walletTransactions.unshift(record);
  return record;
}
function walletTransactionsForUser(userId, limit = 30) {
  return db.walletTransactions.filter((t) => t.userId === Number(userId)).slice(0, limit);
}

// ---------------- Generic module collections ----------------
function insertLoanApplication(doc) {
  const record = { id: makeId(), createdAt: new Date(), ...doc };
  db.loanApplications.unshift(record);
  return record;
}
function insertTransaction(doc) {
  const record = { id: makeId(), createdAt: new Date(), ...doc };
  db.transactions.unshift(record);
  return record;
}
function insertKycRecord(doc) {
  const record = { id: makeId(), createdAt: new Date(), ...doc };
  db.kycRecords.unshift(record);
  return record;
}
function insertClimateAssessment(doc) {
  const record = { id: makeId(), createdAt: new Date(), ...doc };
  db.climateAssessments.unshift(record);
  return record;
}

/** Returns up to `limit` records from `collection`, optionally scoped to a userId (admins pass null). */
function recent(collection, limit = 25, userId = null) {
  const rows = userId
    ? db[collection].filter((r) => r.userId === Number(userId))
    : db[collection];
  return rows.slice(0, limit);
}

function stats(userId = null) {
  const scope = (rows) => (userId ? rows.filter((r) => r.userId === Number(userId)) : rows);

  const loanApplications = scope(db.loanApplications);
  const totalLoans = loanApplications.length;
  const highRiskLoans = loanApplications.filter((l) => l.riskCategory === "High").length;

  const txns = scope(db.transactions);
  const totalTxns = txns.length;
  const blockedTxns = txns.filter((t) => t.decision === "BLOCK" || t.decision === "HOLD_FOR_REVIEW");
  const blockedAmount = blockedTxns.reduce((s, t) => s + t.amount, 0);

  const kyc = scope(db.kycRecords);
  const totalKyc = kyc.length;
  const approvedKyc = kyc.filter((k) => k.status === "APPROVED").length;

  const climate = scope(db.climateAssessments);
  const climateFlagged = climate.filter(
    (c) => c.climateAdjustedRiskScore - c.baselineRiskScore > 10
  ).length;

  return {
    totalLoans,
    highRiskLoans,
    totalTxns,
    blockedTxns: blockedTxns.length,
    blockedAmount,
    totalKyc,
    kycApprovalRate: totalKyc ? Math.round((approvedKyc / totalKyc) * 100) : 0,
    climateAssessments: climate.length,
    climateFlagged,
  };
}

function adminOverview() {
  return {
    totalUsers: db.users.length,
    admins: db.users.filter((u) => u.role === "admin").length,
    ...stats(null),
  };
}

module.exports = {
  insertUser,
  findUserByEmail,
  findUserById,
  listUsers,
  updateUserRole,
  insertWalletAccount,
  findWalletByUserId,
  insertWalletTransaction,
  walletTransactionsForUser,
  insertLoanApplication,
  insertTransaction,
  insertKycRecord,
  insertClimateAssessment,
  recent,
  stats,
  adminOverview,
};
