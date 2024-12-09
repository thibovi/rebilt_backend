const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  typeOfProduct: {
    type: String,
    required: true,
    enum: ["sneaker", "boot", "sandals", "formal", "slippers"],
    default: "sneaker",
  },
  description: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  colors: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
