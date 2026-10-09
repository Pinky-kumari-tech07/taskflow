
const express = require("express");
const cors = require("cors");
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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}`, err);

  const rawStatus = err.statusCode ?? err.status;
  const statusCode =
    Number.isInteger(rawStatus) &&
    rawStatus >= 400 &&
    rawStatus <= 599
      ? rawStatus
      : 500;

  const message =
    statusCode < 500
      ? err.message
      : "An unexpected error occurred. Please try again.";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;