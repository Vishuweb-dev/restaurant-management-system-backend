// One-time script to safely create the first admin account.
// Run with: npm run seed:admin
// This is intentionally NOT an API route, so the public cannot create admins.

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error("ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existingAdmin) {
      console.log("An admin with this email already exists. No changes made.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    console.log(`Admin account created for ${ADMIN_EMAIL}`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
