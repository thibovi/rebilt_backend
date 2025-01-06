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
  activeUnactive: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Partner",
  },
  configurations: [
    {
      configurationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Configuration",
        required: true,
      },
      selectedOption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Option",
        required: true,
      },
    },
  ],
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
