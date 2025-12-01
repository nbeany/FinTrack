module.exports = function sendResponse(res, status = 200, message = "", data = null) {
  res.status(status).json({
    success: true,
    message,
    data
  });
};
