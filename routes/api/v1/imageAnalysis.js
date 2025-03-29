// routes/api/v1/imageAnalysis.js
const express = require("express");
const router = express.Router();

// Controleer of het juiste pad en de juiste functie is geïmporteerd
const imageController = require("../../../controllers/api/v1/imageController"); // Zorg ervoor dat dit klopt

router.post("/", imageController.create); // Zorg ervoor dat de functie 'create' bestaat in je controller

module.exports = router;
