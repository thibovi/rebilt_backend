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
    return response.data.result;
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
    await uploadToMeshy(imageUrl);

    return res.status(200).json({
      message: "3D model generated successfully",
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
