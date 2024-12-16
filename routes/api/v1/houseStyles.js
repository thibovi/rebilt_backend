const express = require("express");
const router = express.Router();
const houseStyleController = require("../../../controllers/api/v1/houseStyle");

// POST, GET, PUT, DELETE routes met partnerId in plaats van userId
router.post("/", houseStyleController.create);
router.get("/", houseStyleController.index);
router.get("/:partnerId", houseStyleController.show); // Verander userId naar partnerId
router.put("/:partnerId", houseStyleController.update); // Verander userId naar partnerId
router.delete("/:partnerId", houseStyleController.destroy); // Verander userId naar partnerId

module.exports = router;
