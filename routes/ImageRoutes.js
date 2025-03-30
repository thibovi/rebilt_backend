const express = require("express");
const multer = require("multer");
const path = require("path");
const analyzeImage = require("../services/ImageAnalysisService");

const router = express.Router();

// Configureer multer voor bestanduploads
const upload = multer({ dest: path.join(__dirname, "../uploads/") });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Analyseer de afbeelding
    const result = await analyzeImage(imagePath);

    // Verwijder de geüploade afbeelding na analyse
    fs.unlinkSync(imagePath);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
