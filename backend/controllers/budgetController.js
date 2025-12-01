// controllers/budgetController.js
const { Budget, Log, Transaction } = require("../models");
const ApiError = require("../utils/apiError");

// Helper: calculate spent amount for category
async function calculateSpent(userId, category) {
  const tx = await Transaction.findAll({
    where: {
      user_id: userId,
      category,
      type: "expense",
    },
  });

  let total = 0;
  tx.forEach((t) => (total += parseFloat(t.amount)));
  return total;
}

// -------------------------------
// Create a new budget entry
// -------------------------------
exports.createBudget = async (req, res, next) => {
  try {
    const { category, limit_amount } = req.body;

    const spent = await calculateSpent(req.user.id, category);

    const budget = await Budget.create({
      user_id: req.user.id,
      category,
      limit_amount,
      spent_amount: spent,
    });

    await Log.create({
      user_id: req.user.id,
      action: "CREATE_BUDGET",
      details: JSON.stringify({ category, limit_amount }),
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// Fetch all budgets for the user
// -------------------------------
exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.findAll({
      where: { user_id: req.user.id },
    });

    res.json(budgets);
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// Update budget
// -------------------------------
exports.updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!budget) throw new ApiError(404, "Budget not found");

    await budget.update(req.body);

    await Log.create({
      user_id: req.user.id,
      action: "UPDATE_BUDGET",
      details: JSON.stringify(req.body),
    });

    res.json({ message: "Budget updated" });
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// Delete budget entry
// -------------------------------
exports.deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Budget.destroy({
      where: { id, user_id: req.user.id },
    });

    await Log.create({
      user_id: req.user.id,
      action: "DELETE_BUDGET",
      details: `Budget ID ${id}`,
    });

    res.json({ message: "Budget deleted" });
  } catch (error) {
    next(error);
  }
};

// -------------------------------
// Check whether budget exceeded
// -------------------------------
exports.checkBudgetStatus = async (req, res, next) => {
  try {
    const budgets = await Budget.findAll({
      where: { user_id: req.user.id },
    });

    for (const b of budgets) {
      const spent = await calculateSpent(req.user.id, b.category);
      await b.update({ spent_amount: spent });

      if (spent > b.limit_amount && !b.alert_sent) {
        await b.update({ alert_sent: true });

        await Log.create({
          user_id: req.user.id,
          action: "BUDGET_EXCEEDED",
          details: `${b.category} exceeded: spent ${spent} / limit ${b.limit_amount}`,
        });
      }
    }

    res.json({ message: "Budget status updated" });
  } catch (error) {
    next(error);
  }
};
