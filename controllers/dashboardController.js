const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const { sendSuccess } = require("../utils/helpers");
const { asyncHandler } = require("../middleware/errorMiddleware");

// GET /api/dashboard/stats
// Admin only.
//
// NOTE: "Total Orders" was in the original spec, but no Order model/API
// was confirmed as in-scope for this project. totalOrders is stubbed at 0
// here so the dashboard doesn't break. Wire this up to a real Order
// collection once that module is confirmed and built.
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalMenuItems, totalUsers] = await Promise.all([
    MenuItem.countDocuments(),
    User.countDocuments({ role: "user" }),
  ]);

  return sendSuccess(res, 200, "Dashboard statistics fetched successfully.", {
    totalMenuItems,
    totalUsers,
    totalOrders: 0, // placeholder — see note above
  });
});

module.exports = { getDashboardStats };
