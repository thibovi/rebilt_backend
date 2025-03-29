const express = require("express");
const router = express.Router();
const imageController = require("../../../controllers/api/v1/imageController");

router.post("/", imageController.create);

module.exports = router;
