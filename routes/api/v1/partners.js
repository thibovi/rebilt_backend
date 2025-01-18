const express = require("express");
const router = express.Router();
const partnerController = require("../../../controllers/api/v1/partner");

// Route voor het maken van een partner
router.post("/", partnerController.create);

// Route voor het ophalen van alle partners
router.get("/", partnerController.index);

// Route voor het ophalen van partner op basis van naam
router.get("/partner/:partnerName", partnerController.findByName);

// Route voor het ophalen van partner op basis van ID
router.get("/:id", partnerController.show);

// Route voor het bijwerken van een partner
router.put("/:id", partnerController.update);

// Route voor het verwijderen van een partner
router.delete("/:id", partnerController.destroy);

module.exports = router;
