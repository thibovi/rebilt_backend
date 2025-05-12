require("dotenv").config();
const axios = require("axios");
const MESHY_API_URL = process.env.MESHY_API_URL;
const MESHY_API_KEY = process.env.MESHY_API_KEY;

const uploadToMeshy = async (imageUrl) => {
  const headers = {
    Authorization: `Bearer ${MESHY_API_KEY}`,
  };

  const payload = {
    image_url: imageUrl,
    enable_pbr: true,
    should_remesh: true,
    should_texture: true,
  };

  try {
    const response = await axios.post(MESHY_API_URL, payload, { headers });

    // Log the full response from Meshy.ai
    console.log("Meshy.ai response:", response.data);

    // Validate the response structure
    if (!response.data || !response.data.result) {
      throw new Error("Invalid response from Meshy.ai: Missing result.");
    }

    // If result is a string, assume it's the ID
    const result =
      typeof response.data.result === "string"
        ? { id: response.data.result }
        : response.data.result;

    return result;
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

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "No images provided" });
  }

  try {
    const imageUrl = images[0];
    const result = await uploadToMeshy(imageUrl);

    // Controleer of de respons een ID bevat
    if (!result || !result.id) {
      throw new Error("Meshy.ai did not return a valid ID.");
    }

    // Log de volledige respons van Meshy.ai
    console.log("Meshy.ai response:", result);

    // Zorg ervoor dat de respons de ID en model_url bevat
    return res.status(200).json({
      message: "3D model generated successfully",
      id: result.id, // Voeg de ID toe aan de respons
      model_url: result.model_urls?.glb || null, // Voeg de GLB URL toe als deze bestaat
    });
  } catch (error) {
    console.error("Error in create function:", error.message);
    return res.status(500).json({
      error: "Failed to generate 3D model",
      details: error.message,
    });
  }
};

const show = async (req, res) => {
  const { id: taskId } = req.params;
  const headers = {
    Authorization: `Bearer ${MESHY_API_KEY}`,
  };

  try {
    const response = await axios.get(`${MESHY_API_URL}/${taskId}`, { headers });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error fetching model from Meshy.ai:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      error: "Failed to fetch model details",
      details: error.response?.data || error.message,
    });
  }
};

module.exports = { create, show };
