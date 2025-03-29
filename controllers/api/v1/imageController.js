// controllers/api/v1/imageController.js
const analyzeImage = require("../../../services/ImageAnalysisService"); // Dit is nu correct

const create = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log("Afbeelding URL ontvangen:", imageUrl); // Log de ontvangen URL

    if (!imageUrl) {
      return res.status(400).json({ error: "Geen afbeelding URL opgegeven." });
    }

    // Probeer de afbeelding te analyseren
    const metadata = await analyzeImage(imageUrl); // Hier roep je de functie aan
    console.log("Geanalyseerde metadata:", metadata); // Log de metadata als alles goed gaat

    return res.json(metadata);
  } catch (error) {
    console.error("Fout bij het analyseren van afbeelding:", error); // Log de fout
    res.status(500).json({
      error: "Kan afbeelding niet analyseren.",
      details: error.message,
    }); // Geef gedetailleerde fout terug
  }
};

module.exports = { create };
