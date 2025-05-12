// Importeer de express-router en de controller
const express = require("express");
const router = express.Router();
const cloudinaryController = require("../../../controllers/api/v1/cloudinary");

// Route voor het maken van een configuratie
router.post("/", cloudinaryController.create);

// Route voor het ophalen van alle configuraties
router.get("/", cloudinaryController.index);

// Route voor het ophalen van een specifieke configuratie op basis van ID
router.get("/:id", cloudinaryController.show);

// Route voor het bijwerken van een configuratie
router.put("/:id", cloudinaryController.update);

// Route voor het verwijderen van een configuratie
router.delete("/:id", cloudinaryController.destroy);

// Nieuwe route voor het uploaden van een mesh URL
router.post("/upload-mesh", cloudinaryController.uploadMesh);

module.exports = router;
