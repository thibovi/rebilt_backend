const mongoose = require("mongoose");

// ProductSchema
const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: false,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  description: {
    type: String,
    required: false,
  },
  brand: {
    type: String,
    required: false,
  },
  images: {
    type: [String],
    required: false,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Partner",
  },
  configurations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Configuration",
    },
  ],
  customConfigurations: [
    {
      fieldName: {
        type: String,
        required: true, // Naam van het configuratieveld, zoals kleur, maat, etc.
      },
      fieldType: {
        type: String,
        required: true, // Type van het veld (bijvoorbeeld Text, Dropdown, Color, etc.)
      },
      selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option", // Verwijzing naar een optie uit de 'Option' collectie
        required: false, // Dit kan null zijn als er geen optie geselecteerd is
      },
    },
  ],
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
