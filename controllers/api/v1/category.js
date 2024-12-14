// controllers/api/v1/categoryController.js
const Category = require("../../../models/api/v1/Category");
const mongoose = require("mongoose");

// Create Category
const create = async (req, res) => {
  try {
    const { name, subTypes = [] } = req.body; // subTypes is optioneel

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        message: `Category with name "${name}" already exists.`,
      });
    }

    // Create new category
    const newCategory = new Category({
      name,
      subTypes,
    });

    // Save category to the database
    await newCategory.save();
    res.status(201).json({
      status: "success",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      message: "An error occurred while creating the category.",
      error: error.message,
    });
  }
};

// Get all Categories
const index = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve categories",
      error: error.message,
    });
  }
};

// Get a single Category by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category id",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: `Category with id ${id} not found`,
      });
    }

    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    console.error("Error retrieving category:", error);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve category",
      error: error.message,
    });
  }
};

// Update Category
const update = async (req, res) => {
  const { id } = req.params;
  const { name, subTypes } = req.body;

  if (!name || !Array.isArray(subTypes)) {
    return res.status(400).json({
      message: "Name and subTypes (array) are required.",
    });
  }

  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, subTypes },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      status: "error",
      message: "Could not update category",
      error: error.message,
    });
  }
};

// Delete Category
const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Error deleting category",
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
