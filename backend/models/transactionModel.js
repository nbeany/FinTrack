const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Transaction = sequelize.define(
  "Transaction",
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

    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    description: {
      type: DataTypes.STRING,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "transactions",
    timestamps: true,
    underscored: true,
  }
);

// Association
User.hasMany(Transaction, { foreignKey: "user_id" });
Transaction.belongsTo(User, { foreignKey: "user_id" });

module.exports = Transaction;
