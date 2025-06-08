const express = require("express");
const router = express.Router();
const passport = require("passport");
const productController = require("../../../controllers/api/v1/product");

router.post("/", productController.create);
router.get("/", productController.index);
router.get("/:id", productController.show);
router.get("/code/:productCode", productController.findByCode);

router.put("/:id", productController.update);

router.delete("/:id", productController.destroy);
module.exports = router;
