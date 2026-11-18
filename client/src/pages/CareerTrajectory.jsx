import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import {
  CompassIcon,
  RoadmapIcon,
  UserIcon,
  SparklesIcon,
  TargetIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SpinnerIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  CalendarIcon,
  BookOpenIcon,
  BriefcaseIcon,
  LayersIcon,
  CheckIcon,
  HistoryIcon,
  ShieldIcon,
  ArrowRightIcon,
} from "../components/Icons";

const QUICK_ROLES = [
  "Staff Platform Engineer",
  "Cloud Solutions Architect",
  "Full-Stack Tech Lead",
  "AI & Machine Learning Engineer",
  "Distributed Systems Engineer",
  "DevOps / SRE Lead",
];

const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "Cloud & DevOps",
  "AI / ML",
  "System Architecture",
  "General",
];

export default function CareerTrajectory() {
  // Navigation tabs: "roadmap", "profile", "history"
  const [activeTab, setActiveTab] = useState("roadmap");

  // Profile State
  const [profile, setProfile] = useState({
    currentTitle: "",
    experienceYears: "",
    education: [],
    skills: [],
    projects: [],
    experience: [],
    interests: [],
  });
  const [interestInput, setInterestInput] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Resume Import State
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Simulation Form State
  const [targetRole, setTargetRole] = useState("");
  const [targetTimeframe, setTargetTimeframe] = useState("12 months");
  const [currentLevel, setCurrentLevel] = useState("Mid-Level");
  const [simulating, setSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Active Trajectory State
  const [activeTrajectory, setActiveTrajectory] = useState(null);
  const [trajectoriesList, setTrajectoriesList] = useState([]);
  const [trajectoriesLoading, setTrajectoriesLoading] = useState(false);

  // Milestone Inline Notes State
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [milestoneUpdating, setMilestoneUpdating] = useState(null);

  // Global Alerts
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load initial data on mount
  useEffect(() => {
    loadProfile();
    loadTrajectories();
  }, []);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const response = await axiosClient.get("/trajectory/profile");
      if (response.data.data?.profile) {
        const p = response.data.data.profile;
        setProfile({
          currentTitle: p.currentTitle || "",
          experienceYears: p.experienceYears != null ? String(p.experienceYears) : "",
          education: Array.isArray(p.education) ? p.education : [],
          skills: Array.isArray(p.skills) ? p.skills : [],
          projects: Array.isArray(p.projects) ? p.projects : [],
          experience: Array.isArray(p.experience) ? p.experience : [],
          interests: Array.isArray(p.interests) ? p.interests : [],
        });
      }
    } catch {
      // Non-critical if user doesn't have a profile yet
    } finally {
      setProfileLoading(false);
    }
  };

  const loadTrajectories = async () => {
    setTrajectoriesLoading(true);
    try {
      const response = await axiosClient.get("/trajectory");
      const list = response.data.data?.trajectories || [];
      setTrajectoriesList(list);

      // If user has trajectories and no active one is selected, load the first one
      if (list.length > 0 && !activeTrajectory) {
        loadTrajectoryDetails(list[0].id);
      }
    } catch {
      // Ignore
    } finally {
      setTrajectoriesLoading(false);
    }
  };

  const loadTrajectoryDetails = async (id) => {
    try {
      const response = await axiosClient.get(`/trajectory/${id}`);
      setActiveTrajectory(response.data.data.trajectory);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load trajectory details");
    }
  };

  // ---------------------------------------------------------------------------
  // Profile Handlers
  // ---------------------------------------------------------------------------

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setProfileSaving(true);

    try {
      const payload = {
        currentTitle: profile.currentTitle.trim(),
        experienceYears: profile.experienceYears ? parseFloat(profile.experienceYears) : null,
        education: profile.education,
        skills: profile.skills,
        projects: profile.projects,
        experience: profile.experience,
        interests: profile.interests,
      };

      const response = await axiosClient.put("/trajectory/profile", payload);
      setSuccess("Career profile saved successfully!");
      if (response.data.data?.profile) {
        const p = response.data.data.profile;
        setProfile({
          currentTitle: p.currentTitle || "",
          experienceYears: p.experienceYears != null ? String(p.experienceYears) : "",
          education: Array.isArray(p.education) ? p.education : [],
          skills: Array.isArray(p.skills) ? p.skills : [],
          projects: Array.isArray(p.projects) ? p.projects : [],
          experience: Array.isArray(p.experience) ? p.experience : [],
          interests: Array.isArray(p.interests) ? p.interests : [],
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save career profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePreviewResumeImport = async () => {
    setError("");
    setImportLoading(true);

    try {
      const response = await axiosClient.post("/trajectory/profile/import-resume");
      setImportPreview(response.data.data);
      setShowImportModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not import resume data. Please ensure you have completed at least one resume tailoring analysis in Phase 2."
      );
    } finally {
      setImportLoading(false);
    }
  };

  const handleApplyImportedData = () => {
    if (!importPreview) return;

    // Merge skills avoiding duplicates
    const existingSkillNames = new Set(profile.skills.map((s) => s.name.toLowerCase()));
    const mergedSkills = [...profile.skills];

    (importPreview.skills || []).forEach((newSkill) => {
      if (!existingSkillNames.has(newSkill.name.toLowerCase())) {
        existingSkillNames.add(newSkill.name.toLowerCase());
        mergedSkills.push(newSkill);
      }
    });

    setProfile((prev) => ({
      ...prev,
      currentTitle: prev.currentTitle || importPreview.currentTitle || "",
      skills: mergedSkills,
    }));

    setShowImportModal(false);
    setSuccess(
      "Imported skills and job title applied to your form. Review and edit any field, then click 'Save Profile' to commit your changes."
    );
  };

  // Helper additions for profile arrays
  const addSkill = () => {
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, { name: "", category: "Backend", level: "Intermediate" }],
    }));
  };

  const updateSkill = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.skills];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, skills: updated };
    });
  };

  const removeSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", field: "", year: "" }],
    }));
  };

  const updateEducation = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const removeEducation = (index) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", techStack: "", link: "" }],
    }));
  };

  const updateProject = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, { title: "", company: "", duration: "", description: "" }],
    }));
  };

  const updateExperience = (index, field, value) => {
    setProfile((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const removeExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const addInterest = (e) => {
    if (e) e.preventDefault();
    const val = interestInput.trim();
    if (!val) return;
    if (!profile.interests.includes(val)) {
      setProfile((prev) => ({
        ...prev,
        interests: [...(prev.interests || []), val],
      }));
    }
    setInterestInput("");
  };

  const removeInterest = (index) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }));
  };

  // ---------------------------------------------------------------------------
  // Simulation Handlers
  // ---------------------------------------------------------------------------

  const handleSimulate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!targetRole.trim()) {
      setError("Please specify a target career role.");
      return;
    }

    // Verify user has some profile baseline
    const hasBaseline =
      profile.skills.length > 0 ||
      profile.education.length > 0 ||
      profile.projects.length > 0 ||
      profile.currentTitle.trim().length > 0;

    if (!hasBaseline) {
      setError(
        "Please fill in your career profile (skills or experience) first so the simulation can benchmark your genuine baseline."
      );
      setActiveTab("profile");
      return;
    }

    setSimulating(true);
    setSimStep(1);

    const stepInterval = setInterval(() => {
      setSimStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2800);

    try {
      const response = await axiosClient.post("/trajectory/simulate", {
        targetRole: targetRole.trim(),
        targetTimeframe,
        currentLevel,
        profile,
      });

      clearInterval(stepInterval);
      setActiveTrajectory(response.data.data.trajectory);
      setSuccess(`Career roadmap generated for ${targetRole.trim()}!`);
      setActiveTab("roadmap");
      loadTrajectories();
    } catch (err) {
      clearInterval(stepInterval);
      setError(
        err.response?.data?.message ||
          "Career simulation failed. Please ensure your Gemini API key is configured and try again."
      );
    } finally {
      setSimulating(false);
      setSimStep(0);
    }
  };

  // ---------------------------------------------------------------------------
  // Milestone Progress Updates
  // ---------------------------------------------------------------------------

  const handleMilestoneStatusChange = async (milestoneId, newStatus) => {
    if (!activeTrajectory) return;
    setMilestoneUpdating(milestoneId);
    setError("");

    try {
      const response = await axiosClient.patch(
        `/trajectory/${activeTrajectory.id}/milestones/${milestoneId}`,
        { status: newStatus }
      );

      const updatedMilestone = response.data.data.milestone;

      // Update state locally
      setActiveTrajectory((prev) => {
        if (!prev) return prev;
        const updatedMilestones = prev.milestones.map((m) =>
          m.id === milestoneId ? { ...m, ...updatedMilestone } : m
        );
        const total = updatedMilestones.length;
        const completed = updatedMilestones.filter((m) => m.status === "COMPLETED").length;
        const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          ...prev,
          milestones: updatedMilestones,
          progressPercentage,
          completedMilestonesCount: completed,
        };
      });

      loadTrajectories(); // Refresh summary counts
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update milestone status");
    } finally {
      setMilestoneUpdating(null);
    }
  };

  const handleSaveNotes = async (milestoneId) => {
    if (!activeTrajectory) return;
    setMilestoneUpdating(milestoneId);

    try {
      const response = await axiosClient.patch(
        `/trajectory/${activeTrajectory.id}/milestones/${milestoneId}`,
        { userNotes: notesDraft }
      );

      setActiveTrajectory((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          milestones: prev.milestones.map((m) =>
            m.id === milestoneId ? { ...m, userNotes: response.data.data.milestone.userNotes } : m
          ),
        };
      });
      setEditingNotesId(null);
      setNotesDraft("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save milestone notes");
    } finally {
      setMilestoneUpdating(null);
    }
  };

  const handleDeleteTrajectory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trajectory roadmap?")) return;

    try {
      await axiosClient.delete(`/trajectory/${id}`);
      setTrajectoriesList((prev) => prev.filter((t) => t.id !== id));
      if (activeTrajectory?.id === id) {
        const remaining = trajectoriesList.filter((t) => t.id !== id);
        if (remaining.length > 0) {
          loadTrajectoryDetails(remaining[0].id);
        } else {
          setActiveTrajectory(null);
        }
      }
      setSuccess("Trajectory roadmap deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete trajectory");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#10B981"; // Emerald
    if (score >= 50) return "#6366F1"; // Indigo
    return "#F59E0B"; // Amber
  };

  return (
    <div className="trajectory-page">
      <div className="trajectory-container">
        {/* Header */}
        <div className="trajectory-header">
          <div className="trajectory-header-top">
            <div className="auth-badge">
              <CompassIcon className="icon-sm" />
              <span>Career Trajectory Simulator</span>
            </div>
            <div className="tab-pill-group">
              <button
                onClick={() => setActiveTab("roadmap")}
                className={`tab-pill ${activeTab === "roadmap" ? "tab-pill-active" : ""}`}
              >
                <RoadmapIcon className="icon-sm" /> Roadmap
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`tab-pill ${activeTab === "profile" ? "tab-pill-active" : ""}`}
              >
                <UserIcon className="icon-sm" /> Career Profile
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`tab-pill ${activeTab === "history" ? "tab-pill-active" : ""}`}
              >
                <HistoryIcon className="icon-sm" /> Saved Trajectories ({trajectoriesList.length})
              </button>
            </div>
          </div>
          <h1 className="trajectory-title">Data-Driven Career Planning Engine</h1>
          <p className="trajectory-subtitle">
            Benchmark your verified career profile against target roles, identify high-priority skill gaps, and execute realistic milestones with production portfolio projects.
          </p>
        </div>

        {/* Global Alerts */}
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

        {/* ===================================================================
            TAB 1: ROADMAP & SIMULATION VIEW
            =================================================================== */}
        {activeTab === "roadmap" && (
          <div className="roadmap-tab-layout">
            {/* Simulation Launcher Form Card */}
            <div className="card simulation-launcher-card">
              <div className="card-header justify-between">
                <div>
                  <h3 className="card-title flex items-center gap-2">
                    <TargetIcon className="icon-sm text-indigo" /> Configure Career Simulation
                  </h3>
                  <p className="card-desc">
                    Specify your target role and planning horizon to simulate competency gaps and learning phases.
                  </p>
                </div>
                {profile.skills.length === 0 && (
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="btn btn-secondary btn-sm"
                  >
                    Edit Profile First →
                  </button>
                )}
              </div>

              <form onSubmit={handleSimulate} className="simulation-form">
                <div className="form-row-3">
                  {/* Target Role Input */}
                  <div className="form-group flex-2">
                    <label htmlFor="targetRole" className="form-label">
                      Target Role Title
                    </label>
                    <div className="input-wrapper">
                      <TargetIcon className="input-icon" />
                      <input
                        id="targetRole"
                        type="text"
                        placeholder="e.g. Staff Platform Engineer"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  {/* Target Timeframe */}
                  <div className="form-group">
                    <label htmlFor="targetTimeframe" className="form-label">
                      Planning Horizon
                    </label>
                    <select
                      id="targetTimeframe"
                      value={targetTimeframe}
                      onChange={(e) => setTargetTimeframe(e.target.value)}
                      className="form-select"
                    >
                      <option value="6 months">6 Months</option>
                      <option value="12 months">12 Months (Recommended)</option>
                      <option value="18 months">18 Months</option>
                      <option value="24 months">24 Months</option>
                    </select>
                  </div>

                  {/* Current Seniority Level */}
                  <div className="form-group">
                    <label htmlFor="currentLevel" className="form-label">
                      Current Seniority
                    </label>
                    <select
                      id="currentLevel"
                      value={currentLevel}
                      onChange={(e) => setCurrentLevel(e.target.value)}
                      className="form-select"
                    >
                      <option value="Student / Entry-Level">Student / Entry-Level</option>
                      <option value="Junior Developer">Junior Developer (1-2 yrs)</option>
                      <option value="Mid-Level Engineer">Mid-Level Engineer (3-5 yrs)</option>
                      <option value="Senior Engineer">Senior Engineer (5+ yrs)</option>
                    </select>
                  </div>
                </div>

                {/* Quick Role Suggestions */}
                <div className="quick-roles-wrap">
                  <span className="text-dim text-xs">Quick suggestions:</span>
                  <div className="quick-roles-list">
                    {QUICK_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTargetRole(role)}
                        className={`chip-btn ${targetRole === role ? "chip-btn-active" : ""}`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-actions-row">
                  <button
                    type="submit"
                    disabled={simulating}
                    className="btn btn-primary btn-lg"
                  >
                    {simulating ? (
                      <>
                        <SpinnerIcon className="spinner-icon" />
                        <span>
                          {simStep === 1 && "Benchmarking competencies against target requirements..."}
                          {simStep === 2 && "Prioritizing technical skill gaps..."}
                          {simStep >= 3 && "Structuring 6-point project roadmap milestones..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="icon-sm" />
                        <span>Simulate Trajectory & Generate Roadmap</span>
                        <ArrowRightIcon className="icon-sm" />
                      </>
                    )}
                  </button>

                  <span className="anti-fabrication-note">
                    <ShieldIcon className="icon-sm text-emerald" /> Realistic benchmarks based on engineering best practices. No fabricated job guarantees or salary promises.
                  </span>
                </div>
              </form>
            </div>

            {/* Trajectory Results Workspace */}
            {activeTrajectory ? (
              <div className="trajectory-results-area">
                {/* 1. Readiness Score & Transparency Card */}
                <div className="card readiness-card">
                  <div className="readiness-main">
                    <div
                      className="score-circle"
                      style={{
                        borderColor: getScoreColor(activeTrajectory.readinessScore),
                        boxShadow: `0 0 25px ${getScoreColor(activeTrajectory.readinessScore)}40`,
                      }}
                    >
                      <span className="score-number">{activeTrajectory.readinessScore}%</span>
                      <span className="score-subtext">Estimated Readiness</span>
                    </div>

                    <div className="readiness-details">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="score-title">
                          Target: {activeTrajectory.targetRole}
                        </h3>
                        <span className="badge-timeframe">
                          <CalendarIcon className="icon-sm" /> {activeTrajectory.targetTimeframe} horizon
                        </span>
                      </div>

                      <p className="score-desc">
                        {activeTrajectory.readinessBreakdown?.calculationExplanation ||
                          "Estimated readiness benchmark calculated from technical skills alignment (40%), verified project evidence (30%), and domain experience depth (30%). Not an official job guarantee or selection probability."}
                      </p>

                      {/* Metric Breakdown Bars */}
                      <div className="score-bars">
                        <div className="bar-row">
                          <span className="bar-label">Skills Coverage:</span>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${activeTrajectory.readinessBreakdown?.skillsCoverage || 60}%`,
                                backgroundColor: "#10B981",
                              }}
                            />
                          </div>
                          <span className="bar-val">
                            {activeTrajectory.readinessBreakdown?.skillsCoverage || 60}%
                          </span>
                        </div>

                        <div className="bar-row">
                          <span className="bar-label">Experience Depth:</span>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${activeTrajectory.readinessBreakdown?.experienceDepth || 55}%`,
                                backgroundColor: "#6366F1",
                              }}
                            />
                          </div>
                          <span className="bar-val">
                            {activeTrajectory.readinessBreakdown?.experienceDepth || 55}%
                          </span>
                        </div>

                        <div className="bar-row">
                          <span className="bar-label">Project Portfolio:</span>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${activeTrajectory.readinessBreakdown?.projectPortfolio || 65}%`,
                                backgroundColor: "#8B5CF6",
                              }}
                            />
                          </div>
                          <span className="bar-val">
                            {activeTrajectory.readinessBreakdown?.projectPortfolio || 65}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Prioritized Skill Gaps Matrix */}
                <div className="card">
                  <h3 className="card-title flex items-center gap-2 mb-3">
                    <LayersIcon className="icon-sm text-indigo" /> Prioritized Skill Gap Matrix
                  </h3>
                  <p className="card-desc mb-4">
                    Targeted competencies categorized by priority to maximize learning efficiency.
                  </p>

                  <div className="skill-gap-columns">
                    {/* High Priority */}
                    <div className="gap-col gap-col-high">
                      <div className="gap-col-header">
                        <span className="gap-priority-pill priority-high">High Priority</span>
                        <span className="gap-col-subtitle">Critical Prerequisites</span>
                      </div>
                      <div className="gap-items-list">
                        {(activeTrajectory.skillGaps?.highPriority || []).length === 0 ? (
                          <p className="text-dim text-xs">No critical blockers identified.</p>
                        ) : (
                          activeTrajectory.skillGaps.highPriority.map((item, idx) => (
                            <div key={idx} className="gap-item-card">
                              <strong className="gap-skill-name">{item.skill}</strong>
                              <p className="gap-skill-reason">{item.reason}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Medium Priority */}
                    <div className="gap-col gap-col-medium">
                      <div className="gap-col-header">
                        <span className="gap-priority-pill priority-medium">Medium Priority</span>
                        <span className="gap-col-subtitle">Core Production Tooling</span>
                      </div>
                      <div className="gap-items-list">
                        {(activeTrajectory.skillGaps?.mediumPriority || []).length === 0 ? (
                          <p className="text-dim text-xs">None listed.</p>
                        ) : (
                          activeTrajectory.skillGaps.mediumPriority.map((item, idx) => (
                            <div key={idx} className="gap-item-card">
                              <strong className="gap-skill-name">{item.skill}</strong>
                              <p className="gap-skill-reason">{item.reason}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Low Priority */}
                    <div className="gap-col gap-col-low">
                      <div className="gap-col-header">
                        <span className="gap-priority-pill priority-low">Low / Nice-to-Have</span>
                        <span className="gap-col-subtitle">Supporting & Future-Proofing</span>
                      </div>
                      <div className="gap-items-list">
                        {(activeTrajectory.skillGaps?.lowPriority || []).length === 0 ? (
                          <p className="text-dim text-xs">None listed.</p>
                        ) : (
                          activeTrajectory.skillGaps.lowPriority.map((item, idx) => (
                            <div key={idx} className="gap-item-card">
                              <strong className="gap-skill-name">{item.skill}</strong>
                              <p className="gap-skill-reason">{item.reason}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Career Progression Ladder */}
                {activeTrajectory.progressionPaths?.length > 0 && (
                  <div className="card">
                    <h3 className="card-title flex items-center gap-2 mb-3">
                      <CompassIcon className="icon-sm text-indigo" /> Realistic Career Progression Stages
                    </h3>
                    <div className="progression-ladder">
                      {activeTrajectory.progressionPaths.map((stage, idx) => (
                        <div key={idx} className="ladder-step">
                          <div className="ladder-indicator">
                            <span className="step-circle">{stage.step || idx + 1}</span>
                            {idx < activeTrajectory.progressionPaths.length - 1 && (
                              <div className="step-connector" />
                            )}
                          </div>
                          <div className="ladder-content">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <strong className="ladder-role">{stage.role}</strong>
                              <span className="ladder-timeframe">{stage.timeframe}</span>
                            </div>
                            <p className="ladder-focus">{stage.focusArea}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Structured Milestone Roadmap */}
                <div className="card">
                  <div className="card-header justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="card-title flex items-center gap-2">
                        <RoadmapIcon className="icon-sm text-indigo" /> Sequential Learning Roadmap
                      </h3>
                      <p className="card-desc">
                        Every milestone includes learning objectives, practical projects, and verifiable deliverables.
                      </p>
                    </div>

                    {/* Progress Badge */}
                    <div className="overall-progress-box">
                      <div className="progress-numbers">
                        <span>Progress:</span>
                        <strong>
                          {activeTrajectory.completedMilestonesCount || 0} /{" "}
                          {activeTrajectory.milestones?.length || 0} Milestones
                        </strong>
                        <span className="progress-percent">
                          ({activeTrajectory.progressPercentage || 0}%)
                        </span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${activeTrajectory.progressPercentage || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Milestones List */}
                  <div className="milestones-timeline">
                    {activeTrajectory.milestones?.map((milestone, idx) => {
                      const isCompleted = milestone.status === "COMPLETED";
                      const isInProgress = milestone.status === "IN_PROGRESS";

                      return (
                        <div
                          key={milestone.id}
                          className={`milestone-card ${
                            isCompleted
                              ? "milestone-completed"
                              : isInProgress
                              ? "milestone-in-progress"
                              : ""
                          }`}
                        >
                          <div className="milestone-top">
                            <div className="milestone-badge-row">
                              <span className="milestone-phase-badge">{milestone.phase}</span>
                              <span className="milestone-effort-badge">
                                <CalendarIcon className="icon-sm" /> {milestone.estimatedEffort}
                              </span>
                            </div>

                            {/* Status Control Actions */}
                            <div className="milestone-status-controls">
                              {milestoneUpdating === milestone.id ? (
                                <SpinnerIcon className="spinner-icon text-indigo" />
                              ) : (
                                <div className="status-button-group">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMilestoneStatusChange(
                                        milestone.id,
                                        isCompleted ? "NOT_STARTED" : "COMPLETED"
                                      )
                                    }
                                    className={`btn btn-sm ${
                                      isCompleted ? "btn-success-active" : "btn-secondary"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <>
                                        <CheckIcon className="icon-sm" /> Completed
                                      </>
                                    ) : (
                                      "Mark Complete"
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMilestoneStatusChange(
                                        milestone.id,
                                        isInProgress ? "NOT_STARTED" : "IN_PROGRESS"
                                      )
                                    }
                                    className={`btn btn-sm ${
                                      isInProgress ? "btn-warning-active" : "btn-secondary"
                                    }`}
                                  >
                                    {isInProgress ? "In Progress" : "Set In-Progress"}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <h4 className="milestone-title">
                            {milestone.order}. {milestone.title}
                          </h4>
                          <p className="milestone-desc">{milestone.description}</p>

                          {/* 6 Mandatory Field Details */}
                          <div className="milestone-details-grid">
                            {/* Learning Objectives */}
                            <div className="detail-block">
                              <span className="detail-heading">
                                <BookOpenIcon className="icon-sm text-indigo" /> Learning Objectives:
                              </span>
                              <ul className="styled-list-sm">
                                {milestone.learningObjectives?.map((obj, i) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Required Skills */}
                            <div className="detail-block">
                              <span className="detail-heading">
                                <LayersIcon className="icon-sm text-indigo" /> Required Skills:
                              </span>
                              <div className="pill-list-sm">
                                {milestone.requiredSkills?.map((skill, i) => (
                                  <span key={i} className="skill-pill">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Practical Project Specification Box */}
                          {milestone.practicalProject && (
                            <div className="project-spec-box">
                              <div className="project-spec-header">
                                <BriefcaseIcon className="icon-sm text-emerald" />
                                <strong>Practical Portfolio Project:</strong> {milestone.practicalProject.title}
                              </div>
                              <p className="project-spec-desc">
                                {milestone.practicalProject.description}
                              </p>

                              {/* Concrete Deliverables */}
                              <div className="deliverables-box">
                                <span className="deliverables-title">Concrete Deliverables:</span>
                                <ul className="styled-list-sm">
                                  {milestone.deliverables?.map((del, i) => (
                                    <li key={i}>{del}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Completion Criteria */}
                              <div className="criteria-box">
                                <span className="criteria-title">Completion Criteria:</span>
                                <ul className="styled-list-sm">
                                  {milestone.completionCriteria?.map((crit, i) => (
                                    <li key={i}>{crit}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* Milestone Notes & Completed Timestamp */}
                          <div className="milestone-footer">
                            {milestone.completedAt && (
                              <span className="completed-timestamp">
                                ✓ Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                              </span>
                            )}

                            {/* Personal Notes Section */}
                            <div className="milestone-notes-wrap">
                              {editingNotesId === milestone.id ? (
                                <div className="notes-editor">
                                  <textarea
                                    rows={3}
                                    placeholder="Add personal notes, repo links, or study reflections for this milestone..."
                                    value={notesDraft}
                                    onChange={(e) => setNotesDraft(e.target.value)}
                                    className="form-textarea notes-textarea"
                                  />
                                  <div className="flex gap-2 justify-end mt-2">
                                    <button
                                      type="button"
                                      onClick={() => setEditingNotesId(null)}
                                      className="btn btn-secondary btn-sm"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveNotes(milestone.id)}
                                      className="btn btn-primary btn-sm"
                                    >
                                      Save Notes
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="notes-display">
                                  {milestone.userNotes ? (
                                    <p className="user-note-text">
                                      <strong>Notes:</strong> {milestone.userNotes}
                                    </p>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingNotesId(milestone.id);
                                      setNotesDraft(milestone.userNotes || "");
                                    }}
                                    className="btn-edit-note"
                                  >
                                    <EditIcon className="icon-sm" />
                                    <span>{milestone.userNotes ? "Edit Notes" : "+ Add Personal Notes"}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card text-center py-5">
                <CompassIcon className="icon-md text-indigo mb-2" />
                <h3 className="card-title">No Active Trajectory Roadmap</h3>
                <p className="text-muted text-sm max-w-md mx-auto mb-4">
                  Configure your target role and planning horizon in the form above to run a practical trajectory simulation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 2: CAREER PROFILE BUILDER VIEW
            =================================================================== */}
        {activeTab === "profile" && (
          <div className="profile-tab-layout">
            <div className="card profile-card">
              <div className="card-header justify-between flex-wrap gap-2">
                <div>
                  <h3 className="card-title flex items-center gap-2">
                    <UserIcon className="icon-sm text-indigo" /> Verified Career Profile
                  </h3>
                  <p className="card-desc">
                    CareerPilot benchmarks this genuine baseline against target roles.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePreviewResumeImport}
                    disabled={importLoading}
                    className="btn btn-secondary btn-sm"
                    title="Import skills and title from your Phase 2 verified resume analysis"
                  >
                    {importLoading ? (
                      <SpinnerIcon className="spinner-icon" />
                    ) : (
                      <SparklesIcon className="icon-sm text-indigo" />
                    )}
                    <span>Import from Resume Analysis</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="btn btn-primary btn-sm"
                  >
                    {profileSaving ? (
                      <>
                        <SpinnerIcon className="spinner-icon" /> Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="profile-form">
                {/* Basic Information */}
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Current Role / Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Junior Full-Stack Developer"
                      value={profile.currentTitle}
                      onChange={(e) => setProfile({ ...profile, currentTitle: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Years of Professional Experience</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="50"
                      placeholder="e.g. 2.5"
                      value={profile.experienceYears}
                      onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Technical Skills Section */}
                <div className="profile-section">
                  <div className="section-head justify-between flex items-center">
                    <div>
                      <h4 className="section-heading">Verified Technical & Soft Skills</h4>
                      <p className="text-dim text-xs">
                        Add languages, frameworks, databases, and architectural competencies with your genuine proficiency.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn btn-secondary btn-sm"
                    >
                      <PlusIcon className="icon-sm" /> Add Skill
                    </button>
                  </div>

                  {profile.skills.length === 0 ? (
                    <p className="text-muted text-sm py-2">No skills added yet. Click 'Add Skill' or import from your resume.</p>
                  ) : (
                    <div className="dynamic-list">
                      {profile.skills.map((skill, idx) => (
                        <div key={idx} className="dynamic-item-row">
                          <input
                            type="text"
                            placeholder="Skill name (e.g. Node.js)"
                            value={skill.name}
                            onChange={(e) => updateSkill(idx, "name", e.target.value)}
                            className="form-input flex-2"
                          />
                          <select
                            value={skill.category || "Backend"}
                            onChange={(e) => updateSkill(idx, "category", e.target.value)}
                            className="form-select flex-1"
                          >
                            {SKILL_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <select
                            value={skill.level || "Intermediate"}
                            onChange={(e) => updateSkill(idx, "level", e.target.value)}
                            className="form-select flex-1"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeSkill(idx)}
                            className="btn-delete"
                            title="Remove skill"
                          >
                            <TrashIcon className="icon-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects Section */}
                <div className="profile-section">
                  <div className="section-head justify-between flex items-center">
                    <div>
                      <h4 className="section-heading">Projects & Practical Implementations</h4>
                      <p className="text-dim text-xs">
                        Notable technical projects, open-source repositories, or architecture builds.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addProject}
                      className="btn btn-secondary btn-sm"
                    >
                      <PlusIcon className="icon-sm" /> Add Project
                    </button>
                  </div>

                  {profile.projects.length === 0 ? (
                    <p className="text-muted text-sm py-2">No projects added yet.</p>
                  ) : (
                    <div className="dynamic-cards-list">
                      {profile.projects.map((proj, idx) => (
                        <div key={idx} className="dynamic-card">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-dim text-xs font-bold">Project #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeProject(idx)}
                              className="btn-delete"
                            >
                              <TrashIcon className="icon-sm" />
                            </button>
                          </div>
                          <div className="form-row-2 mb-2">
                            <input
                              type="text"
                              placeholder="Project Title"
                              value={proj.title}
                              onChange={(e) => updateProject(idx, "title", e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder="Technologies (e.g. React, PostgreSQL, Docker)"
                              value={proj.techStack}
                              onChange={(e) => updateProject(idx, "techStack", e.target.value)}
                              className="form-input"
                            />
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Description of architecture, features, and engineering accomplishments..."
                            value={proj.description}
                            onChange={(e) => updateProject(idx, "description", e.target.value)}
                            className="form-textarea mb-2"
                          />
                          <input
                            type="text"
                            placeholder="GitHub Link or Live URL (optional)"
                            value={proj.link}
                            onChange={(e) => updateProject(idx, "link", e.target.value)}
                            className="form-input"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience & Internships */}
                <div className="profile-section">
                  <div className="section-head justify-between flex items-center">
                    <div>
                      <h4 className="section-heading">Work Experience & Internships</h4>
                      <p className="text-dim text-xs">Roles, responsibilities, and achievements.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="btn btn-secondary btn-sm"
                    >
                      <PlusIcon className="icon-sm" /> Add Experience
                    </button>
                  </div>

                  {profile.experience.length === 0 ? (
                    <p className="text-muted text-sm py-2">No work experience entries added yet.</p>
                  ) : (
                    <div className="dynamic-cards-list">
                      {profile.experience.map((exp, idx) => (
                        <div key={idx} className="dynamic-card">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-dim text-xs font-bold">Experience #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeExperience(idx)}
                              className="btn-delete"
                            >
                              <TrashIcon className="icon-sm" />
                            </button>
                          </div>
                          <div className="form-row-3 mb-2">
                            <input
                              type="text"
                              placeholder="Role / Title"
                              value={exp.title}
                              onChange={(e) => updateExperience(idx, "title", e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder="Company / Organization"
                              value={exp.company}
                              onChange={(e) => updateExperience(idx, "company", e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="text"
                              placeholder="Duration (e.g. Jun 2023 - Present)"
                              value={exp.duration}
                              onChange={(e) => updateExperience(idx, "duration", e.target.value)}
                              className="form-input"
                            />
                          </div>
                          <textarea
                            rows={2}
                            placeholder="Key responsibilities and engineering accomplishments..."
                            value={exp.description}
                            onChange={(e) => updateExperience(idx, "description", e.target.value)}
                            className="form-textarea"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education Section */}
                <div className="profile-section">
                  <div className="section-head justify-between flex items-center">
                    <div>
                      <h4 className="section-heading">Education & Certifications</h4>
                      <p className="text-dim text-xs">Degrees, majors, and universities.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="btn btn-secondary btn-sm"
                    >
                      <PlusIcon className="icon-sm" /> Add Education
                    </button>
                  </div>

                  {profile.education.length === 0 ? (
                    <p className="text-muted text-sm py-2">No education records added yet.</p>
                  ) : (
                    <div className="dynamic-list">
                      {profile.education.map((edu, idx) => (
                        <div key={idx} className="dynamic-item-row">
                          <input
                            type="text"
                            placeholder="Degree (e.g. B.S.)"
                            value={edu.degree}
                            onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                            className="form-input flex-1"
                          />
                          <input
                            type="text"
                            placeholder="Field of Study (e.g. Computer Science)"
                            value={edu.field}
                            onChange={(e) => updateEducation(idx, "field", e.target.value)}
                            className="form-input flex-1"
                          />
                          <input
                            type="text"
                            placeholder="Institution"
                            value={edu.institution}
                            onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                            className="form-input flex-1"
                          />
                          <input
                            type="text"
                            placeholder="Grad Year"
                            value={edu.year}
                            onChange={(e) => updateEducation(idx, "year", e.target.value)}
                            className="form-input"
                            style={{ width: "90px" }}
                          />
                          <button
                            type="button"
                            onClick={() => removeEducation(idx)}
                            className="btn-delete"
                          >
                            <TrashIcon className="icon-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Career Interests Section */}
                <div className="profile-section">
                  <div className="section-head justify-between flex items-center">
                    <div>
                      <h4 className="section-heading">Career Interests & Specialized Domains</h4>
                      <p className="text-dim text-xs">Target focus areas, architectural paradigms, or emerging specializations (e.g. Distributed Systems, Kubernetes, GenAI).</p>
                    </div>
                  </div>

                  <div className="interest-input-wrap">
                    <input
                      type="text"
                      placeholder="Type an interest and press Add..."
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addInterest();
                        }
                      }}
                      className="form-input"
                    />
                    <button
                      type="button"
                      onClick={addInterest}
                      className="btn btn-secondary btn-sm"
                    >
                      <PlusIcon className="icon-sm" /> Add Interest
                    </button>
                  </div>

                  <div className="pill-list-sm mt-2">
                    {profile.interests?.length === 0 ? (
                      <p className="text-muted text-sm py-1">No interests listed yet.</p>
                    ) : (
                      profile.interests.map((interest, idx) => (
                        <span key={idx} className="interest-tag">
                          {interest}
                          <button
                            type="button"
                            onClick={() => removeInterest(idx)}
                            className="btn-tag-remove"
                            title="Remove interest"
                          >
                            ✕
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="btn btn-primary btn-lg"
                  >
                    {profileSaving ? "Saving Career Profile..." : "Save Career Profile"}
                  </button>
                </div>
              </form>
            </div>

            {/* Resume Import Preview Modal */}
            {showImportModal && importPreview && (
              <div className="modal-backdrop">
                <div className="modal-card">
                  <div className="modal-header">
                    <h3 className="modal-title flex items-center gap-2">
                      <SparklesIcon className="icon-sm text-indigo" /> Review Imported Resume Data
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="btn-icon-addon"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="alert alert-info mb-3">
                      <AlertCircleIcon className="alert-icon" />
                      <span>{importPreview.notice}</span>
                    </div>

                    <div className="import-preview-meta mb-3">
                      <span className="text-dim text-xs">
                        Source Document: <strong>{importPreview.importedFrom?.filename}</strong> (Role:{" "}
                        {importPreview.importedFrom?.jobTitle})
                      </span>
                    </div>

                    <div className="preview-field-block">
                      <label className="text-dim text-xs font-bold">Suggested Current Title:</label>
                      <p className="text-main font-semibold">{importPreview.currentTitle || "N/A"}</p>
                    </div>

                    <div className="preview-field-block mt-3">
                      <label className="text-dim text-xs font-bold">
                        Extracted Technical Skills ({importPreview.skills?.length || 0}):
                      </label>
                      <div className="pill-list-sm mt-1">
                        {importPreview.skills?.map((s, i) => (
                          <span key={i} className="skill-pill">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyImportedData}
                      className="btn btn-primary"
                    >
                      Apply to Profile Form
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: TRAJECTORY HISTORY VIEW
            =================================================================== */}
        {activeTab === "history" && (
          <div className="history-tab-layout">
            <div className="card">
              <div className="card-header justify-between">
                <div>
                  <h3 className="card-title flex items-center gap-2">
                    <HistoryIcon className="icon-sm text-indigo" /> Saved Trajectory Roadmaps
                  </h3>
                  <p className="card-desc">
                    Review or resume your previously simulated career roadmaps.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("roadmap");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <PlusIcon className="icon-sm" /> New Simulation
                </button>
              </div>

              {trajectoriesLoading ? (
                <div className="text-center py-5">
                  <SpinnerIcon className="spinner-icon text-indigo" />
                </div>
              ) : trajectoriesList.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted text-sm mb-3">No saved career trajectories yet.</p>
                  <button
                    onClick={() => setActiveTab("roadmap")}
                    className="btn btn-primary btn-sm"
                  >
                    Simulate Your First Career Trajectory
                  </button>
                </div>
              ) : (
                <div className="saved-trajectories-grid">
                  {trajectoriesList.map((item) => (
                    <div
                      key={item.id}
                      className={`trajectory-history-card ${
                        activeTrajectory?.id === item.id ? "card-selected" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <strong className="history-target-role">{item.targetRole}</strong>
                          <span className="history-timeframe-tag">
                            <CalendarIcon className="icon-sm" /> {item.targetTimeframe} horizon
                          </span>
                        </div>
                        <span
                          className="history-score-badge"
                          style={{ borderColor: getScoreColor(item.readinessScore) }}
                        >
                          {item.readinessScore}% Readiness
                        </span>
                      </div>

                      <div className="history-progress-wrap">
                        <div className="flex justify-between text-xs text-muted mb-1">
                          <span>Progress</span>
                          <span>
                            {item.completedMilestonesCount} / {item.milestonesCount} Milestones ({item.progressPercentage}%)
                          </span>
                        </div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${item.progressPercentage}%`,
                              backgroundColor: item.progressPercentage === 100 ? "#10B981" : "#6366F1",
                            }}
                          />
                        </div>
                      </div>

                      <div className="history-card-footer">
                        <span className="text-dim text-xs">
                          Created {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              loadTrajectoryDetails(item.id);
                              setActiveTab("roadmap");
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            Open Roadmap →
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTrajectory(item.id)}
                            className="btn-delete"
                            title="Delete trajectory"
                          >
                            <TrashIcon className="icon-sm" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
