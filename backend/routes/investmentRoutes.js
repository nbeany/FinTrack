const router = require("express").Router();
const investmentController = require("../controllers/investmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Protected routes
router.post("/", authMiddleware, investmentController.addInvestment);
router.get("/", authMiddleware, investmentController.getInvestments);
router.get("/portfolio", authMiddleware, investmentController.getPortfolio);
router.post("/update-prices", authMiddleware, investmentController.updatePortfolioPrices);
router.put("/:id", authMiddleware, investmentController.updateInvestment);
router.delete("/:id", authMiddleware, investmentController.deleteInvestment);

module.exports = router;
