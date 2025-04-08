const mongoose = require("mongoose");
const Partner = require("../../../models/api/v1/Partner");
require("dotenv").config();

// Functie voor het aanmaken van een nieuwe partner
const create = async (req, res) => {
  const {
    name,
    address,
    contact_email,
    contact_phone,
    package,
    domain,
    primary_color,
    secondary_color,
    titles_color,
    text_color,
    background_color,
    button_color,
    fontFamilyBodyText,
    fontFamilyTitles,
    logo_url,
    black,
    white,
    blue_600,
    gray_100,
    gray_200,
    gray_300,
    gray_400,
    gray_500,
    gray_600,
    gray_700,
    gray_800,
    gray_900,
  } = req.body;

  // Validatie voor verplichte velden
  if (
    !name ||
    !package ||
    !domain ||
    !primary_color ||
    !secondary_color ||
    !titles_color ||
    !text_color ||
    !background_color ||
    !button_color ||
    !fontFamilyBodyText ||
    !fontFamilyTitles
  ) {
    return res.status(400).json({
      status: "error",
      message: "Name, package, domain, colors, and fonts are required.",
    });
  }

  try {
    const newPartner = new Partner({
      name,
      address: address || {},
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      package,
      domain,
      primary_color,
      secondary_color,
      titles_color,
      text_color,
      background_color,
      button_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url: logo_url || null,
      black,
      white,
      blue_600,
      gray_100,
      gray_200,
      gray_300,
      gray_400,
      gray_500,
      gray_600,
      gray_700,
      gray_800,
      gray_900,
    });

    await newPartner.save();
    res.status(201).json({
      status: "success",
      data: { partner: newPartner },
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

// Functie om alle partners op te halen
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

const findByName = async (req, res) => {
  try {
    let { partnerName } = req.params;

    // Decode de URL en vervang %20 door een spatie
    partnerName = decodeURIComponent(partnerName);

    // Zoek partner in de database op basis van de naam
    const partner = await Partner.findOne({ name: partnerName });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: `Geen partner gevonden met de naam: ${partnerName}`,
      });
    }

    res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    console.error("Error bij ophalen van partner:", error);
    res.status(500).json({
      success: false,
      message: "Er is een fout opgetreden bij het ophalen van de partner.",
      error,
    });
  }
};

// Functie om een specifieke partner op te halen via ID
const show = async (req, res) => {
  try {
    const { id } = req.params;

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

// Functie om een partner bij te werken
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      contact_email,
      contact_phone,
      package,
      domain,
      primary_color,
      secondary_color,
      titles_color,
      text_color,
      background_color,
      button_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url,
      black,
      white,
      blue_600,
      gray_100,
      gray_200,
      gray_300,
      gray_400,
      gray_500,
      gray_600,
      gray_700,
      gray_800,
      gray_900,
    } = req.body;

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    // Werk de partnergegevens bij
    partner.name = name;
    partner.address = address !== undefined ? address : partner.address;
    partner.contact_email = contact_email || partner.contact_email;
    partner.contact_phone = contact_phone || partner.contact_phone;
    partner.package = package;
    partner.domain = domain;
    partner.primary_color =
      primary_color !== undefined ? primary_color : partner.primary_color;
    partner.secondary_color =
      secondary_color !== undefined ? secondary_color : partner.secondary_color;
    partner.titles_color =
      titles_color !== undefined ? titles_color : partner.titles_color;
    partner.text_color =
      text_color !== undefined ? text_color : partner.text_color;
    partner.background_color =
      background_color !== undefined
        ? background_color
        : partner.background_color;
    partner.button_color =
      button_color !== undefined ? button_color : partner.button_color;
    partner.fontFamilyBodyText =
      fontFamilyBodyText !== undefined
        ? fontFamilyBodyText
        : partner.fontFamilyBodyText;
    partner.fontFamilyTitles =
      fontFamilyTitles !== undefined
        ? fontFamilyTitles
        : partner.fontFamilyTitles;
    partner.logo_url = logo_url !== undefined ? logo_url : partner.logo_url;
    partner.black = black || partner.black;
    partner.white = white || partner.white;
    partner.blue_600 = blue_600 || partner.blue_600;
    partner.gray_100 = gray_100 || partner.gray_100;
    partner.gray_200 = gray_200 || partner.gray_200;
    partner.gray_300 = gray_300 || partner.gray_300;
    partner.gray_400 = gray_400 || partner.gray_400;
    partner.gray_500 = gray_500 || partner.gray_500;
    partner.gray_600 = gray_600 || partner.gray_600;
    partner.gray_700 = gray_700 || partner.gray_700;
    partner.gray_800 = gray_800 || partner.gray_800;
    partner.gray_900 = gray_900 || partner.gray_900;

    await partner.save();
    res.json({
      status: "success",
      message: "Partner updated successfully.",
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

// Functie om een partner te verwijderen
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
  findByName,
  show,
  update,
  destroy,
};
