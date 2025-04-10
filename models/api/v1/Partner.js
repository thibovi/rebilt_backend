const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: Object, default: {} },
  contact_person: { type: String, default: null },
  contact_email: { type: String, default: null },
  contact_phone: { type: String, default: null },
  package: { type: String, required: true },
  domain: { type: String, required: null },
  primary_color: { type: String, required: true }, // RGB string
  secondary_color: { type: String, required: true }, // RGB string
  titles_color: { type: String, required: true }, // RGB string
  text_color: { type: String, required: true }, // RGB string
  background_color: { type: String, required: true }, // RGB string
  button_color: { type: String, required: true }, // RGB string
  fontFamilyBodyText: { type: String, required: true },
  fontFamilyTitles: { type: String, required: true },
  logo_url: { type: String, default: null },
  favicon_url: { type: String, default: null },
  black: { type: String, default: null }, // Hex or RGB string
  white: { type: String, default: null }, // Hex or RGB string
  blue_600: { type: String, default: null }, // Hex or RGB string
  gray_100: { type: String, default: null }, // Hex or RGB string
  gray_200: { type: String, default: null }, // Hex or RGB string
  gray_300: { type: String, default: null }, // Hex or RGB string
  gray_400: { type: String, default: null }, // Hex or RGB string
  gray_500: { type: String, default: null }, // Hex or RGB string
  gray_600: { type: String, default: null }, // Hex or RGB string
  gray_700: { type: String, default: null }, // Hex or RGB string
  gray_800: { type: String, default: null }, // Hex or RGB string
  gray_900: { type: String, default: null }, // Hex or RGB string
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
