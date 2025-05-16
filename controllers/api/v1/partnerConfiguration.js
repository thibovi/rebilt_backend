const PartnerConfiguration = require("../../../models/api/v1/PartnerConfiguration");

// Create PartnerConfiguration
const create = async (req, res) => {
  try {
    const { partnerId, configurationId, options, categoryIds } = req.body;

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

    if (!options || !Array.isArray(options)) {
      return res.status(400).json({
        status: "error",
        message: "Options must be a valid array",
      });
    }

    const newPartnerConfiguration = new PartnerConfiguration({
      partnerId,
      configurationId,
      categoryIds, // ✅ toegevoegd
      options,
    });

    const savedPartnerConfiguration = await newPartnerConfiguration.save();

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
      .populate("options.optionId", "name")
      .populate("categoryIds", "name"); // ✅ toegevoegd

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
      .populate("options.optionId", "name")
      .populate("categoryIds", "name"); // ✅ toegevoegd

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

const update = async (req, res) => {
  try {
    const updateFields = {};
    // Voeg alleen velden toe die in req.body zitten
    Object.keys(req.body).forEach((key) => {
      updateFields[key] = req.body[key];
    });

    const updatedPartner = await Partner.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!updatedPartner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedPartner,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating partner",
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
