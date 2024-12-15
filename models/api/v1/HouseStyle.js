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
  text_color: {
    type: String,
    required: true,
    match: /^#([0-9A-F]{3}){1,2}$/i,
  },
  background_color: {
    type: String,
    required: true,
    match: /^#([0-9A-F]{3}){1,2}$/i,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const HouseStyle = mongoose.model("HouseStyle", houseStyleSchema);

module.exports = HouseStyle;
