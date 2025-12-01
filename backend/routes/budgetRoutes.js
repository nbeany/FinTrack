const router = require("express").Router();
const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middlewares/authMiddleware");

// Create and fetch budgets
router.post("/", authMiddleware, budgetController.createBudget);
router.get("/", authMiddleware, budgetController.getBudgets);

// Update or delete budget
router.put("/:id", authMiddleware, budgetController.updateBudget);
router.delete("/:id", authMiddleware, budgetController.deleteBudget);

// Check if budget exceeded
router.get("/check/status", authMiddleware, budgetController.checkBudgetStatus);

module.exports = router;
