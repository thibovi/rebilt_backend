const express = require("express");
const router = express.Router();
const cloudinaryController = require("../../../controllers/api/v1/cloudinary");

// Route for searching models
router.get("/search", cloudinaryController.search);

// Route for creating a configuration
router.post("/", cloudinaryController.create);

// Route for retrieving all configurations
router.get("/", cloudinaryController.index);

// Route for retrieving a specific configuration by ID
router.get("/:id", cloudinaryController.show);

// Route for updating a configuration
router.put("/:id", cloudinaryController.update);

// Route for deleting a configuration
router.delete("/:id", cloudinaryController.destroy);

// Route for uploading a mesh URL
router.post("/upload-mesh", cloudinaryController.uploadMesh);

router.post("/upload-font", cloudinaryController.uploadFont);

module.exports = router;
