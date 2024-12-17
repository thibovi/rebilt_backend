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
    primary_color,
    secondary_color,
    titles_color,
    text_color,
    background_color,
    fontFamilyBodyText,
    fontFamilyTitles,
    logo_url,
  } = req.body;

  // Validatie voor verplichte velden
  if (
    !name ||
    !package ||
    !primary_color ||
    !secondary_color ||
    !titles_color ||
    !text_color ||
    !background_color ||
    !fontFamilyBodyText ||
    !fontFamilyTitles
  ) {
    return res.status(400).json({
      status: "error",
      message: "Name, package, colors, and fonts are required.",
    });
  }

  try {
    // Maak een nieuw partner object aan
    const newPartner = new Partner({
      name,
      address: address || {}, // Als er geen adres is, gebruik een leeg object
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      package,
      primary_color,
      secondary_color,
      titles_color,
      text_color,
      background_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url: logo_url || null, // Logo is optioneel
    });

    // Sla de nieuwe partner op in de database
    await newPartner.save();

    // Stuur een succesresponse terug
    res.status(201).json({
      status: "success",
      data: {
        partner: newPartner,
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
      primary_color,
      secondary_color,
      titles_color,
      text_color,
      background_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url,
    } = req.body;

    // Validatie voor verplichte velden
    if (
      !name ||
      !package ||
      !primary_color ||
      !secondary_color ||
      !titles_color ||
      !text_color ||
      !background_color ||
      !fontFamilyBodyText ||
      !fontFamilyTitles
    ) {
      return res.status(400).json({
        status: "error",
        message: "Name, package, colors, and fonts are required.",
      });
    }

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    // Werk de partnergegevens bij
    partner.name = name;
    partner.address = address || partner.address;
    partner.contact_email = contact_email || partner.contact_email;
    partner.contact_phone = contact_phone || partner.contact_phone;
    partner.package = package;
    partner.primary_color = primary_color;
    partner.secondary_color = secondary_color;
    partner.titles_color = titles_color;
    partner.text_color = text_color;
    partner.background_color = background_color;
    partner.fontFamilyBodyText = fontFamilyBodyText;
    partner.fontFamilyTitles = fontFamilyTitles;
    partner.logo_url = logo_url || partner.logo_url;

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
  show,
  update,
  destroy,
};
