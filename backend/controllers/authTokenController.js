const { Sequelize } = require("sequelize");
const { AuthToken } = require("../models");
const ApiError = require("../utils/apiError");

exports.getActiveTokens = async (req, res, next) => {
  try {
    const tokens = await AuthToken.findAll({
      where: { 
        user_id: req.user.id,
        expires_at: {
          [Sequelize.Op.gt]: new Date()
        }
      },
      attributes: ["id", "expires_at", "created_at"],
      order: [["created_at", "DESC"]],
    });

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};

