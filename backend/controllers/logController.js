const { Log } = require("../models");

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await Log.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
    });

    res.json(logs);
  } catch (error) {
    next(error);
  }
};
