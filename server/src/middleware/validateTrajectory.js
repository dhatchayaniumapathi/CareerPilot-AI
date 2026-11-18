/**
 * Validation middleware for Career Trajectory Simulator endpoints
 */

function validateProfile(req, res, next) {
  const { currentTitle, experienceYears, education, skills, projects, experience, interests } = req.body || {};
  const errors = [];

  if (currentTitle !== undefined && currentTitle !== null) {
    if (typeof currentTitle !== "string") {
      errors.push("currentTitle must be a string");
    } else if (currentTitle.trim().length > 120) {
      errors.push("currentTitle cannot exceed 120 characters");
    }
  }

  if (experienceYears !== undefined && experienceYears !== null && experienceYears !== "") {
    const num = Number(experienceYears);
    if (isNaN(num) || num < 0 || num > 60) {
      errors.push("experienceYears must be a valid number between 0 and 60");
    }
  }

  if (education !== undefined && !Array.isArray(education)) {
    errors.push("education must be an array of education records");
  }

  if (skills !== undefined && !Array.isArray(skills)) {
    errors.push("skills must be an array of skill objects");
  }

  if (projects !== undefined && !Array.isArray(projects)) {
    errors.push("projects must be an array of project objects");
  }

  if (experience !== undefined && !Array.isArray(experience)) {
    errors.push("experience must be an array of experience objects");
  }

  if (interests !== undefined && !Array.isArray(interests)) {
    errors.push("interests must be an array of strings");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  next();
}

function validateSimulate(req, res, next) {
  const { targetRole, targetTimeframe, currentLevel } = req.body || {};
  const errors = [];

  if (!targetRole || typeof targetRole !== "string" || targetRole.trim().length === 0) {
    errors.push("targetRole is required and must be a non-empty string");
  } else if (targetRole.trim().length > 100) {
    errors.push("targetRole cannot exceed 100 characters");
  }

  if (targetTimeframe !== undefined && targetTimeframe !== null) {
    if (typeof targetTimeframe !== "string" || targetTimeframe.trim().length > 60) {
      errors.push("targetTimeframe must be a string with maximum 60 characters");
    }
  }

  if (currentLevel !== undefined && currentLevel !== null) {
    if (typeof currentLevel !== "string" || currentLevel.trim().length > 60) {
      errors.push("currentLevel must be a string with maximum 60 characters");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  next();
}

function validateMilestoneUpdate(req, res, next) {
  const { status, userNotes } = req.body || {};
  const errors = [];
  const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

  if (status !== undefined && !validStatuses.includes(status)) {
    errors.push(`status must be one of: ${validStatuses.join(", ")}`);
  }

  if (userNotes !== undefined && userNotes !== null) {
    if (typeof userNotes !== "string") {
      errors.push("userNotes must be a string or null");
    } else if (userNotes.length > 2000) {
      errors.push("userNotes cannot exceed 2000 characters");
    }
  }

  if (status === undefined && userNotes === undefined) {
    errors.push("At least one field (status or userNotes) must be provided to update milestone");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  next();
}

module.exports = {
  validateProfile,
  validateSimulate,
  validateMilestoneUpdate,
};
