const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Log = sequelize.define(
  "Log",
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

    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    details: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "logs",
    timestamps: true,
    underscored: true,
  }
);

// Relationships
User.hasMany(Log, { foreignKey: "user_id" });
Log.belongsTo(User, { foreignKey: "user_id" });

module.exports = Log;
