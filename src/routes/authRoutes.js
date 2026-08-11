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

// Registration
router.post("/register", register);

// Resend verification OTP
router.post("/resend-verification-otp", resendVerificationOtp);

// Verify college email and set password
router.post("/verify-otp", verifyOtp);

// Login
router.post("/login", login);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;