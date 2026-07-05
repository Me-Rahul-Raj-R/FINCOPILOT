const { DataTypes, Model } = require("sequelize");

class ClimateAssessment extends Model {}

function defineClimateAssessment(sequelize) {
  ClimateAssessment.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      borrowerName: { type: DataTypes.STRING, allowNull: false },
      industry: { type: DataTypes.STRING, allowNull: false },
      region: { type: DataTypes.STRING, allowNull: false },
      loanTenureYears: { type: DataTypes.FLOAT, allowNull: false },
      loanAmount: { type: DataTypes.FLOAT, allowNull: false },

      baselineRiskScore: DataTypes.INTEGER,
      climateAdjustedRiskScore: DataTypes.INTEGER,
      riskPremiumPct: DataTypes.FLOAT,
      recommendation: DataTypes.TEXT,
    },
    { sequelize, modelName: "ClimateAssessment", tableName: "climate_assessments", timestamps: true,
      indexes: [{ fields: ["userId"] }] }
  );
  return ClimateAssessment;
}

module.exports = { ClimateAssessment, defineClimateAssessment };
