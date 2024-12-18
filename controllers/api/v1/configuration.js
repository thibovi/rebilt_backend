const Configuration = require("../../../models/api/v1/Configuration");

// Create Configuration
const create = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isActive, partnerId } = req.body;
    const newConfiguration = new Configuration({
      fieldName,
      fieldType,
      options,
      isActive,
      partnerId: partnerId || null,
    });
    const savedConfig = await newConfiguration.save();
    res.status(201).json({
      status: "success",
      data: savedConfig,
    });
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
    res.status(200).json({
      status: "success",
      data: configurations,
    });
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
      return res
        .status(404)
        .json({ status: "error", message: "Configuration not found" });
    }
    res.status(200).json({
      status: "success",
      data: configuration,
    });
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
    const { fieldName, fieldType, options, isActive, partnerId } = req.body;
    const updatedConfig = await Configuration.findByIdAndUpdate(
      req.params.id,
      { fieldName, fieldType, options, isActive, partnerId },
      { new: true }
    );
    if (!updatedConfig) {
      return res
        .status(404)
        .json({ status: "error", message: "Configuration not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedConfig,
    });
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
      return res
        .status(404)
        .json({ status: "error", message: "Configuration not found" });
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
