const mongoose = require("mongoose");
const Partner = require("../../../models/api/v1/Partner");
const cloudinary = require("cloudinary").v2;
const fs = require("fs"); // We gebruiken fs om het JSON-bestand lokaal te maken
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const create = async (req, res) => {
  const { name, address, contact_email, contact_phone, package } = req.body;

  if (!name || !package) {
    return res.status(400).json({
      status: "error",
      message: "Name and package are required.",
    });
  }

  try {
    // Hardcoded huisstijlgegevens
    const primaryColor = "#9747ff"; // Primaire kleur
    const secondaryColor = "#000000"; // Secundaire kleur
    const titleColor = "#ffffff"; // Secundaire kleur
    const colorForButtons = "#0071e3"; // Secundaire kleur
    const fonts = [
      {
        name: "DM Sans",
        path: "https://metejoor.be/assets/fonts/DINCondensedWeb.woff2",
      },
      {
        name: "Syne",
        path: "https://metejoor.be/assets/fonts/DINCondensedWeb.woff2",
      },
    ]; // Fonts
    const logoPath =
      "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp"; // Logo
    const backgroundImagePath =
      "https://img-cdn.pixlr.com/image-generator/history/65bb506dcb310754719cf81f/ede935de-1138-4f66-8ed7-44bd16efc709/medium.webp"; // Achtergrondafbeelding

    // Hoofdmap voor de partner
    const cloudinaryFolder = `${name}`;

    // Submap "Huisstijl" in de hoofdmap
    const huisstijlFolder = `${cloudinaryFolder}/Huisstijl`;

    // JSON object voor huisstijldata
    const huisstijlData = {
      primaryColor,
      secondaryColor,
      titleColor,
      colorForButtons,
      fonts,
      logo: logoPath,
      backgroundImage: backgroundImagePath,
    };

    // Zet de huisstijlgegevens om in een JSON-bestand
    const huisstijlJson = JSON.stringify(huisstijlData);

    // Sla het bestand op lokaal voordat we het uploaden naar Cloudinary
    fs.writeFileSync("huisstijl.json", huisstijlJson);

    // Upload het JSON-bestand naar Cloudinary
    const uploadResult = await cloudinary.uploader.upload("huisstijl.json", {
      folder: huisstijlFolder,
      resource_type: "raw", // Aangeven dat het een raw bestand is (geen afbeelding of video)
      public_id: "huisstijl_data", // Specifieke public_id voor het huisstijlbestand
    });

    // Maak de partner aan in de database
    const newPartner = new Partner({
      name,
      address: address || {},
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      package,
    });

    await newPartner.save();

    // Stuur succesresponse terug
    res.status(201).json({
      status: "success",
      data: {
        partner: newPartner,
        folders: {
          main: cloudinaryFolder,
          huisstijl: huisstijlFolder,
        },
        huisstijlData: {
          primaryColor,
          secondaryColor,
          fonts,
          logo: logoPath,
          backgroundImage: backgroundImagePath,
          huisstijlJsonUrl: uploadResult.secure_url, // URL van het geüploade JSON bestand
        },
      },
    });
  } catch (err) {
    console.error("Error creating partner:", err);
    res.status(500).json({
      status: "error",
      message: "Partner could not be created.",
      error: err.message,
    });
  }
};

// List all partners
const index = async (req, res) => {
  try {
    const partners = await Partner.find();

    res.json({
      status: "success",
      data: { partners },
    });
  } catch (err) {
    console.error("Error fetching partners:", err);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve partners.",
      error: err.message,
    });
  }
};

// Retrieve a specific partner by ID
const show = async (req, res) => {
  try {
    const { id } = req.params; // Let op de parameternaam 'id'

    // Controleer of id aanwezig is
    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Partner ID is required.",
      });
    }

    // Controleer of id een geldig MongoDB ObjectId is
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Partner ID format.",
      });
    }

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    res.json({
      status: "success",
      data: { partner },
    });
  } catch (err) {
    console.error("Error retrieving partner:", err);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve the partner.",
      error: err.message,
    });
  }
};

// Update a partner
const update = async (req, res) => {
  try {
    const { id } = req.params; // Gebruik nu :id zoals gedefinieerd in de route
    const { name, address, contact_email, contact_phone, package } = req.body;

    if (!name || !package) {
      return res.status(400).json({
        status: "error",
        message: "Name and package are required.",
      });
    }

    const partner = await Partner.findById(id); // Gebruik id hier

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    // Update de partner met de nieuwe gegevens
    partner.name = name;
    partner.address = address || partner.address;
    partner.contact_email = contact_email || partner.contact_email;
    partner.contact_phone = contact_phone || partner.contact_phone;
    partner.package = package;

    // Sla de bijgewerkte partner op
    await partner.save();

    res.json({
      status: "success",
      data: { partner },
    });
  } catch (err) {
    console.error("Error updating partner:", err);
    res.status(500).json({
      status: "error",
      message: "Could not update the partner.",
      error: err.message,
    });
  }
};

// Delete a partner
const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPartner = await Partner.findByIdAndDelete(id);

    if (!deletedPartner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Partner deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting partner:", err);
    res.status(500).json({
      status: "error",
      message: "Could not delete the partner.",
      error: err.message,
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
