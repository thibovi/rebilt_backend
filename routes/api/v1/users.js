const express = require("express");
const router = express.Router();
const authController = require("../../../controllers/api/v1/auth");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/", authController.index);
router.get("/:id", authController.show);
router.put("/:id", authController.update);
router.delete("/:id", authController.destroy);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-code", authController.verifyCode);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
