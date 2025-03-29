const analyzeImage = require("../../../services/ImageAnalysisService");
const create = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    console.log("Afbeelding URL ontvangen:", imageUrl);
    if (!imageUrl) {
      return res.status(400).json({ error: "Geen afbeelding URL opgegeven." });
    }

    const metadata = await analyzeImage(imageUrl);

    return res.json(metadata);
  } catch (error) {
    console.error("Fout bij het analyseren van afbeelding:", error);
    res.status(500).json({ error: "Kan afbeelding niet analyseren." });
  }
};

module.exports = { create };
