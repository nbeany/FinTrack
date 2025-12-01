const router = require("express").Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

// Public
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected
router.post("/logout", authMiddleware, authController.logout);

module.exports = router;
