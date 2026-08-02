const fs = require("fs");
const dbService = require("../services/dbService");
const searchService = require("../services/searchService");

const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded or file is not a PDF." });
    }

    const { originalname, filename, path: filePath, size } = req.file;
    let parsedText = "";

    try {
      // The file is parsed before saving its DB record so broken PDFs do not stay in the app.
      const fileBuffer = fs.readFileSync(filePath);
      parsedText = await searchService.extractText(fileBuffer);
    } catch (parseError) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return res.status(422).json({
        message: "Could not extract text from the PDF. It may be corrupted or image-only.",
        error: parseError.message
      });
    }

    const newPdf = await dbService.createPdf(
      req.user.id,
      originalname,
      filename,
      filePath,
      size,
      parsedText
    );

    // Raw extracted text can be large, so list/upload responses return only metadata.
    const { extractedText, ...pdfResponse } = newPdf;

    return res.status(201).json({
      message: "PDF uploaded and processed successfully.",
      pdf: pdfResponse
    });
  } catch (error) {
    next(error);
  }
};

const listPdfs = async (req, res, next) => {
  try {
    const pdfsList = await dbService.findPdfsByUserId(req.user.id);
    const responseList = pdfsList.map((pdf) => {
      const { extractedText, ...rest } = pdf;
      return rest;
    });

    return res.status(200).json({ pdfs: responseList });
  } catch (error) {
    next(error);
  }
};

const deletePdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pdf = await dbService.findPdfById(id);

    if (!pdf) {
      return res.status(404).json({ message: "PDF document not found." });
    }

    // Ownership is checked before touching disk or deleting the database row.
    if (pdf.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized. You do not own this PDF." });
    }

    if (fs.existsSync(pdf.filePath)) {
      fs.unlinkSync(pdf.filePath);
    }

    await dbService.deletePdf(id);

    return res.status(200).json({ message: "PDF document deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPdf,
  listPdfs,
  deletePdf
};
