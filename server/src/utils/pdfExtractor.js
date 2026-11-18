const pdfParseModule = require("pdf-parse");

/**
 * Extracts and cleans text from a PDF buffer in memory
 * @param {Buffer} buffer - Raw PDF buffer from multer memoryStorage
 * @returns {Promise<{ text: string, numPages: number }>}
 */
async function extractTextFromPdf(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    const error = new Error("Invalid PDF buffer provided");
    error.statusCode = 400;
    throw error;
  }

  let text = "";
  let totalPages = 1;

  try {
    if (typeof pdfParseModule.PDFParse === "function") {
      const parser = new pdfParseModule.PDFParse({ data: buffer });
      try {
        const result = await parser.getText();
        text = result.text || "";
        totalPages = result.total || 1;
      } finally {
        if (typeof parser.destroy === "function") {
          await parser.destroy();
        }
      }
    } else if (typeof pdfParseModule === "function") {
      const data = await pdfParseModule(buffer);
      text = data.text || "";
      totalPages = data.numpages || 1;
    } else {
      throw new Error("PDF parser library could not be initialized");
    }
  } catch (err) {
    const error = new Error(`Failed to parse PDF document: ${err.message}`);
    error.statusCode = 422;
    throw error;
  }

  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleanedText || cleanedText.length < 30) {
    const error = new Error(
      "No readable text could be extracted from the uploaded PDF. Please ensure the document is not an image-only scan or password-protected, and contains selectable text."
    );
    error.statusCode = 422;
    throw error;
  }

  return {
    text: cleanedText,
    numPages: totalPages,
  };
}

module.exports = {
  extractTextFromPdf,
};
