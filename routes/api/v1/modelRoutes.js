const express = require("express");
const router = express.Router();
const modelController = require("../../../controllers/api/v1/modelController");

router.post("/", modelController.create);

module.exports = router;
