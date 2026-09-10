const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError } = require("../utils/helpers");

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, 401, "No token provided. Access denied.");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendError(res, 401, "Session expired. Please log in again.");
      }
      return sendError(res, 401, "Invalid token.");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, "User no longer exists.");
    }

    req.user = user; // password is excluded by schema's select:false
    next();
  } catch (error) {
    return sendError(res, 500, "Authentication error.");
  }
};

module.exports = authenticateUser;
