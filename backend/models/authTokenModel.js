const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const AuthToken = sequelize.define(
  "AuthToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "auth_tokens",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(AuthToken, { foreignKey: "user_id" });
AuthToken.belongsTo(User, { foreignKey: "user_id" });

module.exports = AuthToken;
