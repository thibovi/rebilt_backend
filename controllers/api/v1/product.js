const jwt = require("jsonwebtoken");
const Product = require("../../../models/api/v1/Product");
const Configuration = require("../../../models/api/v1/Configuration");
const Option = require("../../../models/api/v1/Option");
const PartnerConfiguration = require("../../../models/api/v1/PartnerConfiguration");
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

const create = async (req, res) => {
  try {
    const {
      productCode,
      productName,
      productType,
      productPrice,
      description,
      brand,
      activeInactive = "active", // Default value for activeInactive
      configurations = [],
    } = req.body;

    // Controleer verplichte velden
    if (
      !productName ||
      !productType ||
      !productPrice ||
      !description ||
      !brand
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: productName, productType, productPrice, description, brand",
      });
    }

    if (isNaN(productPrice) || productPrice <= 0) {
      return res.status(400).json({
        message: "Invalid productPrice. It must be a positive number.",
      });
    }

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const partnerId = decoded.companyId;

    if (!partnerId) {
      return res
        .status(401)
        .json({ message: "Token does not contain valid companyId." });
    }

    // Stap 1: Zoek de partnerconfiguraties voor de juiste partner
    const partnerConfigurations = await PartnerConfiguration.find({
      partnerId: partnerId,
    }).populate("options.optionId"); // Zorg ervoor dat de opties gepopuleerd worden

    if (!partnerConfigurations || partnerConfigurations.length === 0) {
      return res.status(400).json({
        status: "error",
        message: `No partner configurations found for partner ID ${partnerId}`,
      });
    }

    // Stap 2: Loop door alle configuraties en valideer de data
    const configurationDocuments = await Promise.all(
      configurations.map(async (config) => {
        const { configurationId, selectedOption } = config;

        // Zoek de partnerconfiguratie die overeenkomt met configurationId
        const validPartnerConfig = partnerConfigurations.find(
          (partnerConfig) =>
            partnerConfig.configurationId.toString() === configurationId
        );

        if (!validPartnerConfig) {
          throw new Error(
            `No valid partner configuration found for configurationId: ${configurationId}`
          );
        }

        // Zoek de geselecteerde optie binnen de gepopuleerde opties
        const selectedOptionDetails = validPartnerConfig.options.find(
          (option) => option.optionId._id.toString() === selectedOption
        );

        if (!selectedOptionDetails) {
          throw new Error(
            `Selected option with ID ${selectedOption} does not exist in the partner configuration options.`
          );
        }

        return {
          configurationId: validPartnerConfig.configurationId,
          selectedOption: selectedOptionDetails.optionId._id, // Zorg ervoor dat we de juiste optie opslaan
        };
      })
    );

    // Stap 3: Maak het product aan met de bijbehorende partnerconfiguraties
    const newProduct = new Product({
      productCode,
      productName,
      productType,
      productPrice,
      description,
      brand,
      activeInactive: activeInactive, // Opslaan van actieve status
      partnerId,
      configurations: configurationDocuments, // Voeg de configuraties toe aan het product
    });

    await newProduct.save();
    res.status(201).json({ status: "success", data: newProduct });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while creating the product.",
      error: error.message,
    });
  }
};

// Get Products with Filters
const index = async (req, res) => {
  try {
    const { partnerName, productType, brand, activeInactive } = req.query;
    const filter = {};

    if (partnerName) {
      const partnerNameWithSpaces = partnerName.replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      );
      const partner = await Partner.findOne({
        name: { $regex: new RegExp(`^${partnerNameWithSpaces}$`, "i") },
      });

      if (!partner) {
        return res.status(404).json({
          status: "error",
          message: `No partner found with name ${partnerName}`,
        });
      }

      filter.partnerId = partner._id;
    }

    if (productType) filter.productType = productType;
    if (brand) filter.brand = brand;
    if (activeInactive) filter.activeInactive = activeInactive;

    const products = await Product.find(filter);

    res.json({ status: "success", data: { products } });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving products",
      error: error.message,
    });
  }
};

// Get Single Product by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or missing product id",
      });
    }

    const product = await Product.findById(id)
      .populate("configurations.configurationId")
      .populate("configurations.selectedOption");

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Product with id ${id} not found`,
      });
    }

    res.json({ status: "success", data: { product } });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve product",
      error: error.message,
    });
  }
};

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
    activeInactive,
    images = [],
    configurations = [],
  } = req.body;

  if (!productName || !productType || !productPrice || !description) {
    return res
      .status(400)
      .json({ message: "Product is missing required fields." });
  }

  if (productPrice <= 0) {
    return res
      .status(400)
      .json({ message: "productPrice must be greater than zero" });
  }

  try {
    const cloudinaryFolder = `Products/${productName}`;
    const processedImages = await Promise.all(
      images.map(async (image) => {
        const imageUrl = await uploadImageToCloudinary(
          image.url,
          cloudinaryFolder
        );
        return {
          url: imageUrl,
          colors: image.colors || [],
        };
      })
    );

    const configurationDocuments = await Promise.all(
      configurations.map(async (config) => {
        const configuration = await Configuration.findById(
          config.configurationId
        );
        const selectedOption = await Option.findById(config.selectedOption);

        if (!configuration || !selectedOption) {
          throw new Error(
            `Invalid configuration or selected option: ${config.configurationId} or ${config.selectedOption}`
          );
        }

        return {
          configurationId: configuration._id,
          selectedOption: selectedOption._id,
        };
      })
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productCode,
        productName,
        productType,
        productPrice,
        description,
        brand,
        activeInactive,
        images: processedImages,
        configurations: configurationDocuments,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ status: "success", data: { product: updatedProduct } });
  } catch (err) {
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
    res.status(500).json({
      message: "Error deleting Product",
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
