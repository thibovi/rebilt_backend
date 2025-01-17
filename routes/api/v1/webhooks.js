const express = require("express");
const router = express.Router();
const webhookController = require("../../../controllers/api/v1/webhook");

router.post("/", webhookController.create);
router.get("/", webhookController.index);
router.get("/:id", webhookController.show);
router.put("/:id", webhookController.update);
router.delete("/:id", webhookController.destroy);

module.exports = router;
