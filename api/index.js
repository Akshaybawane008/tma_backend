const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const connectDB = require("../config/db");

const authRoutes = require("../routes/authRoutes");
const taskRoutes = require("../routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Connect DB only once (serverless safe)
let dbConnected = false;
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
      console.log("MongoDB connected (cold start)");
    } catch (err) {
      return res.status(500).json({ message: "DB connection failed", error: err.message });
    }
  }
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Server is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = serverless(app);