const { DataTypes, Model } = require("sequelize");

class Transaction extends Model {}

function defineTransaction(sequelize) {
  Transaction.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      senderAccount: { type: DataTypes.STRING, allowNull: false },
      receiverAccount: { type: DataTypes.STRING, allowNull: false },
      amount: { type: DataTypes.FLOAT, allowNull: false },
      channel: {
        type: DataTypes.ENUM("UPI", "IMPS", "NEFT", "CARD"),
        defaultValue: "UPI",
      },
      newDevice: { type: DataTypes.BOOLEAN, defaultValue: false },
      newBeneficiary: { type: DataTypes.BOOLEAN, defaultValue: false },

      fraudRiskScore: DataTypes.INTEGER,
      flags: { type: DataTypes.JSON, allowNull: true },
      decision: {
        type: DataTypes.ENUM("ALLOW", "STEP_UP_AUTH", "HOLD_FOR_REVIEW", "BLOCK"),
      },
    },
    { sequelize, modelName: "Transaction", tableName: "transactions", timestamps: true,
      indexes: [{ fields: ["userId"] }, { fields: ["senderAccount"] }, { fields: ["createdAt"] }] }
  );
  return Transaction;
}

module.exports = { Transaction, defineTransaction };
