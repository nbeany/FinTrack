const ApiError = require("../utils/apiError");

/**
 * Middleware to check if user is an admin
 * Must be used after authMiddleware
 */
module.exports = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (req.user.role !== 'admin') {
      throw new ApiError(403, "Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

