const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderStatus: {
      type: String,
      default: "pending",
    },
    customer: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      address: {
        street: String,
        houseNumber: String,
        postalCode: String,
        city: String,
        country: String,
      },
      message: String,
    },
    orderConfig: {
      type: mongoose.Schema.Types.Mixed, // of een eigen schema als je wilt
      default: {},
    },
    // ...andere velden...
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
