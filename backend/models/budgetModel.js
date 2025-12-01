// models/budgetModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Budget = sequelize.define(
  "Budget",
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

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    limit_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    spent_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    alert_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "budgets",
    timestamps: true,
    underscored: true,
  }
);

// Relationship
User.hasMany(Budget, { foreignKey: "user_id" });
Budget.belongsTo(User, { foreignKey: "user_id" });

module.exports = Budget;
