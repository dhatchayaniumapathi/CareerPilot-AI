import { useState, useEffect, useRef } from "react";
import axiosClient from "../api/axiosClient";
import {
  SparklesIcon,
  UploadIcon,
  FileTextIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SpinnerIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  HistoryIcon,
  TargetIcon,
  ArrowRightIcon,
  ShieldIcon,
} from "../components/Icons";

export default function ResumeTailor() {
  // Form State
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Active Result & History State
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch analysis history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await axiosClient.get("/resume/history");
      setHistory(response.data.data?.history || []);
    } catch {
      // Non-critical, ignore silent history failure
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Please select a valid PDF file (.pdf)");
        setFile(null);
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit. Please upload a smaller PDF.");
        setFile(null);
        return;
      }
      setError("");
      setFile(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== "application/pdf" && !droppedFile.name.toLowerCase().endsWith(".pdf")) {
        setError("Please drop a valid PDF file (.pdf)");
        return;
      }
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setError("");
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("Please upload your PDF resume.");
      return;
    }
    if (!jobTitle.trim()) {
      setError("Please enter the target job title.");
      return;
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 50) {
      setError("Please provide a job description of at least 50 characters.");
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    // Staged visual feedback during processing
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2500);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobTitle", jobTitle.trim());
    formData.append("jobDescription", jobDescription.trim());

    try {
      const response = await axiosClient.post("/resume/tailor", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearInterval(stepInterval);
      setAnalysisResult(response.data.data);
      setSuccess("Resume tailored and analyzed successfully!");
      fetchHistory(); // Refresh history
      window.scrollTo({ top: 400, behavior: "smooth" });
    } catch (err) {
      clearInterval(stepInterval);
      const message =
        err.response?.data?.message ||
        "Failed to process resume. Please verify the backend and Gemini API key.";
      setError(message);
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleLoadHistoryItem = async (id) => {
    setError("");
    setLoading(true);
    try {
      const response = await axiosClient.get(`/resume/${id}`);
      setAnalysisResult(response.data.data.analysis);
      setShowHistory(false);
      window.scrollTo({ top: 400, behavior: "smooth" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analysis record.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this analysis record?")) return;

    try {
      await axiosClient.delete(`/resume/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (analysisResult?.id === id) {
        setAnalysisResult(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete analysis record.");
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#10B981"; // Emerald
    if (score >= 60) return "#6366F1"; // Indigo
    return "#F59E0B"; // Amber
  };

  return (
    <div className="resume-page">
      <div className="resume-container">
        {/* Header */}
        <div className="resume-header">
          <div className="resume-header-top">
            <div className="auth-badge">
              <SparklesIcon className="icon-sm" />
              <span>AI Resume Tailoring Engine</span>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn btn-secondary btn-sm"
            >
              <HistoryIcon className="icon-sm" />
              <span>History ({history.length})</span>
            </button>
          </div>
          <h1 className="resume-title">Tailor Your Resume for Any Role</h1>
          <p className="resume-subtitle">
            Upload your PDF resume and target job description to compute a transparent estimated job-match score, highlight genuine matching skills, and generate non-fabricated enhanced bullet points.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <AlertCircleIcon className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircleIcon className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        {/* History Modal / Drawer */}
        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h3 className="history-title">
                <HistoryIcon className="icon-sm" /> Previous Analyses
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="btn-icon-addon"
              >
                ✕
              </button>
            </div>
            {historyLoading ? (
              <div className="text-center py-4">
                <SpinnerIcon className="spinner-icon" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-muted text-sm py-3">No previous analyses found.</p>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadHistoryItem(item.id)}
                    className="history-item"
                  >
                    <div className="history-info">
                      <strong className="history-role">{item.jobTitle}</strong>
                      <span className="history-meta">
                        {item.filename} • {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="history-actions">
                      <span
                        className="badge-score"
                        style={{ borderColor: getScoreColor(item.matchScore) }}
                      >
                        {item.matchScore}%
                      </span>
                      <button
                        onClick={(e) => handleDeleteHistoryItem(e, item.id)}
                        className="btn-delete"
                        title="Delete record"
                      >
                        <TrashIcon className="icon-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <div className="resume-grid">
          <form onSubmit={handleSubmit} className="card resume-form-card">
            <h2 className="card-section-title">
              <FileTextIcon className="icon-sm text-indigo" /> 1. Upload Resume PDF
            </h2>

            {/* Drag & Drop PDF Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className={`dropzone ${file ? "dropzone-active" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div className="dropzone-content">
                <div className="dropzone-icon-wrap">
                  {file ? (
                    <FileTextIcon className="icon-md text-emerald" />
                  ) : (
                    <UploadIcon className="icon-md text-indigo" />
                  )}
                </div>
                {file ? (
                  <div>
                    <strong className="text-main">{file.name}</strong>
                    <p className="text-muted text-sm">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Click or drop to replace
                    </p>
                  </div>
                ) : (
                  <div>
                    <strong className="text-main">Click to browse or drop your PDF resume here</strong>
                    <p className="text-muted text-sm">PDF documents up to 5MB supported</p>
                  </div>
                )}
              </div>
            </div>

            <h2 className="card-section-title mt-4">
              <TargetIcon className="icon-sm text-indigo" /> 2. Target Role & Job Description
            </h2>

            {/* Target Job Title */}
            <div className="form-group">
              <label htmlFor="jobTitle" className="form-label">
                Target Job Title
              </label>
              <div className="input-wrapper">
                <input
                  id="jobTitle"
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Job Description Textarea */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="jobDescription" className="form-label">
                  Job Description / Requirements
                </label>
                <span className="text-dim text-xs">
                  {jobDescription.length} characters (min 50)
                </span>
              </div>
              <textarea
                id="jobDescription"
                rows={7}
                placeholder="Paste the complete job description, responsibilities, and required qualifications here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="form-textarea"
              />
            </div>

            {/* Submit Button with Loading Stages */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block btn-lg mt-2"
            >
              {loading ? (
                <>
                  <SpinnerIcon className="spinner-icon" />
                  <span>
                    {loadingStep === 1 && "Extracting text from PDF..."}
                    {loadingStep === 2 && "Analyzing genuine skills alignment..."}
                    {loadingStep >= 3 && "Generating non-fabricated tailored content..."}
                  </span>
                </>
              ) : (
                <>
                  <SparklesIcon className="icon-sm" />
                  <span>Analyze & Tailor Resume</span>
                  <ArrowRightIcon className="icon-sm" />
                </>
              )}
            </button>

            <div className="anti-fabrication-badge">
              <ShieldIcon className="icon-sm" />
              <span>
                <strong>Zero-Fabrication Guarantee:</strong> CareerPilot AI only restructures and highlights genuine experiences present in your PDF. We never invent fake skills or metrics.
              </span>
            </div>
          </form>

          {/* Quick Guide / Highlights Panel */}
          <div className="card resume-info-card">
            <h3 className="card-title">How CareerPilot Tailoring Works</h3>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div>
                  <strong>Secure In-Memory Text Extraction</strong>
                  <p className="text-muted text-sm">
                    Your PDF text is parsed securely in-memory and linked to your private user account.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div>
                  <strong>Transparent Match Scoring</strong>
                  <p className="text-muted text-sm">
                    Receive a clear estimated score broken down across skills overlap, experience depth, and role scope.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div>
                  <strong>Skill Gap Detection</strong>
                  <p className="text-muted text-sm">
                    Discover which job requirements you match and which skills are missing, without false claims.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">4</div>
                <div>
                  <strong>Impact-Focused Bullet Rewriting</strong>
                  <p className="text-muted text-sm">
                    See before-and-after versions of your actual bullet points rephrased with strong action verbs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tailoring Results Section */}
        {analysisResult && (
          <div className="results-section">
            <div className="results-header">
              <div className="results-badge">
                <CheckCircleIcon className="icon-sm text-emerald" />
                <span>Tailored Analysis for {analysisResult.jobTitle}</span>
              </div>
              <button
                onClick={() => setAnalysisResult(null)}
                className="btn btn-secondary btn-sm"
              >
                Reset / New Tailoring
              </button>
            </div>

            {/* Score & Breakdown Overview Card */}
            <div className="card score-card">
              <div className="score-main">
                <div
                  className="score-circle"
                  style={{
                    borderColor: getScoreColor(analysisResult.matchScore),
                    boxShadow: `0 0 20px ${getScoreColor(analysisResult.matchScore)}40`,
                  }}
                >
                  <span className="score-number">{analysisResult.matchScore}%</span>
                  <span className="score-subtext">Estimated Match</span>
                </div>
                <div className="score-details">
                  <h3 className="score-title">Estimated Job-Match Score</h3>
                  <p className="score-desc">
                    {analysisResult.scoreBreakdown?.methodology ||
                      "Transparent estimated match based on skills alignment (45%), experience relevance (35%), and role scope (20%)."}
                  </p>
                  <div className="score-bars">
                    <div className="bar-row">
                      <span className="bar-label">Skills Alignment:</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${analysisResult.scoreBreakdown?.skillsAlignment || 75}%`,
                            backgroundColor: "#10B981",
                          }}
                        />
                      </div>
                      <span className="bar-val">
                        {analysisResult.scoreBreakdown?.skillsAlignment || 75}%
                      </span>
                    </div>

                    <div className="bar-row">
                      <span className="bar-label">Experience Relevance:</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${analysisResult.scoreBreakdown?.experienceAlignment || 70}%`,
                            backgroundColor: "#6366F1",
                          }}
                        />
                      </div>
                      <span className="bar-val">
                        {analysisResult.scoreBreakdown?.experienceAlignment || 70}%
                      </span>
                    </div>

                    <div className="bar-row">
                      <span className="bar-label">Role & Scope Fit:</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${analysisResult.scoreBreakdown?.roleFit || 80}%`,
                            backgroundColor: "#8B5CF6",
                          }}
                        />
                      </div>
                      <span className="bar-val">
                        {analysisResult.scoreBreakdown?.roleFit || 80}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Alignment Grid */}
            <div className="skills-grid">
              {/* Matching Skills */}
              <div className="card">
                <h4 className="card-title text-emerald flex items-center gap-2">
                  <CheckCircleIcon className="icon-sm" /> Verified Matching Skills (
                  {analysisResult.matchingSkills?.length || 0})
                </h4>
                <p className="text-muted text-xs mb-3">
                  Skills requested by the job that are confirmed in your resume.
                </p>
                <div className="pill-list">
                  {analysisResult.matchingSkills?.map((skill, idx) => (
                    <span key={idx} className="pill pill-success">
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="card">
                <h4 className="card-title text-amber flex items-center gap-2">
                  <AlertCircleIcon className="icon-sm" /> Missing Skills (
                  {analysisResult.missingSkills?.length || 0})
                </h4>
                <p className="text-muted text-xs mb-3">
                  Key requirements absent from your resume. (CareerPilot never fabricates these).
                </p>
                <div className="pill-list">
                  {analysisResult.missingSkills?.map((skill, idx) => (
                    <span key={idx} className="pill pill-warning">
                      ! {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Strengths */}
            {analysisResult.keyStrengths?.length > 0 && (
              <div className="card">
                <h4 className="card-title flex items-center gap-2">
                  <SparklesIcon className="icon-sm text-indigo" /> Your Standout Strengths for This Role
                </h4>
                <ul className="styled-list">
                  {analysisResult.keyStrengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tailored Professional Summary */}
            {analysisResult.tailoredSummary && (
              <div className="card">
                <div className="card-header justify-between">
                  <h4 className="card-title flex items-center gap-2">
                    <SparklesIcon className="icon-sm text-indigo" /> Tailored Professional Summary
                  </h4>
                  <button
                    onClick={() => handleCopy(analysisResult.tailoredSummary, "summary")}
                    className="btn btn-secondary btn-sm"
                  >
                    {copiedId === "summary" ? (
                      <>
                        <CheckIcon className="icon-sm text-emerald" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <CopyIcon className="icon-sm" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="summary-box">
                  <p>{analysisResult.tailoredSummary}</p>
                </div>
              </div>
            )}

            {/* Enhanced Bullet Points (Before / After Comparison) */}
            {analysisResult.tailoredBulletPoints?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <div>
                    <h4 className="card-title flex items-center gap-2">
                      <TargetIcon className="icon-sm text-indigo" /> Enhanced Bullet Points (Zero Fabrication)
                    </h4>
                    <p className="card-desc">
                      Rewritten versions of your genuine resume achievements, optimized for role keywords and active impact verbs.
                    </p>
                  </div>
                </div>

                <div className="bullet-comparison-list">
                  {analysisResult.tailoredBulletPoints.map((bp, idx) => (
                    <div key={idx} className="bullet-card">
                      <div className="bullet-row">
                        <div className="bullet-col original-col">
                          <span className="bullet-label text-muted">Original Bullet:</span>
                          <p className="bullet-text text-muted">{bp.original}</p>
                        </div>
                        <div className="bullet-col tailored-col">
                          <div className="bullet-header">
                            <span className="bullet-label text-emerald">Enhanced Bullet:</span>
                            <button
                              onClick={() => handleCopy(bp.tailored, `bp-${idx}`)}
                              className="btn-copy-inline"
                              title="Copy bullet"
                            >
                              {copiedId === `bp-${idx}` ? (
                                <CheckIcon className="icon-sm text-emerald" />
                              ) : (
                                <CopyIcon className="icon-sm" />
                              )}
                            </button>
                          </div>
                          <p className="bullet-text text-main">{bp.tailored}</p>
                        </div>
                      </div>
                      {bp.reason && (
                        <div className="bullet-reason">
                          <span className="reason-tag">Strategy:</span> {bp.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tailoring Suggestions */}
            {analysisResult.tailoringSuggestions?.length > 0 && (
              <div className="card">
                <h4 className="card-title flex items-center gap-2">
                  <ShieldIcon className="icon-sm text-indigo" /> Strategic Advice & Interview Positioning
                </h4>
                <ul className="styled-list">
                  {analysisResult.tailoringSuggestions.map((sug, idx) => (
                    <li key={idx}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
