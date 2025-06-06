// controllers/api/v1/filterController.js
const Filter = require("../../../models/api/v1/Filter");
const mongoose = require("mongoose");

const create = async (req, res) => {
  try {
    const { name, options = [], partnerId, categoryIds = [] } = req.body;

    console.log("Ontvangen payload:", {
      name,
      options,
      partnerId,
      categoryIds,
    });

    if (!name || !partnerId) {
      return res.status(400).json({
        message: "Name and partnerId are required",
      });
    }

    // Zet partnerId en categoryIds om naar ObjectId
    const partnerObjectId = mongoose.Types.ObjectId(partnerId);
    const categoryObjectIds = categoryIds.map((id) =>
      mongoose.Types.ObjectId(id)
    );

    const existingFilter = await Filter.findOne({
      name,
      partnerId: partnerObjectId,
    });
    if (existingFilter) {
      return res.status(400).json({
        message: `Filter with name "${name}" already exists for this partner.`,
      });
    }

    const newFilter = new Filter({
      name,
      options,
      partnerId: partnerObjectId,
      categoryIds: categoryObjectIds,
    });

    await newFilter.save();
    res.status(201).json({
      status: "success",
      data: newFilter,
    });
  } catch (error) {
    console.error("Error creating filter:", error);
    res.status(500).json({
      message: "An error occurred while creating the filter.",
      error: error.message,
    });
  }
};

const index = async (req, res) => {
  try {
    const { partnerId } = req.query;
    let filters;
    if (partnerId) {
      filters = await Filter.find({ partnerId });
    } else {
      filters = await Filter.find();
    }
    res.status(200).json({
      status: "success",
      data: filters,
    });
  } catch (error) {
    console.error("Error retrieving filters:", error);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve filters",
      error: error.message,
    });
  }
};

// Get a single Filter by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid filter id",
      });
    }

    const filter = await Filter.findById(id);

    if (!filter) {
      return res.status(404).json({
        status: "error",
        message: `Filter with id ${id} not found`,
      });
    }

    res.status(200).json({
      status: "success",
      data: filter,
    });
  } catch (error) {
    console.error("Error retrieving filter:", error);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve filter",
      error: error.message,
    });
  }
};

// Update Filter
const update = async (req, res) => {
  const { id } = req.params;
  const { name, options, partnerId, categoryIds } = req.body; // categoryIds toegevoegd

  console.log("Ontvangen payload voor update:", {
    name,
    options,
    partnerId,
    categoryIds,
  }); // Debugging

  if (!name || !Array.isArray(options) || !partnerId) {
    return res.status(400).json({
      message: "Name, options (array), and partnerId are required.",
    });
  }

  try {
    const updatedFilter = await Filter.findByIdAndUpdate(
      id,
      { name, options, partnerId, categoryIds }, // categoryIds updaten
      { new: true, runValidators: true }
    );

    if (!updatedFilter) {
      return res.status(404).json({
        status: "error",
        message: "Filter not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedFilter,
    });
  } catch (error) {
    console.error("Error updating filter:", error);
    res.status(500).json({
      status: "error",
      message: "Could not update filter",
      error: error.message,
    });
  }
};

// Delete Filter
const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedFilter = await Filter.findByIdAndDelete(id);

    if (!deletedFilter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    res.status(200).json({ message: "Filter deleted successfully" });
  } catch (error) {
    console.error("Error deleting filter:", error);
    res.status(500).json({
      message: "Error deleting filter",
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
