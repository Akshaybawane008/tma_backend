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

// Quick health routes that should NOT block on DB
app.get("/api/health", (req, res) => res.json({ message: "API is healthy" }));
app.get("/", (req, res) => res.json({ message: "Server is running!" }));

// DB connect middleware (serverless-safe)
// skip favicon and connect only once per warm instance
let dbConnected = false;

app.use(async (req, res, next) => {
  if (req.path === "/favicon.ico") return res.status(204).end();

  if (dbConnected) return next();

  try {
    await connectDB(); // will throw a descriptive error if MONGO_URI missing
    dbConnected = true;
    console.log("MongoDB connected (cold start)");
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message || err);
    // Respond quickly with JSON error (prevents function crashing)
    return res.status(500).json({
      message: "Database connection failed",
      error: err.message || String(err)
    });
  }
});

// Register routes (they assume DB is connected once middleware passed)
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = serverless(app);
