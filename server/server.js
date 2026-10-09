
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

// Start server after connecting to MongoDB
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
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