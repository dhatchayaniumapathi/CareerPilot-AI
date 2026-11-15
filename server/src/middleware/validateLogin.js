/**
 * Validation middleware for user login
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  // Validate Email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address");
  }

  // Validate Password
  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Password is required");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  // Normalize trimmed email
  req.body.email = email.trim().toLowerCase();

  next();
}

module.exports = {
  validateLogin,
};
