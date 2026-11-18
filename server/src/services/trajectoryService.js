const prisma = require("../config/database");
const { simulateTrajectoryWithGemini } = require("./geminiTrajectoryService");

/**
 * Service managing career profiles, simulations, and milestone roadmaps
 */

// ---------------------------------------------------------------------------
// 1. Profile Management
// ---------------------------------------------------------------------------

async function getProfile(userId) {
  const profile = await prisma.careerProfile.findUnique({
    where: { userId },
  });

  return profile;
}

async function upsertProfile(userId, profileData) {
  const cleanTitle = (profileData.currentTitle || "").trim() || null;
  const expYears = profileData.experienceYears != null && !isNaN(Number(profileData.experienceYears))
    ? Number(profileData.experienceYears)
    : null;

  const education = Array.isArray(profileData.education) ? profileData.education : [];
  const skills = Array.isArray(profileData.skills) ? profileData.skills : [];
  const projects = Array.isArray(profileData.projects) ? profileData.projects : [];
  const experience = Array.isArray(profileData.experience) ? profileData.experience : [];
  const interests = Array.isArray(profileData.interests) ? profileData.interests : [];

  const profile = await prisma.careerProfile.upsert({
    where: { userId },
    update: {
      currentTitle: cleanTitle,
      experienceYears: expYears,
      education,
      skills,
      projects,
      experience,
      interests,
    },
    create: {
      userId,
      currentTitle: cleanTitle,
      experienceYears: expYears,
      education,
      skills,
      projects,
      experience,
      interests,
    },
  });

  return profile;
}

/**
 * Extracts preview information from the user's latest ResumeAnalysis.
 * DOES NOT save or overwrite the profile. Returns a preview only.
 */
async function previewResumeImport(userId) {
  const latestResume = await prisma.resumeAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!latestResume) {
    const error = new Error(
      "No previous resume analysis found to import from. Please upload and tailor a resume first, or manually enter your profile details."
    );
    error.statusCode = 404;
    throw error;
  }

  // Parse imported skills from matchingSkills and keyStrengths
  const importedSkills = [];
  const seenSkillNames = new Set();

  (latestResume.matchingSkills || []).forEach((skillName) => {
    const trimmed = String(skillName).trim();
    if (trimmed && !seenSkillNames.has(trimmed.toLowerCase())) {
      seenSkillNames.add(trimmed.toLowerCase());
      importedSkills.push({
        name: trimmed,
        category: "Technical",
        level: "Intermediate",
      });
    }
  });

  const previewData = {
    currentTitle: latestResume.jobTitle || "",
    experienceYears: null,
    education: [],
    skills: importedSkills,
    projects: [],
    experience: [],
    interests: [],
    importedFrom: {
      resumeId: latestResume.id,
      filename: latestResume.filename,
      jobTitle: latestResume.jobTitle,
      analysisDate: latestResume.createdAt,
    },
    notice:
      "This is an uncommitted preview extracted from your verified resume. Your existing profile has not been changed. You may review and edit this data before saving.",
  };

  return previewData;
}

// ---------------------------------------------------------------------------
// 2. Trajectory Simulator
// ---------------------------------------------------------------------------

