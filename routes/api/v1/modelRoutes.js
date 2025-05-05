const express = require("express");
const router = express.Router();
const modelController = require("../../../controllers/api/v1/modelController");

// POST: Maak een nieuw 3D-model
router.post("/", modelController.create);

// GET: Haal details van een 3D-model op met een specifiek taskId
router.get("/:id", modelController.show);

module.exports = router;
