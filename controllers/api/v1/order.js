const Order = require("../../../models/api/v1/Order");
const Product = require("../../../models/api/v1/Product");

const mongoose = require("mongoose");

const create = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    street,
    houseNumber,
    postalCode,
    city,
    country, // toegevoegd
    phone, // toegevoegd
    message,
    productId,
    productCode,
    orderConfig,
    // ...andere velden...
  } = req.body;

  // Zoek het product op basis van productId (MongoDB _id) of productCode
  let product = null;
  if (productId && mongoose.Types.ObjectId.isValid(productId)) {
    product = await Product.findById(productId);
  }
  if (!product && productCode) {
    product = await Product.findOne({ productCode });
  }
  if (!product) {
    return res.status(400).json({
      status: "error",
      message: "Product niet gevonden (productId of productCode).",
    });
  }

  // Valideer de verplichte velden
  if (
    !firstName ||
    !lastName ||
    !email ||
    !street ||
    !houseNumber ||
    !postalCode ||
    !city ||
    !country || // toegevoegd
    !phone // toegevoegd
    // ...andere verplichte velden...
  ) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields.",
    });
  }

  try {
    // Maak een nieuwe bestelling aan
    const newOrder = new Order({
      productId: product._id,
      orderStatus: "pending",
      customer: {
        firstName,
        lastName,
        email,
        phone, // toegevoegd
        address: {
          street,
          houseNumber,
          postalCode,
          city,
          country, // toegevoegd
        },
        message,
      },
      orderConfig: orderConfig,
      // ...andere velden...
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

const index = async (req, res) => {
  try {
    const { orderStatus, productId } = req.query; // Haal filters uit de queryparameters
    const filter = {};

    // Voeg filters toe als ze bestaan
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }
    if (productId) {
      filter.productId = productId;
    }

    // Zoek orders met de toegevoegde filters en populate productId
    const orders = await Order.find(filter).populate("productId");

    res.json({
      status: "success",
      data: { orders },
    });
  } catch (error) {
    console.error("Error retrieving orders:", error.message);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve orders",
      error: error.message,
    });
  }
};

const show = async (req, res) => {
  try {
    const { orderId } = req.params; // Verwacht orderId in de URL

    if (!orderId) {
      return res.status(400).json({
        status: "error",
        message: "Order ID is required to retrieve the order.",
      });
    }

    // Zoek de order met orderId en populate de productId
    const order = await Order.findById(orderId).populate("productId");

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("Error retrieving order:", error.message);
    res.status(500).json({
      status: "error",
      message: "Could not retrieve the order",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    // Alleen orderStatus verplicht maken
    if (!orderStatus) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields.",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found.",
      });
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("Error updating order:", error.message);
    res.status(500).json({
      status: "error",
      message: "Could not update the order.",
      error: error.message,
    });
  }
};

const destroy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Error deleting order",
      error: error.message,
    });
  }
};

const updatePaymentStatus = async (
  orderId,
  status,
  sessionId,
  paymentIntentId
) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) return null;
    order.paymentStatus = status;
    if (sessionId) order.stripeSessionId = sessionId;
    if (paymentIntentId) order.stripePaymentIntentId = paymentIntentId;
    await order.save();
    return order;
  } catch (err) {
    console.error("Error updating payment status:", err);
    return null;
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  destroy,
  updatePaymentStatus,
};
