const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", authorize("Admin"), createProject);
router.get("/", getProjects);
router.put("/:id", authorize("Admin"), updateProject);
router.delete("/:id", authorize("Admin"), deleteProject);

module.exports = router;
