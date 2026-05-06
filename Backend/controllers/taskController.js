const Task = require("../models/task");
const Project = require("../models/project");
const User = require("../models/user");
const sendEmail = require("../utils/emailService");

// Create Task (Admin of the project only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (projectDoc.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to add tasks to this project" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      dueDate,
    });

    // Notify the assigned member
    try {
      const assignedUser = await User.findById(assignedTo);
      if (assignedUser && assignedUser.email) {
        await sendEmail({
          email: assignedUser.email,
          subject: `New Task Assigned: ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <h2>Hello ${assignedUser.name},</h2>
              <p>You have been assigned a new task in project <strong>${projectDoc.name}</strong>.</p>
              <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${title}</h3>
                <p>${description}</p>
                <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
              </div>
              <p>Please log in to the TeamTask Manager to update your progress.</p>
              <br>
              <p>Best regards,<br>TeamTask System</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // We don't return an error to the user since the task was created successfully
    }

    res.status(201).json(task);
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Tasks for a project
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get My Tasks
exports.getMyTasks = async (req, res) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const tasks = await Task.find(query).populate("project", "name").populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Task Status (Assigned user or Admin)
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const isAdmin = task.project.admin.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Task (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("project");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    let query = {};

    if (req.user.role === "Member") {
      query = { assignedTo: userId };
    } else {
      const projects = await Project.find({ admin: userId }).select("_id");
      const projectIds = projects.map(p => p._id);
      query = { project: { $in: projectIds } };
    }

    const totalTasks = await Task.countDocuments(query);
    const completedTasks = await Task.countDocuments({ ...query, status: "Completed" });
    const pendingTasks = await Task.countDocuments({ ...query, status: { $ne: "Completed" } });
    const overdueTasks = await Task.countDocuments({ ...query, status: { $ne: "Completed" }, dueDate: { $lt: new Date() } });

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
