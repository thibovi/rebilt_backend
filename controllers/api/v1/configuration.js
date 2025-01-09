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
  try {
    const result = await cloudinary.uploader.upload(image, { folder });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const sanitizeForCloudinary = (input) => {
  return input.replace(/[^a-zA-Z0-9-_]/g, "_"); // Only letters, numbers, _ and - allowed
};

// Create Configuration
const create = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isActive, partnerId, isColor } =
      req.body;

    if (!fieldName || !fieldType) {
      return res.status(400).json({
        status: "error",
        message: "fieldName and fieldType are required",
      });
    }

    const processedOptions = await Promise.all(
      (options || []).map(async (option) => {
        const { optionId, images } = option;

        if (!optionId) {
          throw new Error("Each option must include an optionId");
        }

        const existingOption = await Option.findById(optionId);
        if (!existingOption) {
          throw new Error(`Option with id ${optionId} does not exist`);
        }

        const safeFieldName = sanitizeForCloudinary(fieldName);
        const safeOptionName = sanitizeForCloudinary(existingOption.name);

        const processedImages = await Promise.all(
          (images || []).map(async (image) => {
            const imageUrl = await uploadImageToCloudinary(
              image.url,
              `Configurations/${safeFieldName}/${safeOptionName}`
            );
            return { url: imageUrl, altText: image.altText || "" };
          })
        );

        return { optionId, images: processedImages };
      })
    );

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
      message: error.message || "Error creating configuration",
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

    const processedOptions = await Promise.all(
      (options || []).map(async (option) => {
        const { optionId, images } = option;

        if (!optionId) {
          throw new Error("Each option must include an optionId");
        }

        const existingOption = await Option.findById(optionId);
        if (!existingOption) {
          throw new Error(`Option with id ${optionId} does not exist`);
        }

        const safeFieldName = sanitizeForCloudinary(fieldName);
        const safeOptionName = sanitizeForCloudinary(existingOption.name);

        const processedImages = await Promise.all(
          (images || []).map(async (image) => {
            const imageUrl = await uploadImageToCloudinary(
              image.url,
              `Configurations/${safeFieldName}/${safeOptionName}`
            );
            return { url: imageUrl, altText: image.altText || "" };
          })
        );

        return { optionId, images: processedImages };
      })
    );

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
      message: error.message || "Error updating configuration",
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
      message: error.message || "Error deleting configuration",
    });
  }
};

module.exports = { create, index, show, update, destroy };
