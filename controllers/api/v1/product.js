const jwt = require("jsonwebtoken");
const Product = require("../../../models/api/v1/Product");
const Configuration = require("../../../models/api/v1/Configuration");
const Option = require("../../../models/api/v1/Option");
const Partner = require("../../../models/api/v1/Partner");

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
// Create Product
const create = async (req, res) => {
  try {
    const {
      productCode,
      productName,
      productType,
      productPrice,
      description,
      brand,
      images = [],
      configurations = [],
    } = req.body;

    // Validate required fields
    if (
      !productCode ||
      !productName ||
      !productType ||
      !productPrice ||
      !description ||
      !brand
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: productCode, productName, productType, productPrice, description, brand",
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

    // Process configurations
    const configurationDocuments = await Promise.all(
      configurations.map(async (config) => {
        const configuration = await Configuration.findById(
          config.configurationId
        );
        const selectedOption = await Option.findById(config.selectedOption);

        // Validatie: Controleer of de configuratie en geselecteerde optie bestaan
        if (!configuration || !selectedOption) {
          return res.status(400).json({
            message: `Invalid configuration or selected option: ${config.configurationId} or ${config.selectedOption}`,
          });
        }

        return {
          configurationId: configuration._id,
          selectedOption: selectedOption._id,
        };
      })
    );

    // Create the product
    const newProduct = new Product({
      productCode,
      productName,
      productType,
      productPrice,
      description,
      brand,
      images: uploadedImages,
      partnerId,
      configurations: configurationDocuments, // Voeg de configuraties toe
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

// Get Products with Filters
const index = async (req, res) => {
  try {
    const { partnerName, productType, brand } = req.query;
    const filter = {};

    // Zoek de partner op basis van de naam (inclusief spaties)
    if (partnerName) {
      // Voeg spaties toe in de partnernaam, bijv. OdetteLunettes -> Odette Lunettes
      const partnerNameWithSpaces = partnerName.replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      );

      // Zoek de partner met de naam inclusief spaties
      const partner = await Partner.findOne({
        name: { $regex: new RegExp(`^${partnerNameWithSpaces}$`, "i") }, // Case-insensitive zoekopdracht
      });

      if (!partner) {
        return res.status(404).json({
          status: "error",
          message: `No partner found with name ${partnerName}`,
        });
      }

      filter.partnerId = partner._id; // Gebruik het gevonden partnerId
    }

    // Voeg extra filters toe
    if (productType) filter.productType = productType;
    if (brand) filter.brand = brand;

    // Haal producten op met de filter
    const products = await Product.find(filter);

    res.json({
      status: "success",
      data: { products },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving products",
      error: error.message,
    });
  }
};

// Get Single Product by ID
// Get Single Product by ID
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

    const product = await Product.findById(id)
      .populate("configurations.configurationId") // Populeren van de configuratie
      .populate("configurations.selectedOption"); // Populeren van de geselecteerde optie

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

// Update Product
// Update Product
const update = async (req, res) => {
  const { id } = req.params;
  const {
    productCode,
    productName,
    productType,
    productPrice,
    description,
    brand,
    images = [],
    customConfigurations = [], // Nieuwe veld voor custom configuraties
  } = req.body;

  if (
    !productCode ||
    !productName ||
    !productType ||
    !productPrice ||
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
    // Process images
    const cloudinaryFolder = `Products/${productName}`;
    const uploadedImages = await Promise.all(
      images.map((image) => uploadImageToCloudinary(image, cloudinaryFolder))
    );

    // Verwerk de custom configuraties
    const customConfigDocuments = await Promise.all(
      customConfigurations.map(async (config) => {
        // Hier verifiëren we of de geselecteerde optie geldig is
        const selectedOption = config.selectedOption
          ? await Option.findById(config.selectedOption)
          : null;
        return {
          fieldName: config.fieldName,
          fieldType: config.fieldType,
          selectedOption: selectedOption ? selectedOption._id : null,
        };
      })
    );

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productCode,
        productName,
        productType,
        productPrice,
        description,
        brand,
        images: uploadedImages,
        customConfigurations: customConfigDocuments, // Update custom configuraties
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

// Delete Product
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
