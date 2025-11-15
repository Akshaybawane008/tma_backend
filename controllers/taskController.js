// controllers/taskController.js
const Task = require("../models/Task");

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    console.log("Fetching tasks for user:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - no user" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments({ createdBy: userId });

    return res.json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
    });
  } catch (error) {
    console.error("Error in getTasks:", error.message || error);
    res.status(500).json({ message: "Server error", error: error.message || String(error) });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, status } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description required" });
    }

    const task = new Task({ title, description, status, createdBy: userId });
    await task.save();

    return res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error.message || error);
    res.status(500).json({ message: "Server error", error: error.message || String(error) });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const task = await Task.findOne({ _id: req.params.id, createdBy: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { title, description, status } = req.body;
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;

    await task.save();
    return res.json(task);
  } catch (error) {
    console.error("Error updating task:", error.message || error);
    res.status(500).json({ message: "Server error", error: error.message || String(error) });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const task = await Task.findOne({ _id: req.params.id, createdBy: userId });
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Task.findByIdAndDelete(task._id);
    return res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error.message || error);
    res.status(500).json({ message: "Server error", error: error.message || String(error) });
  }
};

// GET /api/tasks/admin (optional admin view)
exports.getAllTasksForAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments();

    return res.json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total,
    });
  } catch (error) {
    console.error("Error in getAllTasksForAdmin:", error.message || error);
    res.status(500).json({ message: "Server error", error: error.message || String(error) });
  }
};
