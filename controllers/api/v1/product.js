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

// ...existing code...
const create = async (req, res) => {
  try {
    const { configurations, selectedFilters, layers } = req.body;

    // Converteer _id naar ObjectId indien nodig
    configurations.forEach((config) => {
      config.selectedOptions.forEach((option) => {
        if (option._id && typeof option._id === "string") {
          option._id = mongoose.Types.ObjectId.isValid(option._id)
            ? new mongoose.Types.ObjectId(option._id)
            : undefined;
        }
      });
    });

    // Optioneel: validatie van selectedFilters (bijvoorbeeld of filterId een geldige ObjectId is)
    if (selectedFilters && Array.isArray(selectedFilters)) {
      selectedFilters.forEach((sf) => {
        if (sf.filterId && typeof sf.filterId === "string") {
          sf.filterId = mongoose.Types.ObjectId.isValid(sf.filterId)
            ? new mongoose.Types.ObjectId(sf.filterId)
            : undefined;
        }
        // CONVERSIE VAN OPTIE-IDS
        if (sf.selectedOptions && Array.isArray(sf.selectedOptions)) {
          sf.selectedOptions = sf.selectedOptions
            .map((optId) =>
              mongoose.Types.ObjectId.isValid(optId)
                ? new mongoose.Types.ObjectId(optId)
                : undefined
            )
            .filter(Boolean);
        }
      });
    }

    if (layers && Array.isArray(layers)) {
      layers.forEach((layer) => {
        if (layer.configurationIds && Array.isArray(layer.configurationIds)) {
          layer.configurationIds = layer.configurationIds
            .map((id) =>
              mongoose.Types.ObjectId.isValid(id)
                ? new mongoose.Types.ObjectId(id)
                : undefined
            )
            .filter(Boolean);
        }
      });
    }

    const newProduct = new Product({
      ...req.body,
      selectedFilters,
      layers, // <-- zorg dat deze wordt meegenomen
      subType:
        req.body.subType && req.body.subType.trim() !== ""
          ? req.body.subType
          : null,
      createdAt: new Date(),
      lastUpdated: new Date(),
    });

    await newProduct.save();

    res.status(201).json({ status: "success", data: newProduct });
  } catch (error) {
    console.error("❌ Fout bij het aanmaken van product:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Get Products with Filters
const index = async (req, res) => {
  try {
    const { partnerName, subType, brand, publishedInactive } = req.query;
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

    if (subType) filter.subType = subType;
    if (brand) filter.brand = brand;
    if (publishedInactive) filter.publishedInactive = publishedInactive;

    const products = await Product.find(filter).populate("categoryIds");

    const formattedProducts = products.map((product) => {
      const productObj = product.toObject();
      return {
        ...productObj,
        subType: productObj.subType || null, // <-- voeg deze regel toe
        createdAt: new Date(productObj.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        lastUpdated: new Date(productObj.lastUpdated).toLocaleString("en-US", {
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
    console.error("❌ Fout bij ophalen van producten:", error.message);
    res.status(500).json({
      status: "error",
      message: "An error occurred while retrieving products",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("configurations.configurationId")
      .populate({
        path: "configurations.selectedOptions.optionId",
        select: "name type price textureUrl",
        match: { _id: { $ne: null } },
      })
      .populate("categoryIds", "_id name")
      .populate("layers.configurationIds");

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Product niet gevonden." });
    }

    const formattedProduct = {
      ...product.toObject(),
      subType: product.subType || null,
      createdAt: new Date(product.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      lastUpdated: new Date(product.lastUpdated).toLocaleString("en-US", {
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
    const { selectedFilters, layers } = req.body;

    console.log("🔄 Update product aangeroepen voor ID:", id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log("❌ Ongeldige product ID:", id);
      return res
        .status(400)
        .json({ status: "error", message: "Ongeldige product ID." });
    }

    // Optioneel: validatie van selectedFilters
    if (selectedFilters && Array.isArray(selectedFilters)) {
      selectedFilters.forEach((sf) => {
        if (sf.filterId && typeof sf.filterId === "string") {
          sf.filterId = mongoose.Types.ObjectId.isValid(sf.filterId)
            ? new mongoose.Types.ObjectId(sf.filterId)
            : undefined;
        }
        if (sf.selectedOptions && Array.isArray(sf.selectedOptions)) {
          sf.selectedOptions = sf.selectedOptions
            .map((optId) =>
              mongoose.Types.ObjectId.isValid(optId)
                ? new mongoose.Types.ObjectId(optId)
                : undefined
            )
            .filter(Boolean);
        }
      });
      console.log(
        "✅ selectedFilters na conversie:",
        JSON.stringify(selectedFilters, null, 2)
      );
    }

    if (layers && Array.isArray(layers)) {
      layers.forEach((layer) => {
        if (layer.configurationIds && Array.isArray(layer.configurationIds)) {
          layer.configurationIds = layer.configurationIds
            .map((id) =>
              mongoose.Types.ObjectId.isValid(id)
                ? new mongoose.Types.ObjectId(id)
                : undefined
            )
            .filter(Boolean);
        }
      });
      console.log("✅ layers na conversie:", JSON.stringify(layers, null, 2));
    }

    // Zorg dat subType (enkelvoud) wordt meegenomen
    let subType = req.body.subType;
    if (subType && typeof subType === "string") {
      subType = mongoose.Types.ObjectId.isValid(subType)
        ? new mongoose.Types.ObjectId(subType)
        : subType;
    }

    // Je mag subTypes (meervoud) laten staan als je die ook gebruikt, maar frontend stuurt subType!
    // let subTypes = req.body.subTypes;
    // if (subTypes && Array.isArray(subTypes)) {
    //   subTypes = subTypes
    //     .map((id) =>
    //       mongoose.Types.ObjectId.isValid(id)
    //         ? new mongoose.Types.ObjectId(id)
    //         : undefined
    //     )
    //     .filter(Boolean);
    // }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          ...req.body,
          selectedFilters,
          layers,
          subType, // <-- voeg deze toe!
          lastUpdated: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      console.log("❌ Product niet gevonden voor update:", id);
      return res
        .status(404)
        .json({ status: "error", message: "Product niet gevonden." });
    }

    const formattedProduct = {
      ...updatedProduct.toObject(),
      subType: updatedProduct.subType || null,
      createdAt: new Date(updatedProduct.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      lastUpdated: new Date(updatedProduct.lastUpdated).toLocaleString(
        "en-US",
        {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
    };

    console.log(
      "✅ Product succesvol geüpdatet:",
      JSON.stringify(formattedProduct, null, 2)
    );

    res.status(200).json({ status: "success", data: formattedProduct });
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
    if (deletedProduct.modelFile && deletedProduct.modelFile.public_id) {
      // Delete the model file from Cloudinary
      await cloudinary.uploader.destroy(deletedProduct.modelFile.public_id);
    }

    if (deletedProduct.thumbnail && deletedProduct.thumbnail.public_id) {
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
