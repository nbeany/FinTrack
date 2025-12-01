const router = require("express").Router();
const authTokenController = require("../controllers/authTokenController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, authTokenController.getActiveTokens);

module.exports = router;
