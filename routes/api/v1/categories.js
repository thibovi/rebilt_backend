const express = require("express");
const router = express.Router();
const categoryController = require("../../../controllers/api/v1/category");

router.post("/", categoryController.create);
router.get("/", categoryController.index);
router.get("/:id", categoryController.show);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.destroy);

module.exports = router;
