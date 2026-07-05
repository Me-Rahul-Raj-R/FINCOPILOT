const { DataTypes, Model } = require("sequelize");

class LoanApplication extends Model {}

function defineLoanApplication(sequelize) {
  LoanApplication.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      applicantName: { type: DataTypes.STRING, allowNull: false },
      monthlyIncome: { type: DataTypes.FLOAT, allowNull: false },
      monthlyEmiOutgo: { type: DataTypes.FLOAT, allowNull: false },
      creditUtilizationPct: { type: DataTypes.FLOAT, allowNull: false },
      latePayments24m: { type: DataTypes.INTEGER, allowNull: false },
      loanToValuePct: { type: DataTypes.FLOAT, allowNull: false },
      yearsEmployed: { type: DataTypes.FLOAT, allowNull: false },
      existingNpaFlag: { type: DataTypes.BOOLEAN, defaultValue: false },
      loanAmount: { type: DataTypes.FLOAT, allowNull: false },

      probabilityOfDefault: DataTypes.FLOAT,
      riskScore: DataTypes.INTEGER,
      riskCategory: DataTypes.ENUM("Low", "Medium", "High"),
      topFactors: { type: DataTypes.JSON, allowNull: true },
      decision: DataTypes.STRING,
      scoringMethod: { type: DataTypes.STRING, defaultValue: "bureau-model" },
    },
    { sequelize, modelName: "LoanApplication", tableName: "loan_applications", timestamps: true,
      indexes: [{ fields: ["userId"] }, { fields: ["createdAt"] }, { fields: ["riskCategory"] }] }
  );
  return LoanApplication;
}

module.exports = { LoanApplication, defineLoanApplication };
