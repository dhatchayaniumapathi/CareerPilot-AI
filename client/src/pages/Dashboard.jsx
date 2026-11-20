import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  SparklesIcon,
  UserIcon,
  ShieldIcon,
  FileTextIcon,
  CompassIcon,
  TargetIcon,
  LayersIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "../components/Icons";

export default function Dashboard() {
  const { user } = useAuth();

  // Dynamic user name display with fallback
  const displayName = user?.name ? user.name.trim() : "Career Professional";

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="dashboard-banner">
          <div className="banner-content">
            <div className="banner-badge">
              <SparklesIcon className="icon-sm" />
              <span>AI Career Operations Platform</span>
            </div>
            <h1 className="banner-title">
              Welcome back, {displayName}!
            </h1>
            <p className="banner-subtitle">
              Your intelligent career co-pilot is ready. Analyze resume alignment against real job descriptions, bridge technical skill gaps, and simulate milestone-backed trajectory roadmaps.
            </p>
            <div className="banner-quick-actions">
              <Link to="/trajectory" className="btn btn-primary btn-sm">
                <CompassIcon className="icon-sm" />
                <span>Simulate Trajectory</span>
              </Link>
              <Link to="/resume-tailor" className="btn btn-secondary btn-sm">
                <FileTextIcon className="icon-sm" />
                <span>Tailor Resume</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Account & Platform Trust Overview (Factual Only - No Mock Data) */}
        <div className="dashboard-grid">
          {/* Account Profile Card (No User ID, dynamic name & email) */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon-wrap icon-indigo">
                <UserIcon className="icon-md" />
              </div>
              <div>
                <h3 className="card-title">Active Account</h3>
                <p className="card-desc">Authenticated user session</p>
              </div>
            </div>
            <div className="card-body">
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user?.name || "Not specified"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user?.email || "Not specified"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Session Status</span>
                  <span className="info-value session-active">
                    <CheckCircleIcon className="icon-sm text-emerald" />
                    <span>Authenticated Session</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Guardrails Card (Security & Standards) */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon-wrap icon-emerald">
                <ShieldIcon className="icon-md" />
              </div>
              <div>
                <h3 className="card-title">AI System Standards</h3>
                <p className="card-desc">Safety and integrity protocols</p>
              </div>
            </div>
            <div className="card-body">
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Verification Standard</span>
                  <span className="info-value text-emerald">Evidence-Based Resume Suggestions</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Scoring Method</span>
                  <span className="info-value">Estimated Match Alignment</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Data Privacy</span>
                  <span className="info-value">Protected User-Isolated Storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Career Modules Section */}
        <div className="features-preview">
          <div className="section-header">
            <div>
              <h2 className="section-title">AI Career Modules</h2>
              <p className="section-subtitle">
                Access specialized AI engines designed for strategic career planning and job application readiness.
              </p>
            </div>
          </div>

          <div className="features-grid">
            {/* Module 1: AI Resume Tailor (Available Now) */}
            <div className="feature-card feature-card-active">
              <div className="feature-card-content">
                <div className="feature-card-top">
                  <div className="card-icon-wrap icon-indigo">
                    <FileTextIcon className="icon-md" />
                  </div>
                  <span className="feature-status status-active">Available Now</span>
                </div>
                <h4 className="feature-title">AI Resume Tailoring</h4>
                <p className="feature-desc">
                  Upload your PDF resume and target job description to receive transparent estimated match scores, missing skill detection, and honest tailored bullets without invented experience.
                </p>
              </div>
              <div className="feature-card-action">
                <Link to="/resume-tailor" className="btn btn-primary btn-block">
                  <span>Launch Resume Tailor</span>
                  <ArrowRightIcon className="icon-sm" />
                </Link>
              </div>
            </div>

            {/* Module 2: Career Trajectory Simulator (Available Now) */}
            <div className="feature-card feature-card-active">
              <div className="feature-card-content">
                <div className="feature-card-top">
                  <div className="card-icon-wrap icon-purple">
                    <CompassIcon className="icon-md" />
                  </div>
                  <span className="feature-status status-active">Available Now</span>
                </div>
                <h4 className="feature-title">Career Trajectory Simulator</h4>
                <p className="feature-desc">
                  Build your verified career profile, benchmark against ambitious target roles, analyze prioritized skill gaps, and execute personalized project roadmaps with milestone tracking.
                </p>
              </div>
              <div className="feature-card-action">
                <Link to="/trajectory" className="btn btn-primary btn-block">
                  <span>Launch Career Simulator</span>
                  <ArrowRightIcon className="icon-sm" />
                </Link>
              </div>
            </div>

            {/* Module 3: Mock Interview Assistant (Coming Soon) */}
            <div className="feature-card feature-card-upcoming">
              <div className="feature-card-content">
                <div className="feature-card-top">
                  <div className="card-icon-wrap icon-muted">
                    <TargetIcon className="icon-md" />
                  </div>
                  <span className="feature-status status-coming-soon">Coming Soon</span>
                </div>
                <h4 className="feature-title">Mock Interview Assistant</h4>
                <p className="feature-desc">
                  Simulate role-specific technical and behavioral interviews with real-time feedback, communication coaching, and question-by-question scoring.
                </p>
              </div>
              <div className="feature-card-action">
                <button disabled className="btn btn-secondary btn-block btn-disabled">
                  <span>In Development</span>
                </button>
              </div>
            </div>

            {/* Module 4: Market Compensation Benchmark (Coming Soon) */}
            <div className="feature-card feature-card-upcoming">
              <div className="feature-card-content">
                <div className="feature-card-top">
                  <div className="card-icon-wrap icon-muted">
                    <LayersIcon className="icon-md" />
                  </div>
                  <span className="feature-status status-coming-soon">Coming Soon</span>
                </div>
                <h4 className="feature-title">Compensation Benchmarking</h4>
                <p className="feature-desc">
                  Explore transparent role salary distributions, seniority-weighted equity structures, and regional compensation patterns backed by verified data.
                </p>
              </div>
              <div className="feature-card-action">
                <button disabled className="btn btn-secondary btn-block btn-disabled">
                  <span>In Development</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
