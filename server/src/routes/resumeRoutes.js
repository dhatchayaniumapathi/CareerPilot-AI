const express = require("express");
const resumeController = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");
const { handlePdfUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

// All resume routes are protected by JWT authentication
router.use(authMiddleware);

// POST /api/resume/tailor (Multipart PDF upload + job details)
router.post("/tailor", handlePdfUpload, resumeController.tailor);

// GET /api/resume/history (List past analyses)
router.get("/history", resumeController.getHistory);

// GET /api/resume/:id (Get single analysis details)
router.get("/:id", resumeController.getById);

// DELETE /api/resume/:id (Delete analysis record)
router.delete("/:id", resumeController.deleteRecord);

module.exports = router;
