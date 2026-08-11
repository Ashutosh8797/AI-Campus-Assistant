const express = require("express");

const {
  register,
  resendVerificationOtp,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);

router.post("/resend-verification-otp", resendVerificationOtp);

router.post("/verify-otp", verifyOtp);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

module.exports = router;