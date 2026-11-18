const multer = require("multer");

// Configure in-memory storage for PDF processing
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExt = file.originalname.toLowerCase().endsWith(".pdf");

    if (isPdfMime && isPdfExt) {
      cb(null, true);
    } else {
      const error = new Error("Only PDF files are supported. Please upload a .pdf resume.");
      error.statusCode = 400;
      cb(error, false);
    }
  },
});

/**
 * Middleware wrapper to handle multer upload and return clean JSON errors
 */
function handlePdfUpload(req, res, next) {
  const singleUpload = upload.single("resume");

  singleUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "fail",
          message: "Uploaded file is too large. Maximum allowed size is 5MB.",
        });
      }
      return res.status(400).json({
        status: "fail",
        message: `File upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(err.statusCode || 400).json({
        status: "fail",
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "fail",
        message: "Resume PDF file is required. Please provide a file under the 'resume' field.",
      });
    }

    next();
  });
}

module.exports = {
  handlePdfUpload,
};
