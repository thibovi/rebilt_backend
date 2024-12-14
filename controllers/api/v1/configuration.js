const Configuration = require("../../../models/api/v1/Configuration");
const mongoose = require("mongoose");

// Create Configuration
const create = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isRequired, partnerId } = req.body;

    // Validate required fields
    if (!fieldName || !fieldType || !partnerId) {
      return res.status(400).json({
        message: "Missing required fields: fieldName, fieldType, partnerId",
      });
    }

    // Create a new configuration
    const newConfiguration = new Configuration({
      fieldName,
      fieldType,
      options,
      isRequired,
      partnerId, // partnerId moet hier goed worden doorgegeven
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

const index = async (req, res) => {
  try {
    const configurations = await Configuration.find(); // Haal alle configuraties op

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
    const partnerId = req.user.partnerId; // Haal partnerId uit het token van de gebruiker

    // Ensure the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid configuration id",
      });
    }

    // Find the configuration by id and partnerId to ensure it's for the correct partner
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
    res.status(500).json({
      status: "error",
      message: "Could not retrieve configuration",
      error: error.message,
    });
  }
};

// Update Configuration
// Update Configuration
const update = async (req, res) => {
  try {
    // Controleer of partnerId aanwezig is in de request body
    if (!req.body.partnerId) {
      return res.status(400).json({ message: "partnerId is required" });
    }

    const partnerId = req.body.partnerId;
    const { id } = req.params; // Haal id van de URL parameters
    const updateFields = req.body; // De velden die bijgewerkt moeten worden

    // Haal de configuratie op basis van de id en partnerId
    const configuration = await Configuration.findOne({ _id: id, partnerId });

    if (!configuration) {
      return res.status(404).json({
        status: "error",
        message: `Configuration with id ${id} not found or does not belong to the current partner`,
      });
    }

    // Werk de configuratie bij met de nieuwe gegevens
    const updatedConfiguration = await Configuration.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    // Stuur het resultaat terug naar de client
    res.json({
      status: "success",
      data: updatedConfiguration,
    });
  } catch (err) {
    console.error("Error updating configuration:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete Configuration
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.user.partnerId; // Haal partnerId uit het token van de gebruiker

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
