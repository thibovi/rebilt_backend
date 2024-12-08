const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    lacesColor: { type: String, required: false },
    lacesTexture: { type: String, required: false },
    soleBottomColor: { type: String, required: false },
    soleBottomTexture: { type: String, required: false },
    soleTopColor: { type: String, required: false },
    soleTopTexture: { type: String, required: false },
    insideColor: { type: String, required: false },
    insideTexture: { type: String, required: false },
    outside1Color: { type: String, required: false },
    outside1Texture: { type: String, required: false },
    outside2Color: { type: String, required: false },
    outside2Texture: { type: String, required: false },
    outside3Color: { type: String, required: false },
    outside3Texture: { type: String, required: false },
    orderStatus: { type: String, default: "pending" },
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      address: {
        street: { type: String, required: true },
        houseNumber: { type: String, required: true },
        postalCode: { type: String, required: true },
        city: { type: String, required: true },
      },
      message: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
