const ApiError = require("../utils/apiError");

module.exports = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: err.errors.map((e) => e.message),
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
  });
};
