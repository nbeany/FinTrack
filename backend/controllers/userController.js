const { User, Log } = require("../models");
const ApiError = require("../utils/apiError");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "created_at"],
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;

    await User.update({ name }, { where: { id: req.user.id } });

    await Log.create({
      user_id: req.user.id,
      action: "UPDATE_PROFILE",
      details: `New name: ${name}`,
    });

    res.json({ message: "Profile updated" });
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.destroy({ where: { id: req.user.id } });

    await Log.create({
      user_id: req.user.id,
      action: "DELETE_ACCOUNT",
      details: "Account deleted",
    });

    res.json({ message: "Account deleted" });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "created_at"],
      order: [["created_at", "DESC"]],
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: ["id", "name", "email", "role", "created_at"],
    });
    
    if (!user) throw new ApiError(404, "User not found");
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      throw new ApiError(400, "Invalid role. Must be 'user' or 'admin'");
    }

    const user = await User.findByPk(id);
    if (!user) throw new ApiError(404, "User not found");

    // Prevent admin from removing their own admin role
    if (user.id === req.user.id && role === 'user') {
      throw new ApiError(400, "Cannot remove your own admin role");
    }

    await user.update({ role });

    await Log.create({
      user_id: req.user.id,
      action: "UPDATE_USER_ROLE",
      details: `Updated user ${id} role to ${role}`,
    });

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) throw new ApiError(404, "User not found");

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      throw new ApiError(400, "Cannot delete your own account");
    }

    await User.destroy({ where: { id } });

    await Log.create({
      user_id: req.user.id,
      action: "DELETE_USER",
      details: `Deleted user: ${user.email}`,
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
