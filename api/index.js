// api/index.js
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const connectDB = require("../config/db");

const authRoutes = require("../routes/authRoutes");
const taskRoutes = require("../routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health + quick static routes that should NOT block on DB
app.get("/api/health", (req, res) => res.json({ message: "API is healthy" }));
app.get("/", (req, res) => res.json({ message: "Server is running!" }));

// DB connect middleware (serverless-safe)
let dbConnected = false;
app.use(async (req, res, next) => {
  // skip DB connect for static-ish requests to reduce overhead
  if (req.path === "/favicon.ico") return res.status(204).end();

  if (dbConnected) return next();

  try {
    await connectDB(); // will fail fast due to serverSelectionTimeoutMS
    dbConnected = true;
    console.log("MongoDB connected (cold start)");
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message || err);
    // return a concise error so function terminates quickly — do NOT hang
    return res.status(500).json({ message: "Database connection failed", error: err.message || err });
  }
});

// Routes that require auth will still use auth middleware
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = serverless(app);
