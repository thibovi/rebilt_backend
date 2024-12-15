const express = require("express");
const router = express.Router();
const houseStyleController = require("../../../controllers/api/v1/houseStyle");

router.post("/", houseStyleController.create);
router.get("/", houseStyleController.index);
router.get("/:userId", houseStyleController.show);
router.put("/:userId", houseStyleController.update);
router.delete("/:userId", houseStyleController.destroy);

module.exports = router;
