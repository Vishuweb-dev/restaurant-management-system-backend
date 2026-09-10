const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const authenticateUser = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/stats", authenticateUser, authorizeAdmin, getDashboardStats);

module.exports = router;
