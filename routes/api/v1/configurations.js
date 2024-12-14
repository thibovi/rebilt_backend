const express = require("express");
const router = express.Router();
const configurationController = require("../../../controllers/api/v1/configuration");

router.post("/", configurationController.create);
router.get("/", configurationController.index);
router.get("/:id", configurationController.show);
router.put("/:id", configurationController.update);
router.delete("/:id", configurationController.destroy);

module.exports = router;
