const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const { validateRegister } = require("../middleware/validateRegister");
const { validateLogin } = require("../middleware/validateLogin");

const router = express.Router();

// POST /api/auth/register
router.post("/register", validateRegister, authController.register);

// POST /api/auth/login
router.post("/login", validateLogin, authController.login);

// GET /api/auth/profile (Protected test route)
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;
