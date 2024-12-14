const express = require("express");
const router = express.Router();
const configurationController = require("../../../controllers/api/v1/configuration");

// Routes for configurations
router.post("/", configurationController.create); // Create Configuration
router.get("/", configurationController.index); // Get all Configurations
router.get("/:id", configurationController.show); // Get a single Configuration by ID
router.put("/:id", configurationController.update); // Update Configuration
router.delete("/:id", configurationController.destroy); // Delete Configuration

module.exports = router;
