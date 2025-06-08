const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    orderStatus: { type: String, default: "pending" },
    paymentStatus: { type: String, default: "unpaid" }, // Stripe: unpaid, paid, failed
    stripeSessionId: { type: String }, // Stripe Checkout Session ID
    stripePaymentIntentId: { type: String }, // Stripe PaymentIntent ID
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
