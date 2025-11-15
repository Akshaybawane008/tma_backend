// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getTasks, createTask, updateTask, deleteTask, getAllTasksForAdmin
} = require("../controllers/taskController");

router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

// admin route (protected)
router.get("/admin", authMiddleware, adminMiddleware, getAllTasksForAdmin);

module.exports = router;
