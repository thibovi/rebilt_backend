const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Zorgt ervoor dat dezelfde categorie niet twee keer wordt toegevoegd
  },
  subTypes: {
    type: [String], // Lijst met subtypes
    default: [], // Optioneel
  },
});

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
