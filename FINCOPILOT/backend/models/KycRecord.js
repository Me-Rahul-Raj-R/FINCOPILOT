const { DataTypes, Model } = require("sequelize");

class KycRecord extends Model {}

function defineKycRecord(sequelize) {
  KycRecord.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: true },
      applicantName: { type: DataTypes.STRING, allowNull: false },
      phone: { type: DataTypes.STRING, allowNull: true },
      deviceId: { type: DataTypes.STRING, allowNull: true },
      documentType: { type: DataTypes.STRING, defaultValue: "AADHAAR" },
      documentProvided: { type: DataTypes.BOOLEAN, defaultValue: false },
      livenessChallengeCode: DataTypes.STRING,
      livenessConfidence: DataTypes.INTEGER,
      deviceFlaggedEmulator: { type: DataTypes.BOOLEAN, defaultValue: false },
      status: {
        type: DataTypes.ENUM("PENDING", "APPROVED", "MANUAL_REVIEW", "REJECTED"),
        defaultValue: "PENDING",
      },
    },
    { sequelize, modelName: "KycRecord", tableName: "kyc_records", timestamps: true,
      indexes: [{ fields: ["userId"] }, { fields: ["createdAt"] }, { fields: ["phone"] }, { fields: ["deviceId"] }] }
  );
  return KycRecord;
}

module.exports = { KycRecord, defineKycRecord };
