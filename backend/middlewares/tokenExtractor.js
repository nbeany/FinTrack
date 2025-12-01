module.exports = (req, res, next) => {
  const bearer = req.headers.authorization;

  req.token = bearer ? bearer.split(" ")[1] : null;

  next();
};
