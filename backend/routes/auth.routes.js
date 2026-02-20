const express = require("express");
const {
  login,
  logout,
  me,
  requestPasswordReset,
  confirmPasswordReset,
  sendPhoneOtp,
  signup,
  verifyPhoneOtp,
} = require("../controllers/auth.controller");
const { optionalAuth, requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/password/reset/request", requestPasswordReset);
router.post("/password/reset/confirm", confirmPasswordReset);
router.post("/login/otp/send", sendPhoneOtp);
router.post("/login/otp/verify", verifyPhoneOtp);
router.get("/me", requireAuth, me);
router.post("/logout", optionalAuth, logout);

module.exports = router;
