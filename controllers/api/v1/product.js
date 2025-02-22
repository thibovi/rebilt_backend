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
      productName,
      productType,
      productPrice,
      description,
      brand,
      activeInactive = "active", // Default value for activeInactive
      configurations = [], // Default value for configurations
      modelFile, // The 3D model file (if applicable)
      thumbnail, // The thumbnail image (if applicable)
    } = req.body;

    // Log the incoming files to debug
    console.log("Incoming files:", modelFile, thumbnail);

    // Validate required fields
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

    // Handle uploading modelFile (3D Model)
    let modelFileUrl = null;
    if (modelFile) {
      modelFileUrl = await uploadFileToCloudinary(
        modelFile,
        `Products/${productName}`,
        true
      );
      console.log("Model file uploaded successfully:", modelFileUrl); // Log the model file URL
    }

    // Handle uploading thumbnail
    let thumbnailUrl = null;
    if (thumbnail) {
      thumbnailUrl = await uploadFileToCloudinary(
        thumbnail,
        `Products/${productName}`
      );
      console.log("Thumbnail uploaded successfully:", thumbnailUrl); // Log uploaded thumbnail URL
    }

    const processedConfigurations = await Promise.all(
      configurations.map(async (config) => {
        const { configurationId, selectedOptions = [] } = config;

        // Fetch the partner configuration for the provided configurationId
        const validPartnerConfig = await PartnerConfiguration.findOne({
          partnerId,
          configurationId,
        }).populate("options.optionId");

        if (!validPartnerConfig) {
          throw new Error(
            `No valid partner configuration found for configurationId: ${configurationId}`
          );
        }

        // Process selected options and images
        const processedSelectedOptions = await Promise.all(
          selectedOptions.map(async (selectedOption) => {
            const { optionId, images = [] } = selectedOption;

            // Process images for the selected option
            const processedImages = await Promise.all(
              images.map(async (image) => {
                return await uploadFileToCloudinary(
                  image,
                  `Products/${productName}`
                );
              })
            );

            return {
              optionId,
              images: processedImages,
            };
          })
        );

        return {
          configurationId,
          selectedOptions: processedSelectedOptions,
        };
      })
    );

    // Create the new product with modelFile and thumbnail
    const newProduct = new Product({
      productCode,
      productName,
      productType,
      productPrice,
      description,
      brand,
      activeInactive,
      partnerId,
      configurations: processedConfigurations,
      modelFile: modelFileUrl || null, // Ensure null if no file uploaded
      thumbnail: thumbnailUrl || null, // Ensure null if no thumbnail uploaded
    });

    await newProduct.save();

    res.status(201).json({
      status: "success",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error occurred while creating product:", error);
    res.status(500).json({
      message: "An error occurred while creating the product.",
      error: error.message,
    });
  }
};

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
    configurations = [],
    modelFile, // The 3D model file (if applicable)
    thumbnail, // The thumbnail image (if applicable)
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
    // Handle uploading modelFile (3D Model)
    let modelFileUrl = null;
    if (modelFile) {
      modelFileUrl = await uploadFileToCloudinary(
        modelFile,
        `Products/${productName}`,
        true
      );
    }

    // Handle uploading thumbnail
    let thumbnailUrl = null;
    if (thumbnail) {
      thumbnailUrl = await uploadFileToCloudinary(
        thumbnail,
        `Products/${productName}`
      );
    }

    const processedConfigurations = await Promise.all(
      configurations.map(async (config) => {
        const { configurationId, selectedOptions = [] } = config;

        const validPartnerConfig = await PartnerConfiguration.findOne({
          partnerId,
          configurationId,
        }).populate("options.optionId");

        if (!validPartnerConfig) {
          throw new Error(
            `No valid partner configuration found for configurationId: ${configurationId}`
          );
        }

        const processedSelectedOptions = await Promise.all(
          selectedOptions.map(async (selectedOption) => {
            const { optionId, images = [] } = selectedOption;

            const processedFiles = await Promise.all(
              images.map(async (file) => {
                return await uploadFileToCloudinary(
                  file,
                  `Products/${productName}`
                );
              })
            );

            return {
              optionId,
              images: processedFiles,
            };
          })
        );

        return {
          configurationId,
          selectedOptions: processedSelectedOptions,
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
        configurations: processedConfigurations,
        modelFile: modelFileUrl, // Update modelFile URL if provided
        thumbnail: thumbnailUrl, // Update thumbnail URL if provided
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      status: "success",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Get Products with Filters
const index = async (req, res) => {
  try {
    const { partnerName, productType, brand, activeInactive } = req.query;
    const filter = {};

    // PartnerName filteren
    if (partnerName) {
      const partnerNameWithSpaces = partnerName.replace(
        /([a-z])([A-Z])/g,
        "$1 $2"
      );
      const partner = await Partner.findOne({
        name: { $regex: new RegExp(`^${partnerNameWithSpaces}$`, "i") }, // case-insensitive search
      });

      if (!partner) {
        return res.status(404).json({
          status: "error",
          message: `No partner found with name ${partnerName}`,
        });
      }

      filter.partnerId = partner._id; // Filteren op partnerId
    }

    // Filteren op productType, brand en activeInactive
    if (productType) filter.productType = productType;
    if (brand) filter.brand = brand;
    if (activeInactive) filter.activeInactive = activeInactive;

    // Haal de producten op met de filters
    const products = await Product.find(filter);

    // Zorg ervoor dat modelFile en thumbnail aanwezig zijn in de response
    const formattedProducts = products.map((product) => {
      // Zorg ervoor dat modelFile en thumbnail als string worden weergegeven
      const productObj = product.toObject();

      return {
        ...productObj,
      };
    });

    console.log("Formatted Products:", formattedProducts); // Log voor debug

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

// Get Single Product by ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid or missing product id",
      });
    }

    const product = await Product.findById(id)
      .populate("configurations.configurationId")
      .populate("configurations.selectedOptions.optionId");

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: `Product with id ${id} not found`,
      });
    }

    // Log the product to check if the modelFile and thumbnail are included
    console.log("Product found:", product);

    // Ensure modelFile and thumbnail are included in the response
    res.json({
      status: "success",
      data: {
        product: {
          ...product.toObject(),
          modelFile: product.modelFile || null, // Ensure modelFile is included
          thumbnail: product.thumbnail || null, // Ensure thumbnail is included
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Could not retrieve product",
      error: error.message,
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

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
};
