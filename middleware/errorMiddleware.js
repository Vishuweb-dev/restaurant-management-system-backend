const { sendError } = require("../utils/helpers");

// 404 handler for unknown routes
const notFound = (req, res, next) => {
  return sendError(res, 404, `Route not found: ${req.originalUrl}`);
};

// Centralized error handler - catches errors passed via next(err)
// and errors thrown inside async route handlers wrapped with asyncHandler.
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    return sendError(res, 400, "Invalid ID format.");
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, messages.join(", "));
  }

  // Duplicate key (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already in use.`);
  }

  const statusCode = err.statusCode || 500;
  return sendError(res, statusCode, err.message || "Server error.");
};

// Wraps async controllers so we don't need try/catch everywhere
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { notFound, errorHandler, asyncHandler };
