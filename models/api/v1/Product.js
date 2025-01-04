const mongoose = require("mongoose");

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
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      colors: {
        type: [String], // Array van kleuren als hex-codes
        required: false, // Niet verplicht, voor het geval een afbeelding geen kleuren heeft
      },
    },
  ],
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Partner",
  },
  configurations: [
    {
      configurationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Configuration", // Referentie naar Configuration collectie
        required: true,
      },
      selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option", // Verwijzing naar de geselecteerde optie
        required: true,
      },
    },
  ],
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
