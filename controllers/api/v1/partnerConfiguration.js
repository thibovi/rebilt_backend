const Order = require("../../../models/api/v1/Order");
const PartnerConfiguration = require("../../../models/api/v1/PartnerConfiguration");

// Create PartnerConfiguration
const create = async (req, res) => {
  try {
    const { partnerId, configurationId, options } = req.body;

    // Check if partnerId and configurationId are the same
    if (partnerId.toString() === configurationId.toString()) {
      return res.status(400).json({
        status: "error",
        message: "partnerId and configurationId cannot be the same",
      });
    }

    // Check if a PartnerConfiguration with the same partnerId and configurationId already exists
    const existingConfig = await PartnerConfiguration.findOne({
      partnerId,
      configurationId,
    });

    if (existingConfig) {
      return res.status(400).json({
        status: "error",
        message:
          "A partner configuration with this partnerId and configurationId already exists",
      });
    }

    // Maak een nieuwe partnerconfiguratie aan
    const newPartnerConfiguration = new PartnerConfiguration({
      partnerId,
      configurationId,
      options, // Zorg ervoor dat je de juiste naam gebruikt
    });

    // Sla de partnerconfiguratie op
    const savedPartnerConfiguration = await newPartnerConfiguration.save();

    // Stuur een succesbericht terug
    res.status(201).json({
      status: "success",
      data: savedPartnerConfiguration,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating partner configuration",
      error: error.message,
    });
  }
};

// List all Partner Configurations
const index = async (req, res) => {
  try {
    const partnerConfigs = await PartnerConfiguration.find();
    res.status(200).json({
      status: "success",
      data: partnerConfigs,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve partner configurations",
      error: error.message,
    });
  }
};

// Show a specific Partner Configuration
const show = async (req, res) => {
  try {
    const partnerConfig = await PartnerConfiguration.findById(req.params.id);
    if (!partnerConfig) {
      return res
        .status(404)
        .json({ status: "error", message: "Partner Configuration not found" });
    }
    res.status(200).json({
      status: "success",
      data: partnerConfig,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving partner configuration",
      error: error.message,
    });
  }
};

// Update Partner Configuration
const update = async (req, res) => {
  try {
    const { partnerId, configurationId } = req.body;
    const updatedPartnerConfig = await PartnerConfiguration.findByIdAndUpdate(
      req.params.id,
      { partnerId, configurationId },
      { new: true }
    );
    if (!updatedPartnerConfig) {
      return res
        .status(404)
        .json({ status: "error", message: "Partner Configuration not found" });
    }
    res.status(200).json({
      status: "success",
      data: updatedPartnerConfig,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating partner configuration",
      error: error.message,
    });
  }
};

// Delete Partner Configuration
// Delete Partner Configuration
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPartnerConfiguration =
      await PartnerConfiguration.findByIdAndDelete(id);

    if (!deletedPartnerConfiguration) {
      return res.status(404).json({
        status: "error",
        message: "partnerConfiguration not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "partnerConfiguration deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error deleting order",
      error: error.message,
    });
  }
};

module.exports = { create, index, show, update, destroy };
