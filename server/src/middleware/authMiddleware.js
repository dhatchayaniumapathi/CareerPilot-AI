const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "fail",
      message: "Authorization token required",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Authorization token required",
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "default_careerpilot_secret";
    const decoded = jwt.verify(token, jwtSecret);

    // Attach authenticated user's ID to req.user
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid or expired token",
    });
  }
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
