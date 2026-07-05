const { defineUser } = require("./User");
const { defineLoanApplication } = require("./LoanApplication");
const { defineTransaction } = require("./Transaction");
const { defineKycRecord } = require("./KycRecord");
const { defineClimateAssessment } = require("./ClimateAssessment");
const { defineWalletAccount } = require("./WalletAccount");
const { defineWalletTransaction } = require("./WalletTransaction");

let models = null;

/**
 * Defines every model against the live Sequelize connection and sets up
 * associations. Called once from config/db.js after a successful
 * connection. Subsequent calls to getModels() anywhere in the app return
 * the same registry.
 */
function initModels(sequelize) {
  const User = defineUser(sequelize);
  const LoanApplication = defineLoanApplication(sequelize);
  const Transaction = defineTransaction(sequelize);
  const KycRecord = defineKycRecord(sequelize);
  const ClimateAssessment = defineClimateAssessment(sequelize);
  const WalletAccount = defineWalletAccount(sequelize);
  const WalletTransaction = defineWalletTransaction(sequelize);

  User.hasMany(LoanApplication, { foreignKey: "userId" });
  User.hasMany(Transaction, { foreignKey: "userId" });
  User.hasMany(KycRecord, { foreignKey: "userId" });
  User.hasMany(ClimateAssessment, { foreignKey: "userId" });
  User.hasOne(WalletAccount, { foreignKey: "userId" });
  User.hasMany(WalletTransaction, { foreignKey: "userId" });

  models = {
    sequelize,
    User,
    LoanApplication,
    Transaction,
    KycRecord,
    ClimateAssessment,
    WalletAccount,
    WalletTransaction,
  };
  return models;
}

function getModels() {
  return models;
}

module.exports = initModels;
module.exports.getModels = getModels;
