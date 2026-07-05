const { DataTypes, Model } = require("sequelize");

class User extends Model {}

function defineUser(sequelize) {
  User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        allowNull: false,
        defaultValue: "user",
      },
    },
    { sequelize, modelName: "User", tableName: "users", timestamps: true,
      indexes: [{ fields: ["role"] }] }
  );
  return User;
}

module.exports = { User, defineUser };
