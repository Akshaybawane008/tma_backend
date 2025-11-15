// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    const raw = req.header("Authorization");
    const token = raw ? raw.replace("Bearer ", "") : null;

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      console.warn("JWT verification failed:", err.message);
      return res.status(401).json({ message: "Token is not valid" });
    }

    // Attach user (without password) to req. If user not found -> unauthorized.
    const user = await User.findById(decoded.userId).select("-password").lean();
    if (!user) {
      return res.status(401).json({ message: "User not found or token invalid" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("authMiddleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = authMiddleware;
