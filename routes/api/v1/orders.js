const express = require("express");
const router = express.Router();
const orderController = require("../../../controllers/api/v1/order");
const orderPaymentController = require("../../../controllers/api/v1/orderPayment"); // Voeg deze regel toe

// Define your POST route
router.post("/", orderController.create);

// Route voor Stripe betaling van een order
router.post("/:orderId/pay", orderPaymentController.create); // <-- NIEUW

// Similarly, define other routes like GET, PUT, DELETE
router.get("/", orderController.index);
router.get("/:orderId", orderController.show);
router.put("/:orderId", orderController.update);
router.delete("/:orderId", orderController.destroy);

module.exports = router;
