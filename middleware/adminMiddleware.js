const { sendError } = require("../utils/helpers");

// Must run AFTER authenticateUser so req.user is available
const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return sendError(res, 403, "Admin access required.");
  }
  next();
};

module.exports = authorizeAdmin;
