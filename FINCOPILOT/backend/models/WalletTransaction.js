const { DataTypes, Model } = require("sequelize");

class WalletTransaction extends Model {}

function defineWalletTransaction(sequelize) {
  WalletTransaction.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      type: {
        type: DataTypes.ENUM("SEND", "RECEIVE", "BILL_PAY", "RECHARGE"),
        allowNull: false,
      },
      counterparty: { type: DataTypes.STRING, allowNull: false }, // contact name or biller name
      amount: { type: DataTypes.FLOAT, allowNull: false },
      note: DataTypes.STRING,

      // Populated for SEND transactions by routing through the Fraud Shield engine.
      fraudRiskScore: DataTypes.INTEGER,
      fraudDecision: DataTypes.STRING,

      status: {
        type: DataTypes.ENUM("SUCCESS", "STEP_UP_REQUIRED", "BLOCKED"),
        defaultValue: "SUCCESS",
      },
    },
    { sequelize, modelName: "WalletTransaction", tableName: "wallet_transactions", timestamps: true,
      indexes: [{ fields: ["userId"] }, { fields: ["createdAt"] }] }
  );
  return WalletTransaction;
}

module.exports = { WalletTransaction, defineWalletTransaction };
