const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

// GET /api/users
// Admin only. Password is never selected (schema default select:false).
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return sendSuccess(res, 200, "Users fetched successfully.", { users });
});

// DELETE /api/users/:id
// Admin only. Prevents an admin from deleting their own account by mistake,
// and prevents deleting the last remaining admin account.
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id.toString()) {
    return sendError(res, 400, "You cannot delete your own account while logged in.");
  }

  const userToDelete = await User.findById(id);
  if (!userToDelete) {
    return sendError(res, 404, "User not found.");
  }

  if (userToDelete.role === "admin") {
    const adminCount = await User.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return sendError(res, 400, "Cannot delete the last remaining admin account.");
    }
  }

  await userToDelete.deleteOne();

  return sendSuccess(res, 200, "User deleted successfully.", {});
});

module.exports = { getUsers, deleteUser };
