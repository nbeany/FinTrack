const router = require("express").Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middlewares/authMiddleware");

// Protected routes
router.post("/", authMiddleware, transactionController.createTransaction);
router.get("/", authMiddleware, transactionController.getUserTransactions);
router.put("/:id", authMiddleware, transactionController.updateTransaction);
router.delete("/:id", authMiddleware, transactionController.deleteTransaction);

module.exports = router;
