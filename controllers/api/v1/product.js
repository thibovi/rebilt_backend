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

// Function to upload image or model to Cloudinary
const uploadFileToCloudinary = async (file, folder, is3DModel = false) => {
  try {
    const options = { folder };

    if (is3DModel) {
      options.resource_type = "raw"; // For 3D models like .obj or .glb
    }

    const result = await cloudinary.uploader.upload(file, options);
    return result.secure_url; // Return the URL of the uploaded file
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const create = async (req, res) => {
  try {
    const {
      productCode,
      productSelectedType,
      productName,
      productType,
      brand,
      productPrice,
      pageTitle,
      metaDescription,
      urlHandle,
      publishedInactive,
      configurations,
      partnerId,
      categoryIds, // Voeg categoryIds toe aan de destructurering
    } = req.body;

    if (!productName || !productType) {
      return res.status(400).json({
        status: "error",
        message: "Productnaam en producttype zijn verplicht.",
      });
    }

    if (!partnerId) {
      return res.status(400).json({
        status: "error",
        message: "Partner ID is verplicht.",
      });
    }

    const processedConfigurations = await Promise.all(
      configurations.map(async (config) => {
        const { configurationId, selectedOptions } = config;

        const validPartnerConfig = await PartnerConfiguration.findOne({
          configurationId,
        });
        if (!validPartnerConfig) {
          console.error(
            `⚠️ Geen geldige configuratie gevonden voor ID: ${configurationId}`
          );
          throw new Error(
            `Geen geldige configuratie gevonden voor ID: ${configurationId}`
          );
        }

        const processedSelectedOptions = await Promise.all(
          selectedOptions.map(async (option) => {
            const { optionId, images = [] } = option;

            if (!optionId) {
              console.error(
                "⚠️ optionId is null. Controleer de frontend of database."
              );
              throw new Error("Invalid optionId: null value detected.");
            }

            const optionExists = await Option.findById(optionId);
            if (!optionExists) {
              console.error(
                `⚠️ optionId ${optionId} niet gevonden in de database.`
              );
              throw new Error(`Option met ID ${optionId} bestaat niet.`);
            }

            const processedImages = await Promise.all(
              images.map(
                async (image) =>
                  await uploadFileToCloudinary(image, `Products/${productName}`)
              )
            );

            return { optionId, images: processedImages };
          })
        );

        return { configurationId, selectedOptions: processedSelectedOptions };
      })
    );

    const newProduct = new Product({
      productCode,
      productSelectedType,
      productName,
      productType,
      brand,
      productPrice,
      pageTitle,
      metaDescription,
      urlHandle,
      publishedInactive,
      configurations: processedConfigurations,
      partnerId,
      categoryIds, // Voeg categoryIds toe aan het product
      createdAt: new Date(),
      lastUpdated: new Date(),
    });

    await newProduct.save();

    const formattedProduct = {
      ...newProduct.toObject(),
      createdAt: new Date(newProduct.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      lastUpdated: new Date(newProduct.lastUpdated).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    res.status(201).json({ status: "success", data: formattedProduct });
  } catch (error) {
    console.error("❌ Fout bij het aanmaken van product:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Products with Filters
const index = async (req, res) => {
  try {
    const { partnerName, productType, brand, publishedInactive } = req.query;
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
    if (publishedInactive) filter.publishedInactive = publishedInactive;

    const products = await Product.find(filter).populate("categoryIds");

    const formattedProducts = products.map((product) => {
      const productObj = product.toObject();
      return {
        ...productObj,
        createdAt: new Date(productObj.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    res.json({
      status: "success",
      data: { products: formattedProducts },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving products",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        message: `Ongeldige product ID: ${req.params.id}`,
      });
    }

    const product = await Product.findById(req.params.id)
      .populate("configurations.configurationId")
      .populate({
        path: "configurations.selectedOptions.optionId",
        match: { _id: { $ne: null } },
      })
      .populate("categoryIds"); // Voeg categoryIds toe aan de populate

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Product met ID ${req.params.id} niet gevonden.`,
      });
    }

    const formattedProduct = {
      ...product.toObject(),
      createdAt: new Date(product.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    res.status(200).json({ status: "success", data: formattedProduct });
  } catch (error) {
    console.error("❌ Fout bij ophalen van product:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ status: "error", message: "Ongeldige product ID." });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        status: "error",
        message: `Product met ID ${id} niet gevonden.`,
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: { ...req.body, lastUpdated: new Date() }, // Update lastUpdated to the current time
      },
      { new: true, runValidators: true } // `new: true` geeft de geüpdatete versie terug
    );

    res.status(200).json({ status: "success", data: updatedProduct });
  } catch (error) {
    console.error("❌ Fout bij het bijwerken van product:", error.message);
    res.status(500).json({ status: "error", message: error.message });
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

    // Optionally, you could delete the associated files from Cloudinary (modelFile and thumbnail) here
    if (deletedProduct.modelFile) {
      // Delete the model file from Cloudinary
      await cloudinary.uploader.destroy(deletedProduct.modelFile.public_id);
    }

    if (deletedProduct.thumbnail) {
      // Delete the thumbnail file from Cloudinary
      await cloudinary.uploader.destroy(deletedProduct.thumbnail.public_id);
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting Product",
      error: error.message,
    });
  }
};

// Delete all Products

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
};
