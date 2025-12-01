const jwt = require("jsonwebtoken");
const { User, AuthToken } = require("../models");
const ApiError = require("../utils/apiError");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      throw new ApiError(401, "Authorization header missing");

    const token = authHeader.split(" ")[1];
    if (!token) throw new ApiError(401, "Token missing");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token exists in DB (optional but secure)
    const stored = await AuthToken.findOne({ where: { token } });
    if (!stored) throw new ApiError(401, "Invalid or expired session");

    const user = await User.findByPk(decoded.id);
    if (!user) throw new ApiError(404, "User not found");

    req.user = user;
    req.token = token; // store token in req for logout

    next();
  } catch (error) {
    next(error);
  }
};
