const router = require("express").Router();
const logController = require("../controllers/logController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, logController.getLogs);

module.exports = router;
