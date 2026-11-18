const prisma = require("../config/database");
const { extractTextFromPdf } = require("../utils/pdfExtractor");
const { analyzeAndTailorWithGemini } = require("./geminiService");

/**
 * Tailors an uploaded resume for a specific job description and persists the record
 */
async function tailorResumeForUser({ userId, file, jobTitle, jobDescription }) {
  if (!file || !file.buffer) {
    const error = new Error("Resume PDF file is required");
    error.statusCode = 400;
    throw error;
  }

  const cleanJobTitle = (jobTitle || "").trim();
  const cleanJobDescription = (jobDescription || "").trim();

  if (!cleanJobTitle) {
    const error = new Error("Target job title is required");
    error.statusCode = 400;
    throw error;
  }

  if (!cleanJobDescription || cleanJobDescription.length < 50) {
    const error = new Error(
      "Target job description is required and must be at least 50 characters long"
    );
    error.statusCode = 400;
    throw error;
  }

  // 1. Extract and clean text from uploaded PDF
  const { text: resumeText } = await extractTextFromPdf(file.buffer);

  // 2. Perform AI analysis & tailoring using Gemini
  const aiResult = await analyzeAndTailorWithGemini({
    resumeText,
    jobTitle: cleanJobTitle,
    jobDescription: cleanJobDescription,
  });

  // 3. Persist analysis history linked to authenticated user
  const savedAnalysis = await prisma.resumeAnalysis.create({
    data: {
      userId,
      jobTitle: cleanJobTitle,
      jobDescription: cleanJobDescription,
      originalResumeText: resumeText,
      filename: file.originalname || "resume.pdf",
      matchScore: aiResult.matchScore,
      scoreBreakdown: aiResult.scoreBreakdown,
      matchingSkills: aiResult.matchingSkills,
      missingSkills: aiResult.missingSkills,
      keyStrengths: aiResult.keyStrengths,
      tailoringSuggestions: aiResult.tailoringSuggestions,
      tailoredSummary: aiResult.tailoredSummary,
      tailoredBulletPoints: aiResult.tailoredBulletPoints,
    },
  });

  return savedAnalysis;
}

/**
 * Returns analysis history for an authenticated user
 */
async function getHistoryForUser(userId) {
  const history = await prisma.resumeAnalysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      jobTitle: true,
      filename: true,
      matchScore: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return history;
}

/**
 * Retrieves a single analysis record by ID, verifying user ownership
 */
async function getAnalysisById(userId, analysisId) {
  const numericId = parseInt(analysisId, 10);
  if (isNaN(numericId)) {
    const error = new Error("Invalid analysis ID provided");
    error.statusCode = 400;
    throw error;
  }

  const analysis = await prisma.resumeAnalysis.findUnique({
    where: { id: numericId },
  });

  if (!analysis) {
    const error = new Error("Resume analysis record not found");
    error.statusCode = 404;
    throw error;
  }

  if (analysis.userId !== userId) {
    const error = new Error("Access denied: You do not own this analysis record");
    error.statusCode = 403;
    throw error;
  }

  return analysis;
}

/**
 * Deletes an analysis record, verifying user ownership
 */
async function deleteAnalysis(userId, analysisId) {
  const numericId = parseInt(analysisId, 10);
  if (isNaN(numericId)) {
    const error = new Error("Invalid analysis ID provided");
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.resumeAnalysis.findUnique({
    where: { id: numericId },
  });

  if (!existing) {
    const error = new Error("Resume analysis record not found");
    error.statusCode = 404;
    throw error;
  }

  if (existing.userId !== userId) {
    const error = new Error("Access denied: You do not own this analysis record");
    error.statusCode = 403;
    throw error;
  }

  await prisma.resumeAnalysis.delete({
    where: { id: numericId },
  });

  return { message: "Analysis record deleted successfully" };
}

module.exports = {
  tailorResumeForUser,
  getHistoryForUser,
  getAnalysisById,
  deleteAnalysis,
};
