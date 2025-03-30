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

    // Download de afbeelding in het geheugen
    const response = await axios({
      url: imageUrl,
      method: "GET",
      responseType: "arraybuffer", // Download als buffer
    });

    const imageBuffer = Buffer.from(response.data, "binary");

    // Analyseer de afbeelding
    const result = await analyzeImage(imageBuffer);

    res.json(result);
  } catch (error) {
    console.error("Fout bij AI-analyse van afbeelding:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
