const express = require("express");
const router = express.Router();
const filterController = require("../../../controllers/api/v1/filter");

router.post("/", filterController.create);
router.get("/", filterController.index);
router.get("/:id", filterController.show);
router.put("/:id", filterController.update);
router.delete("/:id", filterController.destroy);

module.exports = router;
