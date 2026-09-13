const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { extractText } = require("../services/ocr");
const { runRuleEngine } = require("../services/ruleEngine");

const router = express.Router();

/* =========================
   UPLOAD DIRECTORY
========================= */

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
   MULTER
========================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
});

/* =========================
   ANALYZE PACKAGE
========================= */

router.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    console.log("METRIFY: /analyze request received");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No package image was uploaded.",
      });
    }

    console.log("METRIFY: Image received:", req.file.path);

    /* =========================
       OCR
    ========================= */

    const ocrResult = await extractText(req.file.path);

    console.log("METRIFY: OCR RESULT OBJECT:");
    console.log(JSON.stringify(ocrResult, null, 2));

    const extractedText =
      ocrResult?.text ||
      "No readable text was detected from the package image.";

    const declarations = ocrResult?.declarations || {
      productName: null,
      manufacturer: null,
      packer: null,
      importer: null,
      countryOfOrigin: null,
      netQuantity: null,
      batchNumber: null,
      manufacturingDate: null,
      bestBefore: null,
      mrp: null,
      consumerCare: null,
      unitSalePrice: null,
    };

    /* =========================
       RULE ENGINE
    ========================= */

    const ruleCompliance = runRuleEngine(declarations);

    console.log("METRIFY: RULE ENGINE RESULT:");
    console.log(JSON.stringify(ruleCompliance, null, 2));

    /* =========================
       INSPECTION ID
    ========================= */

    const inspectionId = `MET-${Date.now()}`;

    /* =========================
       RESPONSE
    ========================= */

    return res.status(200).json({
      success: true,

      inspectionId,

      message: "Package analyzed successfully.",

      ocr: {
        text: extractedText,
        declarations,
      },

      ruleCompliance,

      officerVerificationRequired: true,
    });
  } catch (error) {
    console.error("METRIFY: Inspection error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to analyze the package.",
      error: error.message,
    });
  }
});

console.log("METRIFY: UPDATED INSPECTION.JS LOADED");

module.exports = router;