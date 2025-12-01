const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./userModel");

const Investment = sequelize.define(
  "Investment",
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

    asset_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
    },

    buy_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    current_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    exchange: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "investments",
    timestamps: true,
    underscored: true,
  }
);

// Relationship
User.hasMany(Investment, { foreignKey: "user_id" });
Investment.belongsTo(User, { foreignKey: "user_id" });

module.exports = Investment;
