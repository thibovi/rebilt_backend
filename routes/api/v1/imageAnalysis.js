// routes/api/v1/imageAnalysis.js
const express = require("express");
const router = express.Router();
const analyzeImage = require("../../../services/ImageAnalysisService"); // Importeer de juiste functie

router.post("/", async (req, res) => {
  try {
    const result = await analyzeImage(req.body.imagePath); // Zorg ervoor dat de juiste data wordt verzonden
    res.setHeader("Access-Control-Allow-Origin", "*"); // Voeg expliciete CORS-header toe
    res.json(result);
  } catch (error) {
    console.error("Fout bij AI-analyse van afbeelding:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
