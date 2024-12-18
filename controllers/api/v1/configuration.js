const Configuration = require("../../../models/api/v1/Configuration");
const Option = require("../../../models/api/v1/Option"); // Zorg ervoor dat je Option model hebt geïmporteerd

// Create Configuration
const create = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isActive, partnerId, isColor } =
      req.body;

    let optionIds = [];

    // Verwerk opties
    if (options && options.length > 0) {
      for (let option of options) {
        let existingOption = await Option.findOne({ name: option });

        if (!existingOption) {
          // Als de optie niet bestaat, maak een nieuwe optie aan
          const newOption = new Option({
            name: option, // Gebruik de hexkleur (zoals '#ffffff') als naam
            type: fieldType, // Optioneel, je kunt ook "Color" hardcoderen
          });
          await newOption.save();
          optionIds.push(newOption._id); // Gebruik de nieuwe ID
        } else {
          optionIds.push(existingOption._id); // Gebruik de bestaande ID
        }
      }
    }

    // Maak de configuratie aan
    const newConfiguration = new Configuration({
      fieldName,
      fieldType,
      options: optionIds, // Gebruik de verzamelde optie-ID's
      isActive: isActive || true, // Default op true
      partnerId: partnerId || null,
      isColor: isColor || false,
    });

    // Sla de configuratie op
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
// Update Configuration
const update = async (req, res) => {
  try {
    const { fieldName, fieldType, options, isActive, partnerId, isColor } =
      req.body;

    // Controleer of de configuratie van het type "Color" is en of de opties valid zijn (optionele validatie)
    if (fieldType === "Color" && !isColor) {
      return res.status(400).json({
        status: "error",
        message: "For 'Color' field type, isColor must be true.",
      });
    }

    // Als opties worden meegegeven, zorg ervoor dat ze bestaan in de 'Option' collectie
    if (options && options.length > 0) {
      const optionIds = [];

      for (let optionName of options) {
        let option = await Option.findOne({ name: optionName });

        if (!option) {
          // Maak de optie aan als deze niet bestaat
          option = new Option({
            name: optionName,
            type: fieldType, // Voeg type toe indien nodig
          });
          await option.save();
        }

        optionIds.push(option._id); // Voeg de ObjectId toe
      }

      // Werk de options bij naar de verzamelde ObjectId's
      req.body.options = optionIds;
    }

    // Update de configuratie
    const updatedConfig = await Configuration.findByIdAndUpdate(
      req.params.id,
      {
        fieldName,
        fieldType,
        options: req.body.options,
        isActive,
        partnerId,
        isColor,
      },
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
