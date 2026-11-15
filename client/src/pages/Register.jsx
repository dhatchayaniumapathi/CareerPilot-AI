import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import {
  UserIcon,
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

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState("");
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
    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName) {
      errors.name = "Full name is required";
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters long";
    } else if (trimmedName.length > 100) {
      errors.name = "Name cannot exceed 100 characters";
    }

    if (!trimmedEmail) {
      errors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    } else if (formData.password.length > 128) {
      errors.password = "Password cannot exceed 128 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    setLoading(true);

    try {
      // 1. Call Register API
      await axiosClient.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // 2. Automatically log the user in for seamless experience
      try {
        const loginResponse = await axiosClient.post("/auth/login", {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });

        const { token, user } = loginResponse.data.data;
        login(token, user);
        navigate("/dashboard", { replace: true });
      } catch {
        // Fallback to login page if auto-login fails
        navigate("/login", {
          state: {
            registeredEmail: formData.email.trim().toLowerCase(),
            message: "Account created successfully! Please sign in.",
          },
        });
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setApiError("This email is already registered. Please sign in instead.");
        } else if (err.response.data?.errors) {
          setApiError(err.response.data.errors.join(", "));
        } else {
          setApiError(err.response.data?.message || "Registration failed.");
        }
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
            <span>Launch Your Next Step</span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">
            Get intelligent roadmap insights and unlock AI-powered career tools.
          </p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="alert alert-error">
            <AlertCircleIcon className="alert-icon" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <div className={`input-wrapper ${fieldErrors.name ? "input-error" : ""}`}>
              <UserIcon className="input-icon" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            {fieldErrors.name && (
              <span className="error-text">{fieldErrors.name}</span>
            )}
          </div>

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
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className={`input-wrapper ${fieldErrors.password ? "input-error" : ""}`}>
              <LockIcon className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
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
            <span className="hint-text">
              Must be at least 8 characters long.
            </span>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div
              className={`input-wrapper ${
                fieldErrors.confirmPassword ? "input-error" : ""
              }`}
            >
              <LockIcon className="input-icon" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            {fieldErrors.confirmPassword && (
              <span className="error-text">{fieldErrors.confirmPassword}</span>
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRightIcon className="icon-sm" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
