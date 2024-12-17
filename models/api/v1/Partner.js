const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: Object, default: {} },
  contact_email: { type: String, default: null },
  contact_phone: { type: String, default: null },
  package: { type: String, required: true },
  primary_color: { type: String, required: true }, // RGB string
  secondary_color: { type: String, required: true }, // RGB string
  titles_color: { type: String, required: true }, // RGB string
  text_color: { type: String, required: true }, // RGB string
  background_color: { type: String, required: true }, // RGB string
  fontFamilyBodyText: { type: String, required: true },
  fontFamilyTitles: { type: String, required: true },
  logo_url: { type: String, default: null },
});

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
