// middleware/adminMiddleware.js
// Requires authMiddleware to have run before this
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - no user" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    return next();
  } catch (error) {
    console.error("adminMiddleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminMiddleware;