const multer = require("multer");
const Cloudinary = require("../../../models/api/v1/Cloudinary");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create a new Cloudinary entry
// ...existing code...
const create = async (req, res) => {
  try {
    const { name, fileUrl, partnerId } = req.body;

    if (!name || !fileUrl || !partnerId) {
      return res.status(400).json({
        status: "error",
        message: "Name, fileUrl, and partnerId are required",
      });
    }

    // Als het bestand al op Cloudinary staat, sla alleen de URL op
    if (fileUrl.startsWith("https://res.cloudinary.com/")) {
      const newCloudinary = new Cloudinary({
        partnerId,
        name,
        modelFile: fileUrl,
      });
      const savedModel = await newCloudinary.save();
      return res.status(201).json({ status: "success", data: savedModel });
    }

    // Anders: upload het bestand naar Cloudinary (voor niet-Cloudinary URLs)
    let result;
    try {
      result = await cloudinary.uploader.upload(fileUrl, {
        resource_type: "auto",
        folder: "models",
        public_id: `models/${name.replace(/\s+/g, "_").toLowerCase()}`,
        context: `display_name=${name}`,
      });
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      return res.status(500).json({
        status: "error",
        message: "Cloudinary upload failed",
        error: uploadError.message,
      });
    }

    const newCloudinary = new Cloudinary({
      partnerId,
      name,
      modelFile: result.secure_url,
    });

    const savedModel = await newCloudinary.save();
    res.status(201).json({ status: "success", data: savedModel });
  } catch (error) {
    console.error("Error in create controller:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "General Error",
      stack: error.stack,
    });
  }
};
// ...existing code...

// List all Cloudinary entries
const index = async (req, res) => {
  try {
    const models = await Cloudinary.find();
    res.status(200).json({ status: "success", data: models });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve models",
      error: error.message,
    });
  }
};

// Show a specific Cloudinary entry by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await Cloudinary.findById(id);
    if (!model) {
      return res.status(404).json({
        status: "error",
        message: "Model not found",
      });
    }

    res.status(200).json({ status: "success", data: model });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving model",
      error: error.message,
    });
  }
};

// Update a Cloudinary entry
const update = async (req, res) => {
  try {
    const { name, modelFile, partnerId } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (modelFile) updateData.modelFile = modelFile; // Zorg ervoor dat modelFile wordt bijgewerkt
    if (partnerId) updateData.partnerId = partnerId;

    const updatedModel = await Cloudinary.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Zorg ervoor dat de nieuwe gegevens worden geretourneerd
    );

    if (!updatedModel) {
      return res.status(404).json({
        status: "error",
        message: "Model not found",
      });
    }

    res.status(200).json({ status: "success", data: updatedModel });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating model",
      error: error.message,
    });
  }
};

// Delete a Cloudinary entry
const destroy = async (req, res) => {
  try {
    const deletedModel = await Cloudinary.findByIdAndDelete(req.params.id);
    if (!deletedModel) {
      return res.status(404).json({
        status: "error",
        message: "Model not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Model deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting model",
      error: error.message,
    });
  }
};

// Upload a mesh URL to Cloudinary
const uploadMeshToCloudinary = async (meshUrl) => {
  try {
    const result = await cloudinary.uploader.upload(meshUrl, {
      resource_type: "auto", // Automatically detect file type
      folder: "meshes", // Folder in Cloudinary for meshes
    });
    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Upload a mesh URL and create a Cloudinary entry
const uploadMesh = async (req, res) => {
  try {
    const { name, meshUrl, partnerId } = req.body;

    if (!name || !meshUrl || !partnerId) {
      return res.status(400).json({
        status: "error",
        message: "Name, meshUrl, and partnerId are required",
      });
    }

    // Upload the mesh URL to Cloudinary
    const uploadedMeshUrl = await uploadMeshToCloudinary(meshUrl);

    // Create a new Cloudinary entry in the database
    const newMeshEntry = new Cloudinary({
      partnerId,
      name,
      modelFile: uploadedMeshUrl, // Store the uploaded mesh URL
    });

    const savedMesh = await newMeshEntry.save();
    res.status(201).json({ status: "success", data: savedMesh });
  } catch (error) {
    console.error("Error in uploadMesh controller:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "General Error",
      stack: error.stack,
    });
  }
};

const search = async (req, res) => {
  try {
    const { name, modelFile } = req.query;

    if (!name || !modelFile) {
      return res.status(400).json({
        status: "error",
        message: "Name and modelFile are required for searching",
      });
    }

    // Decode the modelFile URL
    const decodedModelFile = decodeURIComponent(modelFile);
    console.log("Decoded modelFile:", decodedModelFile);

    // Search for the model in the database
    const model = await Cloudinary.findOne({
      name,
      modelFile: decodedModelFile,
    });

    if (!model) {
      return res.status(404).json({
        status: "error",
        message: "Model not found",
      });
    }

    res.status(200).json({ status: "success", data: model });
  } catch (error) {
    console.error("Error in search controller:", error);
    res.status(500).json({
      status: "error",
      message: "Error searching for model",
      error: error.message,
    });
  }
};

const uploadFont = async (req, res) => {
  try {
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    const { name, partnerId } = req.body;
    if (!name || !partnerId || !req.file) {
      return res.status(400).json({
        status: "error",
        message: "Name, partnerId en font-bestand zijn verplicht",
      });
    }

    let absolutePath = path.resolve(req.file.path);
    absolutePath = absolutePath.replace(/\\/g, "/");
    console.log("Upload path to Cloudinary:", absolutePath);
    console.log("Bestand bestaat:", fs.existsSync(absolutePath));
    console.log("Cloudinary config:", cloudinary.config());

    // Probeer eerst zonder extra opties
    const result = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "raw",
    });

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    const newFont = new Cloudinary({
      partnerId,
      name,
      modelFile: result.secure_url,
    });

    const savedFont = await newFont.save();
    res.status(201).json({ status: "success", data: savedFont });
  } catch (error) {
    console.error("Error in uploadFont controller:", error, error.stack);
    res.status(500).json({
      status: "error",
      message: error.message || "General Error",
      stack: error.stack,
    });
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
  uploadMesh,
  search,
  uploadFont,
};
