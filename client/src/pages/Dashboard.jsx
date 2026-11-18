import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../api/axiosClient";
import {
  SparklesIcon,
  ShieldIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SpinnerIcon,
  UserIcon,
} from "../components/Icons";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const handleTestProtectedEndpoint = async () => {
    setProfileLoading(true);
    setProfileError("");
    setProfileData(null);

    try {
      const response = await axiosClient.get("/auth/profile");
      setProfileData(response.data);
    } catch (err) {
      setProfileError(
        err.response?.data?.message || "Failed to fetch protected profile data"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Welcome Banner */}
        <div className="dashboard-banner">
          <div className="banner-content">
            <div className="banner-badge">
              <SparklesIcon className="icon-sm" />
              <span>CareerPilot AI Dashboard</span>
            </div>
            <h1 className="banner-title">
              Welcome back, {user?.name || "Career Pilot"}!
            </h1>
            <p className="banner-subtitle">
              Your AI career companion is ready to analyze your profile and optimize your career trajectory.
            </p>
          </div>
          <div className="banner-actions">
            <button onClick={logout} className="btn btn-secondary">
              Sign Out
            </button>
          </div>
        </div>

        {/* User Status Card */}
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <div className="card-icon-wrap icon-indigo">
                <UserIcon className="icon-md" />
              </div>
              <div>
                <h3 className="card-title">User Account</h3>
                <p className="card-desc">Active session details</p>
              </div>
            </div>
            <div className="card-body">
              <div className="info-list">
                <div className="info-item">
                  <span className="info-label">Name</span>
                  <span className="info-value">{user?.name || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">User ID</span>
                  <span className="info-value badge-id">#{user?.id || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Authentication</span>
                  <span className="info-value" style={{ color: "#34D399" }}>
                    ✓ JWT Verified
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Protected API Test Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon-wrap icon-emerald">
                <ShieldIcon className="icon-md" />
              </div>
              <div>
                <h3 className="card-title">JWT Verification</h3>
                <p className="card-desc">Test protected route with your token</p>
              </div>
            </div>
            <div className="card-body">
              <p className="test-desc">
                Execute a live request to <code>GET /api/auth/profile</code> using your stored Bearer token.
              </p>

              <button
                onClick={handleTestProtectedEndpoint}
                disabled={profileLoading}
                className="btn btn-primary btn-block"
              >
                {profileLoading ? (
                  <>
                    <SpinnerIcon className="spinner-icon" />
                    <span>Verifying Token...</span>
                  </>
                ) : (
                  <span>Test GET /api/auth/profile</span>
                )}
              </button>

              {profileData && (
                <div className="result-box result-success">
                  <CheckCircleIcon className="alert-icon" />
                  <pre>{JSON.stringify(profileData, null, 2)}</pre>
                </div>
              )}

              {profileError && (
                <div className="result-box result-error">
                  <AlertCircleIcon className="alert-icon" />
                  <span>{profileError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feature Teasers */}
        <div className="features-preview">
          <h2 className="section-title">AI Career Modules</h2>
          <div className="features-grid">
            <div className="feature-card feature-card-active">
              <div className="feature-status status-active">Available Now</div>
              <h4 className="feature-title">AI Resume Tailoring</h4>
              <p className="feature-desc">
                Upload your PDF resume and target job description to receive transparent estimated match scores, missing skill detection, and honest tailored bullets.
              </p>
              <div style={{ marginTop: "1rem" }}>
                <Link to="/resume-tailor" className="btn btn-primary btn-sm">
                  Launch Resume Tailor →
                </Link>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-status">Coming Soon</div>
              <h4 className="feature-title">Career Trajectory Simulator</h4>
              <p className="feature-desc">
                Explore personalized pathways from junior to executive engineering roles.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-status">Coming Soon</div>
              <h4 className="feature-title">Mock Interview Assistant</h4>
              <p className="feature-desc">
                Simulate role-specific technical and behavioral interviews with real-time feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
