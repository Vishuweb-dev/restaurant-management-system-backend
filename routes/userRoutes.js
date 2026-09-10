const express = require("express");
const { getUsers, deleteUser } = require("../controllers/userController");
const authenticateUser = require("../middleware/authMiddleware");
const authorizeAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// All routes here are admin only
router.get("/", authenticateUser, authorizeAdmin, getUsers);
router.delete("/:id", authenticateUser, authorizeAdmin, deleteUser);

module.exports = router;
