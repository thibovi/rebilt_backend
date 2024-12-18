const express = require("express");
const router = express.Router();
const optionController = require("../../../controllers/api/v1/option");

// Route voor het maken van een optie
router.post("/", optionController.create);

// Route voor het ophalen van alle opties
router.get("/", optionController.index);

// Route voor het ophalen van een specifieke optie op basis van ID
router.get("/:id", optionController.show);

// Route voor het bijwerken van een optie
router.put("/:id", optionController.update);

// Route voor het verwijderen van een optie
router.delete("/:id", optionController.destroy);

module.exports = router;
