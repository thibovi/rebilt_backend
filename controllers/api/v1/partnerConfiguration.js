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

const index = async (req, res) => {
  try {
    const filter = {};
    if (req.query.partnerId) {
      filter.partnerId = req.query.partnerId;
    }

    const partnerConfigs = await PartnerConfiguration.find(filter)
      .populate("partnerId", "name")
      .populate("configurationId", "name")
      .populate("options.optionId", "name textureUrl")
      .populate("categoryIds", "name");

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

const show = async (req, res) => {
  try {
    const partnerConfig = await PartnerConfiguration.findById(req.params.id)
      .populate("partnerId", "name")
      .populate("configurationId", "name")
      .populate("options.optionId", "name textureUrl") // <-- textureUrl toevoegen
      .populate("categoryIds", "name");

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
    const { partnerId, configurationId, options, categoryIds } = req.body;

    if (options && !Array.isArray(options)) {
      return res.status(400).json({
        status: "error",
        message: "Options must be an array",
      });
    }

    const updatedPartnerConfig = await PartnerConfiguration.findByIdAndUpdate(
      req.params.id,
      {
        partnerId,
        configurationId,
        categoryIds, // ✅ toegevoegd
        options,
      },
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
