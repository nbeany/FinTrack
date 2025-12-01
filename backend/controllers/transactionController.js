const { Transaction, Log } = require("../models");
const ApiError = require("../utils/apiError");

exports.createTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.create({
      user_id: req.user.id,
      ...req.body,
    });

    await Log.create({
      user_id: req.user.id,
      action: "CREATE_TRANSACTION",
      details: JSON.stringify(req.body),
    });

    res.status(201).json(tx);
  } catch (error) {
    next(error);
  }
};

exports.getUserTransactions = async (req, res, next) => {
  try {
    const tx = await Transaction.findAll({
      where: { user_id: req.user.id },
      order: [["date", "DESC"]],
    });

    res.json(tx);
  } catch (error) {
    next(error);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tx = await Transaction.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!tx) throw new ApiError(404, "Transaction not found");

    await tx.update(req.body);

    await Log.create({
      user_id: req.user.id,
      action: "UPDATE_TRANSACTION",
      details: JSON.stringify(req.body),
    });

    res.json({ message: "Transaction updated" });
  } catch (error) {
    next(error);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Transaction.destroy({
      where: { id, user_id: req.user.id },
    });

    await Log.create({
      user_id: req.user.id,
      action: "DELETE_TRANSACTION",
      details: `Transaction ID ${id}`,
    });

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    next(error);
  }
};
