const authService = require("../services/authService");

/**
 * Controller for user registration
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerUser({ name, email, password });

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * Controller for user login
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.message,
      });
    }
    next(error);
  }
}

/**
 * Controller for protected profile test route
 * GET /api/auth/profile
 */
async function getProfile(req, res, next) {
  try {
    return res.status(200).json({
      status: "success",
      message: "Profile retrieved successfully",
      data: {
        userId: req.user.id,
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
};
