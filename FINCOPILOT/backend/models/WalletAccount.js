const { DataTypes, Model } = require("sequelize");

class WalletAccount extends Model {}

function defineWalletAccount(sequelize) {
  WalletAccount.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
      accountCode: { type: DataTypes.STRING, allowNull: false, unique: true }, // e.g. "FCP-USER-7"
      balance: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 25000 },
      currency: { type: DataTypes.STRING, defaultValue: "INR" },
    },
    { sequelize, modelName: "WalletAccount", tableName: "wallet_accounts", timestamps: true }
  );
  return WalletAccount;
}

module.exports = { WalletAccount, defineWalletAccount };
