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
  background_color: {
    type: String,
    required: true,
    match: /^#([0-9A-F]{3}){1,2}$/i,
  },
  text_color: {
    type: String,
    required: true,
    match: /^#([0-9A-F]{3}){1,2}$/i,
  },
  fontFamilyBodyText: {
    type: String,
    required: true,
  },
  fontFamilyTitles: {
    type: String,
    required: true,
  },
  logo_url: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const HouseStyle = mongoose.model("HouseStyle", houseStyleSchema);

module.exports = HouseStyle;
