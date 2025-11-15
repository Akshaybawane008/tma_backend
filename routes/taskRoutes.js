const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getAllTasksForAdmin,
} = require("../controllers/taskController");

// ✅ Base route: /api/tasks
router.get("/", authMiddleware, getTasks);
router.post("/", authMiddleware, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware, deleteTask);

// (Optional) For admins
router.get("/admin", authMiddleware, getAllTasksForAdmin);

module.exports = router;
