const express = require("express");
const router = express.Router();
const checkoutController = require("../../../controllers/api/v1/checkout");

router.post("/", checkoutController.create);
router.get("/", checkoutController.index);
router.get("/:id", checkoutController.show);
router.put("/:id", checkoutController.update);
router.delete("/:id", checkoutController.destroy);

module.exports = router;
