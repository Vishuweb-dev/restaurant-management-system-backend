require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Allowed frontend origins
const allowedOrigins = [
  "https://restaurant-management-system-fronte-kohl.vercel.app",
  "http://localhost:5173",
];
// CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(`CORS blocked for origin: ${origin}`)
      );
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "TastyBites API is running.",
  });
});

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/menu-items", menuRoutes);

app.use("/api/users", userRoutes);

app.use("/api/dashboard", dashboardRoutes);

// Error handling
app.use(notFound);

app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});