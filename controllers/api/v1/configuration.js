// controllers/api/v1/configurationController.js
const Configuration = require("../../../models/api/v1/Configuration");
const mongoose = require("mongoose");

// Create Configuration
const create = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isRequired } = req.body;

    // Validate required fields
    if (!fieldName || !fieldType) {
      return res.status(400).json({
        message: "Missing required fields: fieldName, fieldType",
      });
    }

    // Create a new configuration
    const newConfiguration = new Configuration({
      fieldName,
      fieldType,
      options,
      isRequired,
    });

    // Save and return response
    await newConfiguration.save();
    res.status(201).json({
      status: "success",
      data: newConfiguration,
    });
  } catch (error) {
    console.error("Error creating configuration:", error);
    res.status(500).json({
      message: "An error occurred while creating the configuration.",
      error: error.message,
    });
  }
};

// Get all Configurations
const index = async (req, res) => {
  try {
    const configurations = await Configuration.find();

    res.json({
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

// Get a single Configuration by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid configuration id",
      });
    }

    // Find the configuration by id
    const configuration = await Configuration.findById(id);

    if (!configuration) {
      return res.status(404).json({
        status: "error",
        message: `Configuration with id ${id} not found`,
      });
    }

    res.json({
      status: "success",
      data: configuration,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve configuration",
      error: error.message,
    });
  }
};

// Update Configuration
const update = async (req, res) => {
  const { id } = req.params;
  const { fieldName, fieldType, options, isRequired } = req.body;

  // Validate required fields
  if (!fieldName || !fieldType) {
    return res.status(400).json({
      message: "Missing required fields: fieldName, fieldType",
    });
  }

  try {
    // Update the configuration by id
    const updatedConfiguration = await Configuration.findByIdAndUpdate(
      id,
      { fieldName, fieldType, options, isRequired },
      { new: true, runValidators: true }
    );

    if (!updatedConfiguration) {
      return res.status(404).json({
        status: "error",
        message: "Configuration not found",
      });
    }

    res.json({
      status: "success",
      data: updatedConfiguration,
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    res.status(500).json({
      status: "error",
      message: "Configuration could not be updated",
      error: error.message,
    });
  }
};

// Delete Configuration
const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the configuration by id
    const deletedConfiguration = await Configuration.findByIdAndDelete(id);

    if (!deletedConfiguration) {
      return res.status(404).json({
        message: "Configuration not found",
      });
    }

    res.status(200).json({
      message: "Configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting configuration:", error);
    res.status(500).json({
      message: "Error deleting configuration",
      error: error.message,
    });
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
};
