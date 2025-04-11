// routes/api/v1/imageAnalysis.js
const express = require("express");
const axios = require("axios");
const analyzeImage = require("../../../services/ImageAnalysisService"); // Zorg ervoor dat dit correct is

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "imageUrl is vereist" });
    }

    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data, "binary");
    const result = await analyzeImage(imageBuffer);

    res.json(result);
  } catch (error) {
    console.error("Fout bij AI-analyse van afbeelding:", error.stack); // Stacktrace loggen
    res.status(500).json({
      error: "Kan afbeelding niet analyseren.",
      details: error.message,
    });
  }
});

module.exports = router;
