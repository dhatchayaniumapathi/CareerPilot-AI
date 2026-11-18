const { GoogleGenAI } = require("@google/genai");

/**
 * Service to interface with Google Gemini API for resume analysis and tailoring
 */
async function analyzeAndTailorWithGemini({ resumeText, jobTitle, jobDescription }) {
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

  const systemInstruction = `You are a Senior Executive Technical Recruiter and Career Optimization Specialist for CareerPilot AI.
Your objective is to provide an honest, high-value, and accurate analysis of a candidate's resume against a target job description.

CRITICAL RULES AND CONSTRAINTS:
1. ANTI-FABRICATION (ABSOLUTE): NEVER invent, fabricate, hallucinate, or assume any skills, technologies, years of experience, titles, metrics, degrees, or achievements that are not explicitly documented in the candidate's original resume.
2. TRANSPARENT ESTIMATION: Calculate an ESTIMATED job-match score (0-100). Never claim this is a real or proprietary vendor ATS algorithm. Provide an honest breakdown showing:
   - skillsAlignment (0-100): Overlap of required skills found in resume.
   - experienceAlignment (0-100): Relevance of candidate's actual background and seniority.
   - roleFit (0-100): Scope and domain compatibility.
   - methodology: Clear explanation of how this estimate was calculated.
3. HONEST SKILLS CATEGORIZATION:
   - matchingSkills: Skills clearly evidenced in both resume and job description.
   - missingSkills: Crucial skills or tools requested by the job that are absent from the resume. NEVER claim the candidate has missing skills.
   - keyStrengths: Candidate's verified standout areas that align with the role.
4. ACTIONABLE TAILORING:
   - tailoredSummary: A professional summary that highlights genuine relevant strengths already present in the resume.
   - tailoredBulletPoints: Select 3 to 6 existing bullet points from the resume and rewrite them with stronger impact verbs and targeted keywords. For each item, include the original text, the tailored version, and a brief explanation of the improvement, ensuring zero fabrication.
   - tailoringSuggestions: Actionable strategic advice on how to present their genuine background more effectively for this role.

You MUST respond with a single, valid JSON object following this exact schema:
{
  "matchScore": number,
  "scoreBreakdown": {
    "skillsAlignment": number,
    "experienceAlignment": number,
    "roleFit": number,
    "methodology": string
  },
  "matchingSkills": [string],
  "missingSkills": [string],
  "keyStrengths": [string],
  "tailoringSuggestions": [string],
  "tailoredSummary": string,
  "tailoredBulletPoints": [
    {
      "original": string,
      "tailored": string,
      "reason": string
    }
  ]
}`;

  const prompt = `TARGET JOB TITLE:
${jobTitle}

TARGET JOB DESCRIPTION:
${jobDescription}

CANDIDATE'S ORIGINAL RESUME CONTENT:
${resumeText}

Analyze this resume against the job description following the strict guidelines. Return ONLY the JSON response.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for high factual adherence
      },
    });

    const responseText = response.text ? response.text.trim() : "";
    if (!responseText) {
      throw new Error("Empty response received from Gemini API");
    }

    // Parse JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // In case wrapped in markdown code fence
      const cleanJson = responseText.replace(/^```json/m, "").replace(/```$/m, "").trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Sanitize and validate parsed structure
    const matchScore = Math.max(0, Math.min(100, Math.round(Number(parsedData.matchScore) || 50)));

    return {
      matchScore,
      scoreBreakdown: parsedData.scoreBreakdown || {
        skillsAlignment: matchScore,
        experienceAlignment: matchScore,
        roleFit: matchScore,
        methodology: "Calculated based on detected skills overlap and experience relevance.",
      },
      matchingSkills: Array.isArray(parsedData.matchingSkills) ? parsedData.matchingSkills : [],
      missingSkills: Array.isArray(parsedData.missingSkills) ? parsedData.missingSkills : [],
      keyStrengths: Array.isArray(parsedData.keyStrengths) ? parsedData.keyStrengths : [],
      tailoringSuggestions: Array.isArray(parsedData.tailoringSuggestions)
        ? parsedData.tailoringSuggestions
        : [],
      tailoredSummary: String(parsedData.tailoredSummary || ""),
      tailoredBulletPoints: Array.isArray(parsedData.tailoredBulletPoints)
        ? parsedData.tailoredBulletPoints
        : [],
    };
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error(`AI Resume Analysis failed: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }
}

module.exports = {
  analyzeAndTailorWithGemini,
};
