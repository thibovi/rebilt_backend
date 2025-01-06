const Configuration = require("../../../models/api/v1/Configuration");
const Option = require("../../../models/api/v1/Option");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImageToCloudinary = async (image, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, { folder: folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
};

// Create Configuration
const create = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isActive, partnerId, isColor } =
      req.body;

    const processedOptions = [];

    if (options && options.length > 0) {
      for (let option of options) {
        const { optionId, images } = option;

        // Controleer of optionId is meegegeven
        if (!optionId) {
          return res.status(400).json({
            status: "error",
            message: "Each option must include an optionId",
          });
        }

        // Valideer of optionId bestaat in de database
        const existingOption = await Option.findById(optionId);
        if (!existingOption) {
          return res.status(400).json({
            status: "error",
            message: `Option with id ${optionId} does not exist`,
          });
        }

        const sanitizeForCloudinary = (input) => {
          return input.replace(/[^a-zA-Z0-9-_]/g, "_"); // Alleen letters, cijfers, _ en - toegestaan
        };

        // Verwerk de images en upload ze naar Cloudinary
        const processedImages = await Promise.all(
          (images || []).map(async (image) => {
            const safeFieldName = sanitizeForCloudinary(fieldName);
            const safeOptionName = sanitizeForCloudinary(existingOption.name);

            const imageUrl = await uploadImageToCloudinary(
              image.url,
              `Configurations/${safeFieldName}/${safeOptionName}`
            );
            return { url: imageUrl, altText: image.altText || "" };
          })
        );

        // Voeg de optie met optionId en verwerkte images toe
        processedOptions.push({ optionId, images: processedImages });
      }
    }

    const newConfiguration = new Configuration({
      fieldName,
      fieldType,
      options: processedOptions,
      isActive: isActive !== undefined ? isActive : true,
      partnerId: partnerId || null,
      isColor: isColor || false,
    });

    const savedConfig = await newConfiguration.save();

    res.status(201).json({ status: "success", data: savedConfig });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating configuration",
      error: error.message,
    });
  }
};

// List all Configurations
const index = async (req, res) => {
  try {
    const configurations = await Configuration.find();
    res.status(200).json({ status: "success", data: configurations });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve configurations",
      error: error.message,
    });
  }
};

// Show a specific Configuration by ID
const show = async (req, res) => {
  try {
    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) {
      return res.status(404).json({
        status: "error",
        message: "Configuration not found",
      });
    }
    res.status(200).json({ status: "success", data: configuration });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving configuration",
      error: error.message,
    });
  }
};

// Update Configuration
const update = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isActive, partnerId, isColor } =
      req.body;

    const processedOptions = [];

    if (options && options.length > 0) {
      for (let option of options) {
        const { value, images } = option;

        const sanitizeForCloudinary = (input) => {
          return input.replace(/[^a-zA-Z0-9-_]/g, "_"); // Alleen letters, cijfers, _ en - toegestaan
        };

        const processedImages = await Promise.all(
          (images || []).map(async (image) => {
            const safeFieldName = sanitizeForCloudinary(fieldName);
            const safeOptionName = sanitizeForCloudinary(existingOption.name);

            const imageUrl = await uploadImageToCloudinary(
              image.url,
              `Configurations/${safeFieldName}/${safeOptionName}`
            );
            return { url: imageUrl, altText: image.altText || "" };
          })
        );

        processedOptions.push({ value, images: processedImages });
      }
    }

    const updatedConfig = await Configuration.findByIdAndUpdate(
      req.params.id,
      {
        fieldName,
        fieldType,
        options: processedOptions,
        isActive,
        partnerId,
        isColor,
      },
      { new: true }
    );

    if (!updatedConfig) {
      return res.status(404).json({
        status: "error",
        message: "Configuration not found",
      });
    }

    res.status(200).json({ status: "success", data: updatedConfig });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating configuration",
      error: error.message,
    });
  }
};

// Delete Configuration
const destroy = async (req, res) => {
  try {
    const deletedConfig = await Configuration.findByIdAndDelete(req.params.id);
    if (!deletedConfig) {
      return res.status(404).json({
        status: "error",
        message: "Configuration not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Configuration deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting configuration",
      error: error.message,
    });
  }
};

module.exports = { create, index, show, update, destroy };
