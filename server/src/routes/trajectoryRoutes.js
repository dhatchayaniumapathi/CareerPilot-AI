const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const trajectoryController = require("../controllers/trajectoryController");
const {
  validateProfile,
  validateSimulate,
  validateMilestoneUpdate,
} = require("../middleware/validateTrajectory");

const router = express.Router();

// All trajectory and career profile routes are protected by JWT authentication
router.use(authMiddleware);

// --- Career Profile Routes ---
router.get("/profile", trajectoryController.getProfile);
router.put("/profile", validateProfile, trajectoryController.updateProfile);
router.post("/profile/import-resume", trajectoryController.importResume);

// --- Career Trajectory Simulator & Roadmap Routes ---
router.post("/simulate", validateSimulate, trajectoryController.simulate);
router.get("/", trajectoryController.listTrajectories);
router.get("/:id", trajectoryController.getTrajectoryById);
router.patch("/:id/milestones/:milestoneId", validateMilestoneUpdate, trajectoryController.updateMilestone);
router.delete("/:id", trajectoryController.deleteTrajectory);

module.exports = router;
