// controllers/taskController.js
const mongoose = require("mongoose");
const Task = require("../models/Task");

const VALID_STATUSES = ["Pending", "Completed"];
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

exports.getTasks = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized - no user" });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find({ createdBy: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Task.countDocuments({ createdBy: userId })
    ]);

    return res.json({
      tasks,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalTasks: total,
    });
  } catch (error) {
    console.error("Error in getTasks:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { title, description, status } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description required" });

    const normalizedStatus = status && VALID_STATUSES.includes(status) ? status : "Pending";
    const task = new Task({
      title: String(title).trim(),
      description: String(description).trim(),
      status: normalizedStatus,
      createdBy: userId,
    });

    await task.save();
    return res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findOne({ _id: id, createdBy: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { title, description, status } = req.body;
    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (status !== undefined && VALID_STATUSES.includes(status)) task.status = status;

    await task.save();
    return res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    if (!isValidObjectId(id)) return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findOne({ _id: id, createdBy: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.findByIdAndDelete(task._id);
    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllTasksForAdmin = async (req, res) => {
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ message: "Access denied. Admin only." });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find().populate("createdBy", "name email").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Task.countDocuments()
    ]);

    return res.json({
      tasks,
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalTasks: total,
    });
  } catch (error) {
    console.error("Error in getAllTasksForAdmin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
