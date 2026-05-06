const Project = require("../models/project");

// Create Project (Admin only)
exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: members || [],
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all projects for current user
exports.getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === "Admin") {
      projects = await Project.find({ admin: req.user._id }).populate("members", "name email");
    } else {
      projects = await Project.find({ members: req.user._id }).populate("admin", "name email");
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Project (Admin only)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this project" });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Project (Admin only)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }

    await project.deleteOne();
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
