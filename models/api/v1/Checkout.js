const mongoose = require("mongoose");

const CheckoutSchema = new mongoose.Schema({
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
  },
  items: [
    {
      productId: {
        type: String, // <-- maak dit een String!
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "paypal", "bank_transfer", "cash"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Checkout = mongoose.model("Checkout", CheckoutSchema);
module.exports = Checkout;
