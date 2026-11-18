const resumeService = require("../services/resumeService");

/**
 * Controller to tailor resume against a job description
 * POST /api/resume/tailor
 */
async function tailor(req, res, next) {
  try {
    const { jobTitle, jobDescription } = req.body;
    const file = req.file;
    const userId = req.user.id;

    const result = await resumeService.tailorResumeForUser({
      userId,
      file,
      jobTitle,
      jobDescription,
    });

    return res.status(201).json({
      status: "success",
      message: "Resume tailored and analyzed successfully",
      data: result,
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

/**
 * Controller to fetch user's analysis history
 * GET /api/resume/history
 */
async function getHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const history = await resumeService.getHistoryForUser(userId);

    return res.status(200).json({
      status: "success",
      data: {
        history,
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

/**
 * Controller to fetch specific analysis details
 * GET /api/resume/:id
 */
async function getById(req, res, next) {
  try {
    const userId = req.user.id;
    const analysisId = req.params.id;

    const analysis = await resumeService.getAnalysisById(userId, analysisId);

    return res.status(200).json({
      status: "success",
      data: {
        analysis,
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

/**
 * Controller to delete an analysis
 * DELETE /api/resume/:id
 */
async function deleteRecord(req, res, next) {
  try {
    const userId = req.user.id;
    const analysisId = req.params.id;

    const result = await resumeService.deleteAnalysis(userId, analysisId);

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
  tailor,
  getHistory,
  getById,
  deleteRecord,
};
