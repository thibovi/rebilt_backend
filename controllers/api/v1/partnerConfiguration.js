const PartnerConfiguration = require("../../../models/api/v1/PartnerConfiguration");

// Create PartnerConfiguration
const create = async (req, res) => {
  try {
    const { partnerId, configurationId, options } = req.body;

    // Validatie: Check of partnerId en configurationId gelijk zijn
    if (partnerId.toString() === configurationId.toString()) {
      return res.status(400).json({
        status: "error",
        message: "partnerId and configurationId cannot be the same",
      });
    }

    // Validatie: Check of een PartnerConfiguration al bestaat
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

    // Validatie: Zorg dat options correct zijn gestructureerd
    if (!options || !Array.isArray(options)) {
      return res.status(400).json({
        status: "error",
        message: "Options must be a valid array",
      });
    }

    // Maak een nieuwe partnerconfiguratie aan
    const newPartnerConfiguration = new PartnerConfiguration({
      partnerId,
      configurationId,
      options, // `options` bevat nu `optionId` en `images`
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
    const partnerConfigs = await PartnerConfiguration.find()
      .populate("partnerId", "name")
      .populate("configurationId", "name")
      .populate("options.optionId", "name");

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
    const partnerConfig = await PartnerConfiguration.findById(req.params.id)
      .populate("partnerId", "name")
      .populate("configurationId", "name")
      .populate("options.optionId", "name");

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
    const { partnerId, configurationId, options } = req.body;

    // Validatie: Zorg dat options correct zijn gestructureerd
    if (
      options &&
      (!Array.isArray(options) || options.some((opt) => !opt.optionId))
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid options structure",
      });
    }

    const updatedPartnerConfig = await PartnerConfiguration.findByIdAndUpdate(
      req.params.id,
      { partnerId, configurationId, options },
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
const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPartnerConfiguration =
      await PartnerConfiguration.findByIdAndDelete(id);

    if (!deletedPartnerConfiguration) {
      return res.status(404).json({
        status: "error",
        message: "Partner Configuration not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Partner Configuration deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting partner configuration",
      error: error.message,
    });
  }
};

module.exports = { create, index, show, update, destroy };
