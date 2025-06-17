const Option = require("../../../models/api/v1/Option");

// Create Option
const create = async (req, res) => {
  try {
    // Haal name, type, price en textureUrl uit de request body
    const { name, type, price, textureUrl } = req.body;

    // Maak een nieuwe optie aan met de juiste velden
    const newOption = new Option({ name, type, price, textureUrl });

    // Sla de optie op in de database
    const savedOption = await newOption.save();

    // Retourneer een succesresponse
    res.status(201).json({
      status: "success",
      data: savedOption,
    });
  } catch (error) {
    // Foutmelding bij mislukking
    res.status(500).json({
      status: "error",
      message: "Error creating option",
      error: error.message,
    });
  }
};

// List all Options
// List all Options
const index = async (req, res) => {
  try {
    const options = await Option.find();
    res.status(200).json({
      status: "success",
      data: { options }, // <-- Zet de array in een object met key 'options'
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve options",
      error: error.message,
    });
  }
};

// Show a specific Option
const show = async (req, res) => {
  try {
    const option = await Option.findById(req.params.id);
    if (!option) {
      return res
        .status(404)
        .json({ status: "error", message: "Option not found" });
    }
    res.status(200).json({
      status: "success",
      data: option,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error retrieving option",
      error: error.message,
    });
  }
};

// Update Option
const update = async (req, res) => {
  try {
    // Haal de nieuwe waarden uit de request body
    const { name, type, price, textureUrl } = req.body;

    // Voer de update uit
    const updatedOption = await Option.findByIdAndUpdate(
      req.params.id,
      { name, type, price, textureUrl }, // textureUrl toegevoegd
      { new: true }
    );

    if (!updatedOption) {
      return res
        .status(404)
        .json({ status: "error", message: "Option not found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedOption,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating option",
      error: error.message,
    });
  }
};

// Delete Option
const destroy = async (req, res) => {
  try {
    const deletedOption = await Option.findByIdAndDelete(req.params.id);
    if (!deletedOption) {
      return res
        .status(404)
        .json({ status: "error", message: "Option not found" });
    }
    res.status(200).json({
      status: "success",
      message: "Option deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error deleting option",
      error: error.message,
    });
  }
};

module.exports = { create, index, show, update, destroy };
