const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasks,
  getMyTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/stats", getDashboardStats);
router.get("/my", getMyTasks);
router.post("/", authorize("Admin"), createTask);
router.get("/project/:projectId", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", authorize("Admin"), deleteTask);

module.exports = router;
