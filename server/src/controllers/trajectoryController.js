const trajectoryService = require("../services/trajectoryService");

/**
 * Controller for Career Profile and Trajectory Simulator
 */

// ---------------------------------------------------------------------------
// Profile Handlers
// ---------------------------------------------------------------------------

async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const profile = await trajectoryService.getProfile(userId);

    return res.status(200).json({
      status: "success",
      data: {
        profile,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const profile = await trajectoryService.upsertProfile(userId, req.body);

    return res.status(200).json({
      status: "success",
      message: "Career profile updated successfully",
      data: {
        profile,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

async function importResume(req, res, next) {
  try {
    const userId = req.user.id;
    const preview = await trajectoryService.previewResumeImport(userId);

    return res.status(200).json({
      status: "success",
      message: "Resume data extracted for preview. This data has not been saved yet.",
      data: preview,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Simulation Handlers
// ---------------------------------------------------------------------------

async function simulate(req, res, next) {
  try {
    const userId = req.user.id;
    const { profile, targetRole, targetTimeframe, currentLevel } = req.body;

    const trajectory = await trajectoryService.simulateTrajectory({
      userId,
      profileData: profile,
      targetRole,
      targetTimeframe,
      currentLevel,
    });

    return res.status(201).json({
      status: "success",
      message: "Career trajectory simulated and roadmap generated successfully",
      data: {
        trajectory,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

// ---------------------------------------------------------------------------
// Trajectory & Milestone Handlers
// ---------------------------------------------------------------------------

async function listTrajectories(req, res, next) {
  try {
    const userId = req.user.id;
    const trajectories = await trajectoryService.listTrajectories(userId);

    return res.status(200).json({
      status: "success",
      data: {
        trajectories,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

async function getTrajectoryById(req, res, next) {
  try {
    const userId = req.user.id;
    const trajectoryId = req.params.id;

    const trajectory = await trajectoryService.getTrajectoryById(userId, trajectoryId);

    return res.status(200).json({
      status: "success",
      data: {
        trajectory,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

async function updateMilestone(req, res, next) {
  try {
    const userId = req.user.id;
    const { id: trajectoryId, milestoneId } = req.params;
    const { status, userNotes } = req.body;

    const updatedMilestone = await trajectoryService.updateMilestone({
      userId,
      trajectoryId,
      milestoneId,
      status,
      userNotes,
    });

    return res.status(200).json({
      status: "success",
      message: "Milestone updated successfully",
      data: {
        milestone: updatedMilestone,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

async function deleteTrajectory(req, res, next) {
  try {
    const userId = req.user.id;
    const trajectoryId = req.params.id;

    const result = await trajectoryService.deleteTrajectory(userId, trajectoryId);

    return res.status(200).json({
      status: "success",
      message: result.message,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  importResume,
  simulate,
  listTrajectories,
  getTrajectoryById,
  updateMilestone,
  deleteTrajectory,
};
