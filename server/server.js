
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get("/", (req, res) => {
  res.send("TaskFlow API is running!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TaskFlow server is healthy",
  });
});


// Task CRUD routes
app.use("/api/tasks", taskRoutes);

// 404 handler — catches requests that don't match any route
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
// Must have exactly four parameters for Express to recognize it.
app.use((err, req, res, next) => {
  // Log full error details on the server, never in the response.
  console.error(
    `[Error] ${req.method} ${req.originalUrl} —`,
    err
  );

  // Accept only valid HTTP error status codes.
  const rawStatus = err.statusCode ?? err.status;

  const statusCode =
    Number.isInteger(rawStatus) &&
    rawStatus >= 400 &&
    rawStatus <= 599
      ? rawStatus
      : 500;

  // Return client-error messages for 4xx errors.
  // Hide internal details for all 5xx errors.
  const message =
    statusCode < 500
      ? err.message
      : "An unexpected error occurred. Please try again.";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Start the server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the environment configuration.");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`TaskFlow server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();