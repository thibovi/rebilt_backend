const express = require("express");
const router = express.Router();
const orderPaymentController = require("../../../controllers/api/v1/orderPayment");

router.post("/", orderPaymentController.create);
router.get("/", orderPaymentController.index);
router.get("/:id", orderPaymentController.show);
router.put("/:id", orderPaymentController.update);
router.delete("/:id", orderPaymentController.destroy);

module.exports = router;
