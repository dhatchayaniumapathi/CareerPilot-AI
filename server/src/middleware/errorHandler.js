/**
 * 404 handler for undefined endpoints
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    status: "fail",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  if (statusCode === 500) {
    console.error("Unhandled error:", err);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message: statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
