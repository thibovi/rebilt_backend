const HouseStyle = require("../../../models/api/v1/HouseStyle");
const mongoose = require("mongoose");

const create = async (req, res) => {
  const houseStyle = req.body.houseStyle; // Hier de juiste naam gebruiken

  if (
    !houseStyle ||
    !houseStyle.primary_color ||
    !houseStyle.secondary_color ||
    !houseStyle.background_color ||
    !houseStyle.text_color ||
    !houseStyle.fontFamilyBodyText ||
    !houseStyle.fontFamilyTitles ||
    !houseStyle.logo_url ||
    !houseStyle.userId // Zorg ervoor dat userId is opgenomen in de validatie
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields",
    });
  }

  const h = new HouseStyle(houseStyle);

  try {
    await h.save();
    res.json({ status: "success", data: { houseStyle: h } });
  } catch (err) {
    console.error("Save error:", err);
    return res.status(500).json({
      status: "error",
      message: "HouseStyle could not be saved",
      error: err.message || err.toString(),
    });
  }
};

const index = async (req, res) => {
  try {
    const houseStyles = await HouseStyle.find();
    res.json({
      status: "success",
      data: {
        houseStyles: houseStyles,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve houseStyles",
      error: err.message || err,
    });
  }
};

const show = async (req, res) => {
  const userId = req.params.userId;

  try {
    const houseStyles = await HouseStyle.find({ userId: userId });

    if (houseStyles.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No houseStyle found for this user",
      });
    }

    res.json({
      status: "success",
      data: {
        houseStyles: houseStyles,
      },
    });
  } catch (err) {
    console.error("Error retrieving houseStyles:", err);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve houseStyles",
      error: err.message || err,
    });
  }
};

const update = async (req, res) => {
  const userId = req.params.userId; // User ID van de URL
  const houseStyleData = req.body.houseStyle;

  // Validatie van de binnenkomende gegevens
  if (
    !houseStyleData ||
    !houseStyleData.primary_color ||
    !houseStyleData.secondary_color ||
    !houseStyleData.background_color ||
    !houseStyleData.text_color ||
    !houseStyleData.fontFamilyBodyText ||
    !houseStyleData.fontFamilyTitles ||
    !houseStyleData.logo_url
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "HouseStyle data with all required fields is required for update",
    });
  }

  // Probeer de update uit te voeren
  try {
    const updatedHouseStyle = await HouseStyle.findOneAndUpdate(
      { userId: userId },
      houseStyleData,
      { new: true, runValidators: true }
    );

    if (!updatedHouseStyle) {
      return res.status(404).json({
        status: "error",
        message: "HouseStyle not found",
      });
    }

    res.json({
      status: "success",
      data: { houseStyle: updatedHouseStyle },
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: "error",
      message: "HouseStyle could not be updated",
      error: err.message || err,
    });
  }
};

const destroy = async (req, res) => {
  const houseStyleId = req.params.id;

  if (!mongoose.isValidObjectId(houseStyleId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid HouseStyle ID",
    });
  }

  try {
    const result = await HouseStyle.findByIdAndDelete(houseStyleId);

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "HouseStyle not found",
      });
    }

    res.json({
      status: "success",
      message: "HouseStyle deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not delete HouseStyle",
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
