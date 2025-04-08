// controllers/api/v1/imageController.js
const analyzeImage = require("../../../services/ImageAnalysisService"); // Dit is nu correct

const create = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log("Afbeelding URL ontvangen:", imageUrl);

    if (!imageUrl) {
      return res.status(400).json({ error: "Geen afbeelding URL opgegeven." });
    }

    // Probeer de afbeelding te analyseren
    console.log("Start analyse van afbeelding...");
    const metadata = await analyzeImage(imageUrl);
    console.log("Geanalyseerde metadata:", metadata);

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
