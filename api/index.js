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

// quick static endpoints that should NOT block on DB
app.get("/api/health", (req, res) => res.json({ message: "API is healthy" }));
app.get("/", (req, res) => res.json({ message: "Server is running!" }));

// DB connect middleware (serverless-safe)
// skip DB connect for favicon; connect once per warm instance
let dbConnected = false;
app.use(async (req, res, next) => {
  // Avoid blocking on trivial requests
  if (req.path === "/favicon.ico") return res.status(204).end();

  if (dbConnected) return next();

  try {
    await connectDB(); // will fail fast if misconfigured
    dbConnected = true;
    console.log("MongoDB connected (cold start)");
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message || err);
    // Respond quickly with an error to avoid long hanging
    return res.status(500).json({
      message: "Database connection failed",
      error: err.message || String(err),
    });
  }
});

// register routes (they assume DB is connected or returned error above)
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// 404 Handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

module.exports = serverless(app);
