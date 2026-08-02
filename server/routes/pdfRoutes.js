const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pdfController = require("../controllers/pdfController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueName + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Extension and MIME type are checked to avoid accepting renamed non-PDF files.
  if (ext !== ".pdf" || file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    upload.single("pdf")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          message: `Upload error: ${err.message}`
        });
      }

      if (err) {
        return res.status(400).json({
          message: err.message
        });
      }

      pdfController.uploadPdf(req, res, next);
    });
  }
);

router.get("/list", authMiddleware, pdfController.listPdfs);
router.delete("/:id", authMiddleware, pdfController.deletePdf);

module.exports = router;
