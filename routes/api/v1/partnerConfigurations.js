const express = require("express");
const router = express.Router();
const partnerConfigurationController = require("../../../controllers/api/v1/partnerConfiguration");

// Route voor het maken van een partner-configuratie
router.post("/", partnerConfigurationController.create);

// Route voor het ophalen van alle partner-configuraties
router.get("/", partnerConfigurationController.index);

// Route voor het ophalen van een specifieke partner-configuratie op basis van ID
router.get("/:id", partnerConfigurationController.show);

// Route voor het bijwerken van een partner-configuratie
router.put("/:id", partnerConfigurationController.update);

// Route voor het verwijderen van een partner-configuratie
router.delete("/:id", partnerConfigurationController.destroy);

module.exports = router;
