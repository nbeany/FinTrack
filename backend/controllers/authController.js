const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { User, AuthToken, Log } = require("../models");
const ApiError = require("../utils/apiError");

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) throw new ApiError(400, "Email already exists");

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed });

    await Log.create({
      user_id: user.id,
      action: "REGISTER",
      details: `User registered: ${user.email}`,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) throw new ApiError(404, "User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new ApiError(401, "Invalid credentials");

    const token = generateToken(user.id);

    await AuthToken.create({
      user_id: user.id,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    });

    await Log.create({
      user_id: user.id,
      action: "LOGIN",
      details: `User logged in: ${email}`,
    });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.token;

    await AuthToken.destroy({ where: { token } });

    await Log.create({
      user_id: req.user.id,
      action: "LOGOUT",
      details: "User logged out",
    });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
