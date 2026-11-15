const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// CORS configuration supporting environment variable for frontend origin
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN
    ? (process.env.CLIENT_ORIGIN.includes(",")
        ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
        : process.env.CLIENT_ORIGIN)
    : "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Health-check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "CareerPilot AI API is running",
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
