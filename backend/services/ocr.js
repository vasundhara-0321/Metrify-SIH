const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

let worker = null;

/* =========================
   INITIALIZE OCR WORKER
========================= */
async function getWorker() {
  if (!worker) {
    worker = await Tesseract.createWorker("eng");
  }

  return worker;
}

/* =========================
   CLEAN OCR TEXT
========================= */
function cleanText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* =========================
   EXTRACT DECLARATIONS
========================= */
function extractDeclarations(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const result = {
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    /* PRODUCT NAME */
    if (
      !result.productName &&
      /^(product|product name|name of product)\s*[:\-]/i.test(line)
    ) {
      result.productName = line
        .replace(/^(product|product name|name of product)\s*[:\-]\s*/i, "")
        .trim();
    }

    /* MANUFACTURER */
    if (
      !result.manufacturer &&
      /(manufactured by|manufactured & marketed by|manufactured at)/i.test(
        line
      )
    ) {
      result.manufacturer = line.trim();
    }

    /* PACKER */
    if (!result.packer && /(packed by|packer)/i.test(line)) {
      result.packer = line.trim();
    }

    /* IMPORTER */
    if (!result.importer && /(imported by|importer)/i.test(line)) {
      result.importer = line.trim();
    }

    /* COUNTRY OF ORIGIN */
    if (
      !result.countryOfOrigin &&
      /(country of origin|made in|country of manufacture)/i.test(line)
    ) {
      result.countryOfOrigin = line.trim();
    }

    /* NET QUANTITY / CONTENT */
    if (
      !result.netQuantity &&
      /(net (quantity|qty|content)|net wt|net weight|contents)/i.test(line)
    ) {
      const match = line.match(
        /(\d+(?:\.\d+)?)\s*(kg|g|mg|l|ml|litre|liter|cm3|cm³|pcs|pieces)\b/i
      );

      result.netQuantity = match
        ? match[0].trim()
        : line.replace(/.*?(net\s*(quantity|qty|content)|contents)\s*[:\-]?\s*/i, "").trim();
    }

    /* BATCH NUMBER */
    if (
      !result.batchNumber &&
      /(batch no|batch number|batch|lot no|lot number)/i.test(line)
    ) {
      result.batchNumber = line.trim();
    }

    /* MANUFACTURING DATE */
    if (
      !result.manufacturingDate &&
      /(date of mfg|date of manufacture|mfg date|manufactured on|mfd)/i.test(
        line
      )
    ) {
      result.manufacturingDate = line.trim();
    }

    /* BEST BEFORE / USE BY */
    if (
      !result.bestBefore &&
      /(best before|use by|expiry|expires|exp date)/i.test(line)
    ) {
      result.bestBefore = line.trim();
    }

    /* MRP */
    if (!result.mrp && /\bmrp\b/i.test(line)) {
      const match = line.match(
        /(?:mrp|maximum retail price)[^₹\d]*(₹?\s*[\d,]+(?:\.\d{1,2})?)/i
      );

      result.mrp = match ? match[1].trim() : line.trim();
    }

    /* CONSUMER CARE */
    if (
      !result.consumerCare &&
      /(consumer care|customer care|for queries|helpline|contact us)/i.test(
        line
      )
    ) {
      result.consumerCare = line.trim();

      if (lines[i + 1]) {
        result.consumerCare += " " + lines[i + 1];
      }
    }

    /* UNIT SALE PRICE */
    if (
      !result.unitSalePrice &&
      /(unit sale price|unit price|price per)/i.test(line)
    ) {
      result.unitSalePrice = line.trim();
    }
  }

  return result;
}

/* =========================
   CREATE IMAGE VARIANTS
========================= */
async function createVariants(inputPath, outputDir) {
  const base = path.join(outputDir, "metrify_ocr");

  const normal = `${base}_normal.png`;
  const gray = `${base}_gray.png`;
  const contrast = `${base}_contrast.png`;
  const threshold = `${base}_threshold.png`;

  await sharp(inputPath)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: false,
    })
    .png()
    .toFile(normal);

  await sharp(inputPath)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: false,
    })
    .grayscale()
    .normalize()
    .sharpen()
    .png()
    .toFile(gray);

  await sharp(inputPath)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: false,
    })
    .grayscale()
    .normalize()
    .linear(1.4, -20)
    .sharpen()
    .png()
    .toFile(contrast);

  await sharp(inputPath)
    .rotate()
    .resize({
      width: 2400,
      height: 2400,
      fit: "inside",
      withoutEnlargement: false,
    })
    .grayscale()
    .normalize()
    .threshold(170)
    .png()
    .toFile(threshold);

  return [normal, gray, contrast, threshold];
}

/* =========================
   OCR SINGLE IMAGE
========================= */
async function runOCR(imagePath) {
  const ocrWorker = await getWorker();

  const result = await ocrWorker.recognize(imagePath);

  return result?.data?.text || "";
}

/* =========================
   MAIN OCR FUNCTION
========================= */
async function extractText(inputPath) {
  if (!inputPath) {
    throw new Error("No image path provided.");
  }

  if (!fs.existsSync(inputPath)) {
    throw new Error(`Image file not found: ${inputPath}`);
  }

  const outputDir = path.dirname(inputPath);

  console.log("METRIFY OCR: Processing image...");

  const variants = await createVariants(inputPath, outputDir);

  let allText = [];

  for (const imagePath of variants) {
    try {
      console.log(`METRIFY OCR: Reading ${path.basename(imagePath)}`);

      const text = await runOCR(imagePath);

      if (text && text.trim()) {
        allText.push(text);
      }
    } catch (error) {
      console.error(
        `METRIFY OCR: Failed on ${path.basename(imagePath)}`
      );
    }
  }

  /* Combine OCR results */
  const combinedText = allText.join("\n");

  const cleanedText = cleanText(combinedText);

  /* Extract structured declarations */
  const declarations = extractDeclarations(cleanedText);

  console.log("METRIFY OCR: Text extracted successfully.");

  return {
    text:
      cleanedText ||
      "No readable text was detected from the package image.",
    declarations,
  };
}

/* =========================
   CLOSE OCR
========================= */
async function closeOCR() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

console.log("METRIFY: UPDATED OCR.JS LOADED");

module.exports = {
  extractText,
  closeOCR,
};