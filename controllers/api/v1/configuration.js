const Configuration = require("../../../models/api/v1/Configuration");
const mongoose = require("mongoose");

// Create Configuration
const create = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isActive, partnerId } = req.body;

    // Haal de partnerId uit de token of body (indien optioneel)
    const partnerIdFromToken = req.user?.partnerId || partnerId;

    const newConfiguration = new Configuration({
      fieldName,
      fieldType,
      options,
      isActive,
      partnerId: partnerIdFromToken || null, // PartnerId kan null zijn
    });

    const savedConfiguration = await newConfiguration.save();

    res.status(201).json({
      status: "success",
      data: savedConfiguration,
    });
  } catch (error) {
    console.error("Error creating configuration:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while creating the configuration",
      error: error.message,
    });
  }
};

// List all configurations
const index = async (req, res) => {
  try {
    const configurations = await Configuration.find(); // Retrieve all configurations

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

// Show a specific configuration by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;
    let partnerId = req.query.partnerId;

    // If partnerId is an empty string or "null", set it to null
    if (partnerId === "" || partnerId === "null") {
      partnerId = null;
    }

    // Check if partnerId is explicitly undefined (but not null)
    if (partnerId === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Partner ID is required",
      });
    }

    // Check if id is valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid configuration id",
      });
    }

    // Query the configuration using the provided partnerId (which could be null)
    const configuration = await Configuration.findOne({ _id: id, partnerId });

    if (!configuration) {
      return res.status(404).json({
        status: "error",
        message: `Configuration with id ${id} not found or does not belong to the current partner`,
      });
    }

    res.json({
      status: "success",
      data: configuration,
    });
  } catch (error) {
    console.error("Error retrieving configuration:", error);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve configuration",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { fieldName, fieldType, options, isActive, partnerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid configuration id" });
    }

    // Haal partnerId uit JWT of request body
    const partnerIdFromToken = req.user?.partnerId;
    const updatedPartnerId = req.body.partnerId || partnerIdFromToken;

    const configuration = await Configuration.findOne({ _id: id });

    if (!configuration) {
      return res.status(404).json({
        status: "error",
        message: `Configuration with id ${id} not found`,
      });
    }

    // Update velden en partnerId
    const updateFields = {
      ...(fieldName !== undefined && { fieldName }),
      ...(fieldType !== undefined && { fieldType }),
      ...(options !== undefined && { options }),
      ...(isActive !== undefined && { isActive }),
      partnerId: updatedPartnerId || null, // Vul partnerId in of maak null
    };

    const updatedConfiguration = await Configuration.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    res.json({
      status: "success",
      data: updatedConfiguration,
    });
  } catch (error) {
    console.error("Error updating configuration:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while updating the configuration",
      error: error.message,
    });
  }
};

// Delete Configuration
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.user.partnerId; // partnerId from the authenticated user

    // Delete the configuration by id and partnerId to ensure it's for the correct partner
    const deletedConfiguration = await Configuration.findOneAndDelete({
      _id: id,
      partnerId,
    });

    if (!deletedConfiguration) {
      return res.status(404).json({
        message:
          "Configuration not found or does not belong to the current partner",
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
