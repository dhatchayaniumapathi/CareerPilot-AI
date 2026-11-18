const { GoogleGenAI } = require("@google/genai");

/**
 * Service to interface with Google Gemini API for Career Trajectory Simulation
 */
async function simulateTrajectoryWithGemini({ profile, targetRole, targetTimeframe, currentLevel }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error(
      "GEMINI_API_KEY is not configured on the server. Please set your Gemini API key in the server environment."
    );
    error.statusCode = 503;
    throw error;
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

  const systemInstruction = `You are a Principal Software Architect, Engineering Director, and Career Systems Advisor for CareerPilot AI.
Your objective is to provide a practical, rigorous, milestone-driven career roadmap and trajectory analysis for an engineer targeting a specific role.

CRITICAL RULES AND GROUNDING CONSTRAINTS:
1. NO FABRICATION OF GUARANTEES: Never promise guaranteed employment, hiring probability, specific salary figures, or fabricated labor market statistics.
2. TRANSPARENT ESTIMATION: The readiness score must be clearly labeled as an estimated benchmark (0-100) comparing the user's current demonstrated competencies against typical industry expectations for the target role.
3. STRUCTURED MILESTONES: Generate between 3 and 5 sequential, realistic milestones spanning the target timeframe. Every single milestone MUST include all six required fields:
   - phase: string (e.g. "Phase 1: Months 1-3")
   - title: string
   - description: string
   - learningObjectives: array of strings
   - requiredSkills: array of strings
   - estimatedEffort: string (e.g. "3-4 weeks (8-10 hrs/week)")
   - practicalProject: object with title, description, and deliverables
   - deliverables: array of strings
   - completionCriteria: array of strings
4. ACTIONABLE PORTFOLIO PROJECTS: Suggested practical projects must be realistic engineering applications (e.g., building a distributed rate limiter, an event-driven analytics pipeline, a multi-tenant auth service), not toy tutorials.
5. SKILL GAP PRIORITIZATION: Categorize gaps into:
   - highPriority: Critical blockers and core architectural prerequisites.
   - mediumPriority: Key operational tooling, production practices, and frameworks.
   - lowPriority: Complementary skills and future-proofing.
6. PROGRESSION PATHS: Map realistic progressive career stages from their current baseline to the target role and immediate next trajectory.

You MUST respond with a single, valid JSON object strictly matching this schema:
{
  "readinessScore": number,
  "readinessBreakdown": {
    "skillsCoverage": number,
    "experienceDepth": number,
    "projectPortfolio": number,
    "calculationExplanation": string
  },
  "skillGaps": {
    "highPriority": [
      { "skill": string, "reason": string }
    ],
    "mediumPriority": [
      { "skill": string, "reason": string }
    ],
    "lowPriority": [
      { "skill": string, "reason": string }
    ]
  },
  "progressionPaths": [
    {
      "step": number,
      "role": string,
      "timeframe": string,
      "focusArea": string
    }
  ],
  "milestones": [
    {
      "order": number,
      "phase": string,
      "title": string,
      "description": string,
      "learningObjectives": [string],
      "requiredSkills": [string],
      "estimatedEffort": string,
      "practicalProject": {
        "title": string,
        "description": string,
        "deliverables": [string]
      },
      "deliverables": [string],
      "completionCriteria": [string]
    }
  ]
}`;

  const prompt = `CURRENT USER CAREER PROFILE:
- Current Title: ${profile.currentTitle || "Not specified"}
- Years of Experience: ${profile.experienceYears != null ? profile.experienceYears : "Not specified"}
- Education: ${JSON.stringify(profile.education || [])}
- Skills: ${JSON.stringify(profile.skills || [])}
- Projects: ${JSON.stringify(profile.projects || [])}
- Past Experience / Internships: ${JSON.stringify(profile.experience || [])}
- Interests: ${JSON.stringify(profile.interests || [])}

TARGET ROLE OBJECTIVES:
- Target Role: ${targetRole}
- Target Timeframe: ${targetTimeframe || "12 months"}
- Self-Assessed Current Level: ${currentLevel || "Mid-Level"}

Perform a comprehensive gap analysis and construct an actionable career trajectory simulation following the exact JSON schema.`;

  const maxAttempts = 4;
  const backoffs = [2500, 4500, 7500];
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text ? response.text.trim() : "";
      if (!responseText) {
        throw new Error("Empty response received from Gemini API");
      }

      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const cleanJson = responseText.replace(/^```json/m, "").replace(/```$/m, "").trim();
        parsedData = JSON.parse(cleanJson);
      }

      // Defensive validation and normalization
      const validatedData = normalizeAndValidateSimulation(parsedData, targetRole, targetTimeframe);
      return validatedData;
    } catch (err) {
      lastError = err;
      const errMsg = err.message || "";
      const isTransient =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isTransient && attempt < maxAttempts) {
        const delay = backoffs[attempt - 1] || 5000;
        console.warn(`[GeminiTrajectory] Transient error on attempt ${attempt}. Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (err.statusCode) throw err;
      const error = new Error(`Career Trajectory Simulation failed: ${errMsg}`);
      error.statusCode = 502;
      throw error;
    }
  }
}

/**
 * Normalizes and validates the AI response against all mandatory schema fields
 */
function normalizeAndValidateSimulation(data, targetRole, targetTimeframe) {
  const readinessScore = Math.max(0, Math.min(100, Math.round(Number(data.readinessScore) || 50)));

  const readinessBreakdown = {
    skillsCoverage: Math.max(0, Math.min(100, Math.round(Number(data.readinessBreakdown?.skillsCoverage) || readinessScore))),
    experienceDepth: Math.max(0, Math.min(100, Math.round(Number(data.readinessBreakdown?.experienceDepth) || readinessScore))),
    projectPortfolio: Math.max(0, Math.min(100, Math.round(Number(data.readinessBreakdown?.projectPortfolio) || readinessScore))),
    calculationExplanation: String(
      data.readinessBreakdown?.calculationExplanation ||
        "Estimated readiness benchmark calculated from technical skills alignment (40%), verified project evidence (30%), and domain experience depth (30%). Not an official job guarantee or selection probability."
    ),
  };

  const skillGaps = {
    highPriority: Array.isArray(data.skillGaps?.highPriority) ? data.skillGaps.highPriority : [],
    mediumPriority: Array.isArray(data.skillGaps?.mediumPriority) ? data.skillGaps.mediumPriority : [],
    lowPriority: Array.isArray(data.skillGaps?.lowPriority) ? data.skillGaps.lowPriority : [],
  };

  const progressionPaths = Array.isArray(data.progressionPaths) && data.progressionPaths.length > 0
    ? data.progressionPaths.map((p, idx) => ({
        step: Number(p.step) || idx + 1,
        role: String(p.role || targetRole),
        timeframe: String(p.timeframe || "TBD"),
        focusArea: String(p.focusArea || "Skill acquisition and project delivery"),
      }))
    : [
        { step: 1, role: "Current Role", timeframe: "Current", focusArea: "Foundational mastery" },
        { step: 2, role: targetRole, timeframe: targetTimeframe || "12 months", focusArea: "Target competencies and portfolio delivery" },
      ];

  const rawMilestones = Array.isArray(data.milestones) && data.milestones.length > 0 ? data.milestones : [];
  
  if (rawMilestones.length === 0) {
    throw new Error("AI response did not generate any roadmap milestones. Please retry.");
  }

  // Validate that every milestone satisfies all 6 required fields
  const milestones = rawMilestones.map((m, idx) => {
    const order = Number(m.order) || idx + 1;
    const phase = String(m.phase || `Phase ${order}`);
    const title = String(m.title || `Milestone ${order}`);
    const description = String(m.description || "Core milestone objectives and deliverables.");
    const learningObjectives = Array.isArray(m.learningObjectives) && m.learningObjectives.length > 0
      ? m.learningObjectives.map(String)
      : ["Master core technical fundamentals", "Implement industry best practices"];
    const requiredSkills = Array.isArray(m.requiredSkills) && m.requiredSkills.length > 0
      ? m.requiredSkills.map(String)
      : ["Core Language / Framework", "Testing & Deployment"];
    const estimatedEffort = String(m.estimatedEffort || "3-4 weeks (8-10 hrs/week)");

    const practicalProject = (m.practicalProject && typeof m.practicalProject === "object")
      ? {
          title: String(m.practicalProject.title || `Project for ${title}`),
          description: String(m.practicalProject.description || "Production-grade portfolio implementation demonstrating milestone competencies."),
          deliverables: Array.isArray(m.practicalProject.deliverables) && m.practicalProject.deliverables.length > 0
            ? m.practicalProject.deliverables.map(String)
            : ["Tested GitHub repository", "Comprehensive architecture documentation"],
        }
      : {
          title: `Project for ${title}`,
          description: "Production-grade portfolio project demonstrating milestone competencies.",
          deliverables: ["Tested GitHub repository", "System design documentation"],
        };

    const deliverables = Array.isArray(m.deliverables) && m.deliverables.length > 0
      ? m.deliverables.map(String)
      : practicalProject.deliverables;

    const completionCriteria = Array.isArray(m.completionCriteria) && m.completionCriteria.length > 0
      ? m.completionCriteria.map(String)
      : ["All unit and integration tests pass", "System design is peer-reviewed and documented"];

    return {
      order,
      phase,
      title,
      description,
      learningObjectives,
      requiredSkills,
      estimatedEffort,
      practicalProject,
      deliverables,
      completionCriteria,
    };
  });

  return {
    readinessScore,
    readinessBreakdown,
    skillGaps,
    progressionPaths,
    milestones,
  };
}

module.exports = {
  simulateTrajectoryWithGemini,
};
