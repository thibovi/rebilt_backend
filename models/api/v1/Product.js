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
  sizeOptions: {
    type: [String],
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  lacesColor: {
    type: [String],
    required: true,
  },
  lacesTexture: {
    type: [String],
    required: true,
  },
  soleBottomColor: {
    type: [String],
    required: true,
  },
  soleBottomTexture: {
    type: [String],
    required: true,
  },
  soleTopColor: {
    type: [String],
    required: true,
  },
  soleTopTexture: {
    type: [String],
    required: true,
  },
  insideColor: {
    type: [String],
    required: true,
  },
  insideTexture: {
    type: [String],
    required: true,
  },
  outside1Color: {
    type: [String],
    required: true,
  },
  outside1Texture: {
    type: [String],
    required: true,
  },
  outside2Color: {
    type: [String],
    required: true,
  },
  outside2Texture: {
    type: [String],
    required: true,
  },
  outside3Color: {
    type: [String],
    required: true,
  },
  outside3Texture: {
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
