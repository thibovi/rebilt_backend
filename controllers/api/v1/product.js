const jwt = require("jsonwebtoken");
const Product = require("../../../models/api/v1/Product");
require("dotenv").config(); // Zorg ervoor dat je dotenv geladen is
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const create = async (req, res) => {
  try {
    // Extracting product data from the request body
    const {
      productCode,
      productName,
      productPrice,
      typeOfProduct,
      description,
      brand,
      sizeOptions,
      images,
      lacesColor,
      lacesTexture,
      soleBottomColor,
      soleBottomTexture,
      soleTopColor,
      soleTopTexture,
      insideColor,
      insideTexture,
      outside1Color,
      outside1Texture,
      outside2Color,
      outside2Texture,
      outside3Color,
      outside3Texture,
    } = req.body;

    // Ensure all required fields are present
    if (
      !productCode ||
      !productName ||
      !productPrice ||
      !description ||
      !brand
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: productCode, productName, productPrice, description, brand",
      });
    }

    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization required" });
    }

    // Verify and decode the JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify using the secret key
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Extract partnerId from the decoded token
    const partnerId = decoded.companyId;
    if (!partnerId) {
      return res
        .status(401)
        .json({ message: "Token does not contain valid companyId" });
    }

    // Create a new product object
    const newProduct = new Product({
      productCode,
      productName,
      productPrice,
      typeOfProduct,
      description,
      brand,
      sizeOptions,
      images,
      lacesColor,
      lacesTexture,
      soleBottomColor,
      soleBottomTexture,
      soleTopColor,
      soleTopTexture,
      insideColor,
      insideTexture,
      outside1Color,
      outside1Texture,
      outside2Color,
      outside2Texture,
      outside3Color,
      outside3Texture,
      partnerId, // associate the partnerId with the product
    });

    // Save the new product to the database
    await newProduct.save();

    // Respond with the created product
    res.status(201).json({
      status: "success",
      data: newProduct,
    });
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
    const { id } = req.params; // Neem de id uit de parameters

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Product id is required to retrieve a single product",
      });
    }

    // Zorg ervoor dat de id een geldige MongoDB ObjectId is
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid product id",
      });
    }

    // Zoek het product op basis van de MongoDB _id
    const product = await Product.findById(id);

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

const update = async (req, res) => {
  const { id } = req.params;
  const product = req.body.product;

  if (!product) {
    return res.status(400).json({
      status: "error",
      message: "Product data is required for update.",
    });
  }

  const {
    productCode,
    productName,
    productPrice,
    typeOfProduct = "sneaker",
    description,
    brand,
    sizeOptions,
    images = [],
    lacesColor,
    lacesTexture,
    soleBottomColor,
    soleBottomTexture,
    soleTopColor,
    soleTopTexture,
    insideColor,
    insideTexture,
    outside1Color,
    outside1Texture,
    outside2Color,
    outside2Texture,
    outside3Color,
    outside3Texture,
  } = product;

  if (
    !productCode ||
    !productName ||
    !productPrice ||
    !description ||
    !brand ||
    !sizeOptions ||
    !lacesColor ||
    !lacesTexture ||
    !soleBottomColor ||
    !soleBottomTexture ||
    !soleTopColor ||
    !soleTopTexture ||
    !insideColor ||
    !insideTexture ||
    !outside1Color ||
    !outside1Texture ||
    !outside1Texture ||
    !outside2Color ||
    !outside2Texture ||
    !outside3Color ||
    !outside3Texture
  ) {
    return res.status(400).json({
      status: "error",
      message: "Product is missing required fields.",
    });
  }

  try {
    // Valideer de kleurarrays
    validateColorArray(lacesColor, "lacesColor");
    validateColorArray(soleBottomColor, "soleBottomColor");
    validateColorArray(soleTopColor, "soleTopColor");
    validateColorArray(insideColor, "insideColor");
    validateColorArray(outside1Color, "outside1Color");
    validateColorArray(outside2Color, "outside2Color");
    validateColorArray(outside3Color, "outside3Color");

    let uploadedImages = [];
    for (const image of images) {
      if (
        typeof image === "string" &&
        image.startsWith("https://res.cloudinary.com")
      ) {
        uploadedImages.push(image);
      } else {
        // Zorg ervoor dat image een geldige URL is of een string die je kunt uploaden naar Cloudinary
        const result = await cloudinary.uploader.upload(image, {
          folder: "Odette Lunettes",
          resource_type: "auto",
          format: "png",
        });
        uploadedImages.push(result.secure_url);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productCode,
        productName,
        productPrice,
        typeOfProduct,
        description,
        brand,
        sizeOptions,
        images: uploadedImages,
        lacesColor,
        lacesTexture,
        soleBottomColor,
        soleBottomTexture,
        soleTopColor,
        soleTopTexture,
        insideColor,
        insideTexture,
        outside1Color,
        outside1Texture,
        outside2Color,
        outside2Texture,
        outside3Color,
        outside3Texture,
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
