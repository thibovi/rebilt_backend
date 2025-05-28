const mongoose = require("mongoose");
const Partner = require("../../../models/api/v1/Partner");
require("dotenv").config();

// Functie voor het aanmaken van een nieuwe partner
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const postalCodeRegex = /^[0-9]{4,6}$/; // Pas aan voor jouw land
const phoneRegex = /^\+\d{1,4}\s?\d{6,14}$/;

const create = async (req, res) => {
  const {
    name,
    street,
    housenumber,
    postalCode,
    city,
    country,
    contact_person,
    contact_email,
    contact_phone,
    package,
    domain,
    activeInactive,
    primary_color,
    secondary_color,
    titles_color,
    text_color,
    background_color,
    button_color,
    fontFamilyBodyText,
    fontFamilyTitles,
    logo_url,
    favicon_url,
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
    hasTwoDToThreeDTool,
    seoTitle,
    metaDescription,
    seoImage,
  } = req.body;

  // Basisverplichtingen
  if (!name || !package) {
    return res.status(400).json({
      status: "error",
      message: "Name and package are required.",
    });
  }

  if (contact_email && !emailRegex.test(contact_email)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid email address.",
    });
  }

  // Check of contact_email al bestaat
  if (contact_email) {
    const existingPartner = await Partner.findOne({ contact_email });
    if (existingPartner) {
      return res.status(400).json({
        status: "error",
        message: "Contact email is already in use.",
      });
    }
  }

  // Postcode validatie
  if (postalCode && !postalCodeRegex.test(postalCode)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid postal code.",
    });
  }

  // Telefoonnummer validatie
  if (contact_phone && !phoneRegex.test(contact_phone)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid phone number.",
    });
  }

  try {
    const newPartner = new Partner({
      name,
      street: street || null,
      housenumber: housenumber || null,
      postalCode: postalCode || null,
      city: city || null,
      country: country || null,
      contact_person: contact_person || null,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null,
      package,
      domain,
      activeInactive,
      primary_color,
      secondary_color,
      titles_color,
      text_color,
      background_color,
      button_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url: logo_url || null,
      favicon_url: favicon_url || null,
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
      hasTwoDToThreeDTool: hasTwoDToThreeDTool || false,
      seoTitle: seoTitle || null,
      metaDescription: metaDescription || null,
      seoImage: seoImage || null,
      created_at: new Date(),
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
      data: {
        partner: {
          id: partner._id,
          name: partner.name,
          street: partner.street,
          housenumber: partner.housenumber,
          postalCode: partner.postalCode,
          city: partner.city,
          country: partner.country,
          contact_person: partner.contact_person,
          contact_email: partner.contact_email,
          contact_phone: partner.contact_phone,
          package: partner.package,
          domain: partner.domain,
          activeInactive: partner.activeInactive,
          primary_color: partner.primary_color,
          secondary_color: partner.secondary_color,
          titles_color: partner.titles_color,
          text_color: partner.text_color,
          background_color: partner.background_color,
          button_color: partner.button_color,
          fontFamilyBodyText: partner.fontFamilyBodyText,
          fontFamilyTitles: partner.fontFamilyTitles,
          logo_url: partner.logo_url,
          favicon_url: partner.favicon_url,
          black: partner.black,
          white: partner.white,
          blue_600: partner.blue_600,
          gray_100: partner.gray_100,
          gray_200: partner.gray_200,
          gray_300: partner.gray_300,
          gray_400: partner.gray_400,
          gray_500: partner.gray_500,
          gray_600: partner.gray_600,
          gray_700: partner.gray_700,
          gray_800: partner.gray_800,
          gray_900: partner.gray_900,
          hasTwoDToThreeDTool: partner.hasTwoDToThreeDTool,
          seoTitle: partner.seoTitle,
          metaDescription: partner.metaDescription,
          seoImage: partner.seoImage,
          createdAt: partner.createdAt,
        },
      },
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

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      street,
      housenumber,
      postalCode,
      city,
      country,
      contact_person,
      contact_email,
      contact_phone,
      package,
      domain,
      activeInactive,
      primary_color,
      secondary_color,
      titles_color,
      text_color,
      background_color,
      button_color,
      fontFamilyBodyText,
      fontFamilyTitles,
      logo_url,
      favicon_url,
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
      hasTwoDToThreeDTool,
      seoTitle,
      metaDescription,
      seoImage,
    } = req.body;

    // Validaties
    if (contact_email && !emailRegex.test(contact_email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email address.",
      });
    }
    if (postalCode && !postalCodeRegex.test(postalCode)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid postal code.",
      });
    }
    if (contact_phone && !phoneRegex.test(contact_phone)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid phone number.",
      });
    }
    if (activeInactive && !["active", "inactive"].includes(activeInactive)) {
      return res.status(400).json({
        status: "error",
        message: "activeInactive must be 'active' or 'inactive'.",
      });
    }

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    if (name !== undefined) partner.name = name;
    if (street !== undefined) partner.street = street;
    if (housenumber !== undefined) partner.housenumber = housenumber;
    if (postalCode !== undefined) partner.postalCode = postalCode;
    if (city !== undefined) partner.city = city;
    if (country !== undefined) partner.country = country;
    if (contact_person !== undefined) partner.contact_person = contact_person;
    if (contact_email !== undefined) partner.contact_email = contact_email;
    if (contact_phone !== undefined) partner.contact_phone = contact_phone;
    if (package !== undefined) partner.package = package;
    if (domain !== undefined) partner.domain = domain;
    if (activeInactive !== undefined) partner.activeInactive = activeInactive;
    if (primary_color !== undefined) partner.primary_color = primary_color;
    if (secondary_color !== undefined)
      partner.secondary_color = secondary_color;
    if (titles_color !== undefined) partner.titles_color = titles_color;
    if (text_color !== undefined) partner.text_color = text_color;
    if (background_color !== undefined)
      partner.background_color = background_color;
    if (button_color !== undefined) partner.button_color = button_color;
    if (fontFamilyBodyText !== undefined)
      partner.fontFamilyBodyText = fontFamilyBodyText;
    if (fontFamilyTitles !== undefined)
      partner.fontFamilyTitles = fontFamilyTitles;
    if (logo_url !== undefined) partner.logo_url = logo_url;
    if (favicon_url !== undefined) partner.favicon_url = favicon_url;
    if (black !== undefined) partner.black = black;
    if (white !== undefined) partner.white = white;
    if (blue_600 !== undefined) partner.blue_600 = blue_600;
    if (gray_100 !== undefined) partner.gray_100 = gray_100;
    if (gray_200 !== undefined) partner.gray_200 = gray_200;
    if (gray_300 !== undefined) partner.gray_300 = gray_300;
    if (gray_400 !== undefined) partner.gray_400 = gray_400;
    if (gray_500 !== undefined) partner.gray_500 = gray_500;
    if (gray_600 !== undefined) partner.gray_600 = gray_600;
    if (gray_700 !== undefined) partner.gray_700 = gray_700;
    if (gray_800 !== undefined) partner.gray_800 = gray_800;
    if (gray_900 !== undefined) partner.gray_900 = gray_900;
    if (hasTwoDToThreeDTool !== undefined)
      partner.hasTwoDToThreeDTool = hasTwoDToThreeDTool;
    if (seoTitle !== undefined) partner.seoTitle = seoTitle;
    if (metaDescription !== undefined)
      partner.metaDescription = metaDescription;
    if (seoImage !== undefined) partner.seoImage = seoImage;

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
