const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendSuccess, sendError } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

// POST /api/auth/register
// Public. Every new account is forced to role "user" — role is never taken from req.body.
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return sendError(res, 400, "All fields are required.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return sendError(res, 400, "Please provide a valid email address.");
  }

  if (password !== confirmPassword) {
    return sendError(res, 400, "Password and confirm password do not match.");
  }

  if (password.length < 6) {
    return sendError(res, 400, "Password must be at least 6 characters long.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return sendError(res, 409, "An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "user", // forced — cannot be overridden by client input
  });

  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 201, "Registration successful.", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/login
// Public. Works for both users and admins — role comes back in the response
// so the frontend can redirect appropriately.
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, "Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    return sendError(res, 401, "Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return sendError(res, 401, "Invalid email or password.");
  }

  const token = generateToken(user._id, user.role);

  return sendSuccess(res, 200, "Login successful.", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = { registerUser, loginUser };
