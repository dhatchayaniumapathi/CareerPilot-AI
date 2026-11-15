/**
 * Validation middleware for user registration
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  const errors = [];

  // Validate Name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string");
  } else if (name.trim().length < 2 || name.trim().length > 100) {
    errors.push("Name must be between 2 and 100 characters long");
  }

  // Validate Email
  if (!email || typeof email !== "string" || email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address");
  }

  // Validate Password
  if (!password || typeof password !== "string") {
    errors.push("Password is required and must be a string");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else if (password.length > 128) {
    errors.push("Password cannot exceed 128 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  // Normalize trimmed values
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();

  next();
}

module.exports = {
  validateRegister,
};
