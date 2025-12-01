const sequelize = require("../config/db");

const User = require("./userModel");
const Transaction = require("./transactionModel");
const Investment = require("./investmentModel");
const AuthToken = require("./authTokenModel");
const Budget = require("./budgetModel");
const Log = require("./logModel");

// Associations loaded inside each model file

module.exports = {
  sequelize,
  User,
  Transaction,
  Investment,
  AuthToken,
  Budget,
  Log,
};
