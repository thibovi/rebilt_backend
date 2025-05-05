require("dotenv").config(); // Laad de .env-variabelen
const axios = require("axios");

const MESHY_API_URL = process.env.MESHY_API_URL; // Haal de API-URL uit .env
const MESHY_API_KEY = process.env.MESHY_API_KEY; // Haal de API-sleutel uit .env

const uploadToMeshy = async (imageUrl) => {
  const headers = {
    Authorization: `Bearer ${MESHY_API_KEY}`,
  };

  const payload = {
    image_url: imageUrl, // Gebruik 'image_url' in plaats van 'ImageURLs'
    enable_pbr: true,
    should_remesh: true,
    should_texture: true,
  };

  try {
    console.log("Sending payload to Meshy.ai:", payload);

    const response = await axios.post(MESHY_API_URL, payload, { headers });

    console.log(response.data); // Log de volledige response van de API
    return response.data.model_url; // Retourneer de URL van het gegenereerde 3D-model
  } catch (error) {
    console.error(
      "Error uploading to Meshy.ai:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Failed to upload image to Meshy.ai"
    );
  }
};

const create = async (req, res) => {
  const { images } = req.body;

  console.log("Received images:", images);

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "No images provided" });
  }

  try {
    // Verwerk de eerste afbeelding in de array
    const imageUrl = images[0]; // Gebruik de eerste afbeelding
    const modelUrl = await uploadToMeshy(imageUrl);

    return res.status(200).json({
      message: "3D model generated successfully",
      modelPath: modelUrl,
    });
  } catch (error) {
    console.error("Error in create function:", error.message);
    return res.status(500).json({
      error: "Failed to generate 3D model",
      details: error.message,
    });
  }
};

module.exports = { create };
