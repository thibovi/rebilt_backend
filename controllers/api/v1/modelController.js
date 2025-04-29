const fs = require("fs");
const path = require("path");

// Function to generate a 3D model from images
const create = (req, res) => {
  const images = req.body.images; // Expecting an array of image paths

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "No images provided" });
  }

  try {
    // Process images and generate a model
    const modelData = processImagesToModel(images);

    // Save the model data to a file
    const modelFileName = "generatedModel.json";
    const modelPath = path.join(__dirname, "../../../models", modelFileName);
    fs.writeFileSync(modelPath, JSON.stringify(modelData));

    // Return a public URL to the model
    const publicModelUrl = `${req.protocol}://${req.get(
      "host"
    )}/models/${modelFileName}`;

    return res.status(200).json({
      message: "3D model generated successfully",
      modelPath: publicModelUrl, // Retourneer de URL in plaats van het lokale pad
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to generate 3D model",
      details: error.message,
    });
  }
};

// Placeholder function for processing images
const processImagesToModel = (images) => {
  // Implement image processing logic here
  // Return a mock model data for now
  return {
    dimensions: { width: 100, height: 100, depth: 100 },
    textures: images.map((image) => ({ path: image })),
    createdAt: new Date(),
  };
};

module.exports = { create };
