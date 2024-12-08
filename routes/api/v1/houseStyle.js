const express = require("express");
const router = express.Router();
const houseStyleController = require("../../../controllers/api/v1/houseStyle");

// Route voor het aanmaken van een huisstijl
router.post("/", houseStyleController.create);

// Route voor het ophalen van alle huisstijlen
router.get("/", houseStyleController.index);

// Route voor het ophalen van een specifieke huisstijl op basis van ID
router.get("/:userId", houseStyleController.show);

// Route voor het bijwerken van een specifieke huisstijl op basis van ID
router.put("/:userId", houseStyleController.update);

// Route voor het verwijderen van een specifieke huisstijl op basis van ID
router.delete("/:id", houseStyleController.destroy);

module.exports = router;
