const jwt = require("jsonwebtoken");
const Product = require("../../../models/api/v1/Product");
const Configuration = require("../../../models/api/v1/Configuration");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image to Cloudinary
const uploadImageToCloudinary = async (image, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, { folder: folder }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url); // Return the URL of the uploaded image
      }
    });
  });
};

// Create Product
const create = async (req, res) => {
  try {
    const {
      productCode,
      productName,
      productPrice,
      subType,
      category, // Add category here
      description,
      brand,
      images = [],
      configurations = [],
    } = req.body;

    // Validate required fields
    if (
      !productCode ||
      !productName ||
      !productPrice ||
      !category || // Ensure category is provided
      !subType ||
      !description ||
      !brand
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: productCode, productName, productPrice, category, subType, description, brand",
      });
    }

    // Token validation
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const partnerId = decoded.companyId;
    if (!partnerId) {
      return res
        .status(401)
        .json({ message: "Token does not contain valid companyId" });
    }

    // Process images
    const cloudinaryFolder = `Products/${productName}`;
    const uploadedImages = await Promise.all(
      images.map((image) => uploadImageToCloudinary(image, cloudinaryFolder))
    );

    // Fetch the actual configuration documents
    const configurationDocuments = await Configuration.find({
      _id: { $in: configurations },
    });

    // Create the product
    const newProduct = new Product({
      productCode,
      productName,
      productPrice,
      subType,
      category, // Include the category in the product creation
      description,
      brand,
      images: uploadedImages,
      partnerId,
      configurations: configurationDocuments.map((config) => config._id),
    });

    // Save and return response
    await newProduct.save();
    res.status(201).json({ status: "success", data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      message: "An error occurred while creating the product.",
      error: error.message,
    });
  }
};

const index = async (req, res) => {
  try {
    const { typeOfProduct, brand } = req.query;
    const filter = {};

    if (typeOfProduct) {
      filter.typeOfProduct = typeOfProduct;
    }
    if (brand) {
      filter.brand = brand;
    }

    const products = await Product.find(filter);

    res.json({
      status: "success",
      data: { products },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve products",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Product id is required to retrieve a single product",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product id",
      });
    }

    const product = await Product.findById(id).populate("configurations");

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Product with id ${id} not found`,
      });
    }

    res.json({
      status: "success",
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve product",
      error: error.message,
    });
  }
};

function validateColorArray(colorArray, fieldName) {
  if (!Array.isArray(colorArray)) {
    throw new Error(`${fieldName} should be an array`);
  }

  colorArray.forEach((color, index) => {
    if (typeof color !== "string") {
      throw new Error(`${fieldName}[${index}] should be a string`);
    }
  });
}

// Update Product
// Update Product
const update = async (req, res) => {
  const { id } = req.params;
  const {
    productCode,
    productName,
    productPrice,
    category, // New required field
    subType, // New required field
    description,
    brand,
    images = [],
  } = req.body;

  if (
    !productCode ||
    !productName ||
    !productPrice ||
    !category ||
    !subType ||
    !description ||
    !brand
  ) {
    return res.status(400).json({
      message: "Product is missing required fields.",
    });
  }

  if (productPrice <= 0) {
    return res.status(400).json({
      message: "productPrice must be greater than zero",
    });
  }

  try {
    // Validate if subType exists in the given category
    const categoryDoc = await mongoose.model("Category").findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (!categoryDoc.subTypes.includes(subType)) {
      return res.status(400).json({
        message: `${subType} is not a valid subtype for the selected category`,
      });
    }

    // Process images
    const cloudinaryFolder = `Products/${productName}`;
    const uploadedImages = await Promise.all(
      images.map((image) => uploadImageToCloudinary(image, cloudinaryFolder))
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productCode,
        productName,
        productPrice,
        category, // Add category field
        subType, // Add subType field
        description,
        brand,
        images: uploadedImages,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    res.json({
      status: "success",
      data: { product: updatedProduct },
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({
      status: "error",
      message: "Product could not be updated",
      error: err.message || err,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting Product", error: error.message });
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
};
