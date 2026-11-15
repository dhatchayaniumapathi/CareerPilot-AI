import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoIcon, SparklesIcon } from "./Icons";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <LogoIcon className="navbar-logo" />
          <div className="brand-text">
            <span className="brand-name">CareerPilot</span>
            <span className="brand-ai-badge">
              <SparklesIcon className="badge-sparkle" /> AI
            </span>
          </div>
        </Link>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-nav">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <span className="user-greeting">
                Hi, <strong>{user?.name?.split(" ")[0] || "User"}</strong>
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="guest-nav">
              <Link to="/login" className="nav-link">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
