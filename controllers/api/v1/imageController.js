// controllers/api/v1/imageController.js
const analyzeImage = require("../../../services/ImageAnalysisService"); // Dit is nu correct

const create = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Geen afbeelding URL opgegeven." });
    }

    const metadata = await analyzeImage(imageUrl);

    return res.json(metadata);
  } catch (error) {
    console.error("Fout bij het analyseren van afbeelding:", error.stack); // Stacktrace loggen
    res.status(500).json({
      error: "Kan afbeelding niet analyseren.",
      details: error.message,
    });
  }
};

module.exports = { create };
