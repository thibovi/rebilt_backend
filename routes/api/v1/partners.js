const express = require("express");
const router = express.Router();
const partnerController = require("../../../controllers/api/v1/partner");

router.post("/", partnerController.create);
router.get("/", partnerController.index);
router.get("/:id", partnerController.show);
router.put("/:id", partnerController.update);
router.delete("/:id", partnerController.destroy);

module.exports = router;
