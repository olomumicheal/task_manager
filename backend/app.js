const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const fs = require("fs"); // Added for checking frontend build
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const profileRoutes = require("./routes/profileRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const mongoUrl = process.env.MONGODB_URL;
mongoose.connect(mongoUrl)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/profile", profileRoutes);

// Deployment Check Route
app.get("/status", (req, res) => {
  res.json({
    message: "API is live and running!",
    environment: process.env.NODE_ENV || "development",
    time: new Date().toISOString()
  });
});

// Default Route (For Basic Testing)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Serve Frontend in Production
const frontendPath = path.resolve(__dirname, "../frontend/build");
if (process.env.NODE_ENV === "production" && fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => res.sendFile(path.join(frontendPath, "index.html")));
} else {
  console.log("Frontend build not found. Skipping static file serving.");
}

// 404 Middleware
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Backend successfully deployed and running on port ${port}`);
});
