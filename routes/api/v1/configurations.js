const express = require("express");
const router = express.Router();
const configurationController = require("../../../controllers/api/v1/configuration");

// Route voor het maken van een configuratie
router.post("/", configurationController.create);

// Route voor het ophalen van alle configuraties
router.get("/", configurationController.index);

// Route voor het ophalen van een specifieke configuratie op basis van ID
router.get("/:id", configurationController.show);

// Route voor het bijwerken van een configuratie
router.put("/:id", configurationController.update);

// Route voor het verwijderen van een configuratie
router.delete("/:id", configurationController.destroy);

module.exports = router;
