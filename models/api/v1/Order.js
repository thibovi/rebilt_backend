const Order = require("../../../models/api/v1/Order");
const Product = require("../../../models/api/v1/Product");
const mongoose = require("mongoose");

const create = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    street,
    houseNumber,
    postalCode,
    city,
    country,
    message,
    orderConfig, // <-- volledige configuratie van de bestelling
    productId,
  } = req.body;

  // Valideer verplichte velden
  if (
    !productId ||
    !firstName ||
    !lastName ||
    !email ||
    !street ||
    !houseNumber ||
    !postalCode ||
    !city ||
    !country
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields.",
    });
  }

  // Valideer productId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({
      status: "error",
      message: "Invalid productId.",
    });
  }

  try {
    const newOrder = new Order({
      productId,
      orderStatus: "pending",
      customer: {
        firstName,
        lastName,
        email,
        phone,
        address: {
          street,
          houseNumber,
          postalCode,
          city,
          country,
        },
        message,
      },
      orderConfig,
    });

    await newOrder.save();

    res.status(201).json({
      status: "success",
      data: { order: newOrder },
    });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({
      status: "error",
      message: "Order could not be created.",
      error: err.message || err,
    });
  }
};

// ...existing code...

const index = async (req, res) => {
  try {
    const orders = await Order.find().populate("productId");
    res.json({
      status: "success",
      data: { orders },
    });
  } catch (err) {
    console.error("Error retrieving orders:", err);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve orders.",
      error: err.message || err,
    });
  }
};

const show = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid orderId.",
      });
    }
    const order = await Order.findById(orderId).populate("productId");
    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }
    res.json({
      status: "success",
      data: { order },
    });
  } catch (err) {
    console.error("Error retrieving order:", err);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve order.",
      error: err.message || err,
    });
  }
};

const update = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid orderId.",
      });
    }
    const updateData = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
    });
    if (!updatedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }
    res.json({
      status: "success",
      data: { order: updatedOrder },
    });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({
      status: "error",
      message: "Could not update order.",
      error: err.message || err,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid orderId.",
      });
    }
    const deletedOrder = await Order.findByIdAndDelete(orderId);
    if (!deletedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }
    res.json({
      status: "success",
      message: "Order deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({
      status: "error",
      message: "Could not delete order.",
      error: err.message || err,
    });
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
};
