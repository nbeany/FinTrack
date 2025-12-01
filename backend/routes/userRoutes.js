const router = require("express").Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// User operations
router.get("/me", authMiddleware, userController.getProfile);
router.put("/me", authMiddleware, userController.updateProfile);
router.delete("/me", authMiddleware, userController.deleteAccount);

// Admin routes - require both authentication and admin role
router.get("/", authMiddleware, adminMiddleware, userController.getAllUsers);
router.get("/:id", authMiddleware, adminMiddleware, userController.getUserById);
router.put("/:id/role", authMiddleware, adminMiddleware, userController.updateUserRole);
router.delete("/:id", authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;
