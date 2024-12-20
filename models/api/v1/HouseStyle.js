const mongoose = require("mongoose");

const houseStyleSchema = new mongoose.Schema({
  primary_color: {
    type: String,
    required: true,
    match: /^#([0-9A-F]{3}){1,2}$/i,
  },
  secondary_color: {
    type: String,
    required: true,
    match: /^#([0-9A-F]{3}){1,2}$/i,
  },
  titles_color: { type: String, required: true },
  text_color: { type: String, required: true, match: /^#([0-9A-F]{3}){1,2}$/i },
  background_color: {
    type: String,
    required: true,
    match: /^#([0-9A-F]{3}){1,2}$/i,
  },
  fontFamilyBodyText: { type: String, required: true },
  fontFamilyTitles: { type: String, required: true },
  logo_url: { type: String, required: false }, // Added logo_url field
  partnerId: {
    // Changed from userId to partnerId
    type: mongoose.Schema.Types.ObjectId,
    ref: "Partner", // Assuming you have a Partner model
    required: false, // Make it optional depending on your use case
  },
});

const HouseStyle = mongoose.model("HouseStyle", houseStyleSchema);

module.exports = HouseStyle;
