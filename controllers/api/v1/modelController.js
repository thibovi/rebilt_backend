const axios = require("axios");

const MESHY_API_URL = "https://api.meshy.ai/openapi/v1/image-to-3d";
const MESHY_API_KEY = "msy_syQoepFKHteZQnvUInBpTxjAlPNTLu2Rq5Y5"; // Vervang dit door je eigen API-sleutel

/**
 * Functie om een afbeelding naar Meshy.ai te sturen en een 3D-model te genereren.
 * @param {string} imageUrl - De publiek toegankelijke URL van de afbeelding.
 * @returns {Promise<string>} - De URL van het gegenereerde 3D-model.
 */
const uploadToMeshy = async (imageUrl) => {
  try {
    const headers = {
      Authorization: `Bearer ${MESHY_API_KEY}`,
    };

    const payload = {
      image_url: imageUrl, // Publiek toegankelijke URL van de afbeelding
      enable_pbr: true, // Schakel PBR in (Physically Based Rendering)
      should_remesh: true, // Vraag om remeshing
      should_texture: true, // Vraag om texturering
    };

    const response = await axios.post(MESHY_API_URL, payload, { headers });

    if (response.status !== 200) {
      throw new Error("Failed to upload image to Meshy.ai");
    }

    return response.data.model_url; // URL van het gegenereerde 3D-model
  } catch (error) {
    console.error(
      "Error uploading to Meshy.ai:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Express route handler om een 3D-model te genereren op basis van een afbeelding.
 * @param {Object} req - De Express request object.
 * @param {Object} res - De Express response object.
 */
const create = async (req, res) => {
  const { images } = req.body; // Verwacht een array van afbeeldings-URL's

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "No images provided" });
  }

  try {
    // Verwerk de eerste afbeelding (Meshy.ai ondersteunt mogelijk één afbeelding per request)
    const imageUrl = images[0]; // Gebruik de eerste afbeelding in de array
    const modelUrl = await uploadToMeshy(imageUrl);

    // Retourneer de URL van het gegenereerde 3D-model
    return res.status(200).json({
      message: "3D model generated successfully",
      modelPath: modelUrl,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to generate 3D model",
      details: error.message,
    });
  }
};

module.exports = { create };
