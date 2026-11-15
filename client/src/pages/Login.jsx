import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  SparklesIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  SpinnerIcon,
  CheckCircleIcon,
} from "../components/Icons";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const validate = () => {
    const errors = {};
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setApiError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await axiosClient.post("/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { token, user } = response.data.data;
      login(token, user);

      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.response) {
        // Backend sent an error response
        const message =
          err.response.data?.message ||
          (err.response.status === 401
            ? "Invalid email or password"
            : "Login failed. Please try again.");
        setApiError(message);
      } else if (err.request) {
        setApiError(
          "Cannot connect to CareerPilot server. Please ensure the backend is running on http://localhost:5000."
        );
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-badge">
            <SparklesIcon className="icon-sm" />
            <span>AI-Powered Career Intelligence</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to access your personalized career roadmaps and AI insights.
          </p>
        </div>

        {/* Success Alert (e.g. redirected from registration) */}
        {successMessage && (
          <div className="alert alert-success">
            <CheckCircleIcon className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {apiError && (
          <div className="alert alert-error">
            <AlertCircleIcon className="alert-icon" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className={`input-wrapper ${fieldErrors.email ? "input-error" : ""}`}>
              <MailIcon className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            {fieldErrors.email && (
              <span className="error-text">{fieldErrors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password" className="form-label">
                Password
              </label>
            </div>
            <div className={`input-wrapper ${fieldErrors.password ? "input-error" : ""}`}>
              <LockIcon className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn-icon-addon"
                title={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon className="icon-sm" />
                ) : (
                  <EyeIcon className="icon-sm" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="error-text">{fieldErrors.password}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block btn-lg"
          >
            {loading ? (
              <>
                <SpinnerIcon className="spinner-icon" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in to CareerPilot</span>
                <ArrowRightIcon className="icon-sm" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