async function simulateTrajectory({ userId, profileData, targetRole, targetTimeframe, currentLevel }) {
  const cleanTargetRole = (targetRole || "").trim();
  const cleanTimeframe = (targetTimeframe || "12 months").trim();
  const cleanLevel = (currentLevel || "Mid-Level").trim();

  if (!cleanTargetRole) {
    const error = new Error("Target role is required");
    error.statusCode = 400;
    throw error;
  }

  // Use provided profileData or retrieve existing profile from database
  let profile = profileData;
  if (!profile || (!profile.skills?.length && !profile.education?.length && !profile.projects?.length)) {
    const savedProfile = await prisma.careerProfile.findUnique({ where: { userId } });
    if (savedProfile) {
      profile = savedProfile;
    }
  }

  if (!profile || (!profile.skills?.length && !profile.education?.length && !profile.projects?.length && !profile.currentTitle)) {
    const error = new Error(
      "A career profile with at least some skills, education, or experience is required to run a realistic simulation. Please complete your profile first."
    );
    error.statusCode = 400;
    throw error;
  }

  // 1. Call Gemini Trajectory Service
  const simulation = await simulateTrajectoryWithGemini({
    profile,
    targetRole: cleanTargetRole,
    targetTimeframe: cleanTimeframe,
    currentLevel: cleanLevel,
  });

  // 2. Persist CareerTrajectory and relational Milestones in Neon PostgreSQL
  const savedTrajectory = await prisma.careerTrajectory.create({
    data: {
      userId,
      targetRole: cleanTargetRole,
      targetTimeframe: cleanTimeframe,
      currentLevel: cleanLevel,
      readinessScore: simulation.readinessScore,
      readinessBreakdown: simulation.readinessBreakdown,
      skillGaps: simulation.skillGaps,
      progressionPaths: simulation.progressionPaths,
      status: "ACTIVE",
      milestones: {
        create: simulation.milestones.map((m) => ({
          order: m.order,
          phase: m.phase,
          title: m.title,
          description: m.description,
          learningObjectives: m.learningObjectives,
          requiredSkills: m.requiredSkills,
          estimatedEffort: m.estimatedEffort,
          practicalProject: m.practicalProject,
          deliverables: m.deliverables,
          completionCriteria: m.completionCriteria,
          status: "NOT_STARTED",
        })),
      },
    },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  return savedTrajectory;
}

// ---------------------------------------------------------------------------
// 3. Trajectory & Milestone Read / Update / Delete
// ---------------------------------------------------------------------------

async function listTrajectories(userId) {
  const trajectories = await prisma.careerTrajectory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      milestones: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  // Attach progress metrics
  return trajectories.map((traj) => {
    const total = traj.milestones.length;
    const completed = traj.milestones.filter((m) => m.status === "COMPLETED").length;
    const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: traj.id,
      targetRole: traj.targetRole,
      targetTimeframe: traj.targetTimeframe,
      currentLevel: traj.currentLevel,
      readinessScore: traj.readinessScore,
      status: traj.status,
      milestonesCount: total,
      completedMilestonesCount: completed,
      progressPercentage,
      createdAt: traj.createdAt,
      updatedAt: traj.updatedAt,
    };
  });
}

async function getTrajectoryById(userId, trajectoryId) {
  const numericId = parseInt(trajectoryId, 10);
  if (isNaN(numericId)) {
    const error = new Error("Invalid trajectory ID");
    error.statusCode = 400;
    throw error;
  }

  const trajectory = await prisma.careerTrajectory.findUnique({
    where: { id: numericId },
    include: {
      milestones: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!trajectory) {
    const error = new Error("Career trajectory not found");
    error.statusCode = 404;
    throw error;
  }

  if (trajectory.userId !== userId) {
    const error = new Error("Access denied: You do not own this trajectory");
    error.statusCode = 403;
    throw error;
  }

  const total = trajectory.milestones.length;
  const completed = trajectory.milestones.filter((m) => m.status === "COMPLETED").length;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    ...trajectory,
    progressPercentage,
    completedMilestonesCount: completed,
  };
}

async function updateMilestone({ userId, trajectoryId, milestoneId, status, userNotes }) {
  const numTrajId = parseInt(trajectoryId, 10);
  const numMilestoneId = parseInt(milestoneId, 10);

  if (isNaN(numTrajId) || isNaN(numMilestoneId)) {
    const error = new Error("Invalid trajectory or milestone ID");
    error.statusCode = 400;
    throw error;
  }

  // Verify ownership of the parent trajectory
  const trajectory = await prisma.careerTrajectory.findUnique({
    where: { id: numTrajId },
  });

  if (!trajectory) {
    const error = new Error("Career trajectory not found");
    error.statusCode = 404;
    throw error;
  }

  if (trajectory.userId !== userId) {
    const error = new Error("Access denied: You do not own this trajectory");
    error.statusCode = 403;
    throw error;
  }

  // Verify milestone exists and belongs to trajectory
  const milestone = await prisma.trajectoryMilestone.findUnique({
    where: { id: numMilestoneId },
  });

  if (!milestone || milestone.trajectoryId !== numTrajId) {
    const error = new Error("Milestone not found in this trajectory");
    error.statusCode = 404;
    throw error;
  }

  // Validate allowed status values
  const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
  const updateData = {};

  if (status !== undefined) {
    if (!validStatuses.includes(status)) {
      const error = new Error(`Invalid milestone status. Allowed: ${validStatuses.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }
    updateData.status = status;
    updateData.completedAt = status === "COMPLETED" ? new Date() : null;
  }

  if (userNotes !== undefined) {
    updateData.userNotes = typeof userNotes === "string" ? userNotes.trim() : null;
  }

  const updatedMilestone = await prisma.trajectoryMilestone.update({
    where: { id: numMilestoneId },
    data: updateData,
  });

  return updatedMilestone;
}

async function deleteTrajectory(userId, trajectoryId) {
  const numericId = parseInt(trajectoryId, 10);
  if (isNaN(numericId)) {
    const error = new Error("Invalid trajectory ID");
    error.statusCode = 400;
    throw error;
  }

  const trajectory = await prisma.careerTrajectory.findUnique({
    where: { id: numericId },
  });

  if (!trajectory) {
    const error = new Error("Career trajectory not found");
    error.statusCode = 404;
    throw error;
  }

  if (trajectory.userId !== userId) {
    const error = new Error("Access denied: You do not own this trajectory");
    error.statusCode = 403;
    throw error;
  }

  await prisma.careerTrajectory.delete({
    where: { id: numericId },
  });

  return { message: "Career trajectory deleted successfully" };
}

module.exports = {
  getProfile,
  upsertProfile,
  previewResumeImport,
  simulateTrajectory,
  listTrajectories,
  getTrajectoryById,
  updateMilestone,
  deleteTrajectory,
};
