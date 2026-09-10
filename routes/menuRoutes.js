const express = require("express");
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const authenticateUser = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

// Admin only
router.post("/", authenticateUser, authorizeAdmin, upload.single("image"), createMenuItem);
router.put("/:id", authenticateUser, authorizeAdmin, upload.single("image"), updateMenuItem);
router.delete("/:id", authenticateUser, authorizeAdmin, deleteMenuItem);

module.exports = router;
