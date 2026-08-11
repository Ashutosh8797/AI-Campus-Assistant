const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const {
  sendOtpEmail,
  sendPasswordResetOtpEmail,
} = require("../services/emailService");

const COLLEGE_EMAIL_DOMAIN = "@kluniversity.in";

const getBatchYearFromStudentId = (studentId) => {
  const prefix = studentId.substring(0, 2);
  const year = Number(`20${prefix}`);

  if (!Number.isFinite(year)) {
    return null;
  }

  return year;
};

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================================
// REGISTER STUDENT
// =====================================================

const register = async (req, res) => {
  try {
    const { name, studentId, department } = req.body;

    if (!name || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Name and college ID are required",
      });
    }

    if (!/^\d{10}$/.test(studentId)) {
      return res.status(400).json({
        success: false,
        message: "College ID must contain exactly 10 digits",
      });
    }

    const email = `${studentId}${COLLEGE_EMAIL_DOMAIN}`;
    const batchYear = getBatchYearFromStudentId(studentId);

    if (!batchYear) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ studentId }, { email }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this college ID already exists",
      });
    }

    const otp = generateOtp();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const temporaryPassword = await bcrypt.hash(
      crypto.randomBytes(32).toString("hex"),
      12
    );

    const user = await User.create({
      name,
      email,
      password: temporaryPassword,
      studentId,
      department,
      batchYear,
      isVerified: false,
      otpHash,
      otpExpiresAt,
      role: "STUDENT",
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (emailError) {
      console.error("OTP email error:", emailError);

      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: "Could not send OTP to college email",
      });
    }

    return res.status(201).json({
      success: true,
      message: "OTP sent to your college email",
      userId: user._id,
      email,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// =====================================================
// RESEND VERIFICATION OTP
// =====================================================

const resendVerificationOtp = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "College ID is required",
      });
    }

    const user = await User.findOne({
      studentId,
      role: "STUDENT",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const otp = generateOtp();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailError) {
      console.error("Resend verification OTP email error:", emailError);

      user.otpHash = null;
      user.otpExpiresAt = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message: "Could not send verification OTP to college email",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification OTP sent to your college email",
      email: user.email,
    });
  } catch (error) {
    console.error("Resend verification OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resending verification OTP",
    });
  }
};

// =====================================================
// VERIFY OTP AND SET PASSWORD
// =====================================================

const verifyOtp = async (req, res) => {
  try {
    const { studentId, otp, password } = req.body;

    if (!studentId || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "College ID, OTP and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ studentId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP is not available",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (otpHash !== user.otpHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;

    await user.save();

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Account verified and password set successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        batchYear: user.batchYear,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

// =====================================================
// NORMAL LOGIN
// =====================================================

const login = async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({
        success: false,
        message: "College ID and password are required",
      });
    }

    const user = await User.findOne({ studentId });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid college ID or password",
      });
    }

    if (user.role === "STUDENT" && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your college email first",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid college ID or password",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        batchYear: user.batchYear,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

const forgotPassword = async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "College ID is required",
      });
    }

    const user = await User.findOne({
      studentId,
      role: "STUDENT",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your college email first",
      });
    }

    const otp = generateOtp();

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    try {
      await sendPasswordResetOtpEmail(user.email, otp);
    } catch (emailError) {
      console.error("Password reset email error:", emailError);

      user.otpHash = null;
      user.otpExpiresAt = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message: "Could not send password reset OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your college email",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while requesting password reset",
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { studentId, otp, newPassword } = req.body;

    if (!studentId || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "College ID, OTP and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      studentId,
      role: "STUDENT",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student account not found",
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Password reset OTP is not available",
      });
    }

    if (user.otpExpiresAt < new Date()) {
      user.otpHash = null;
      user.otpExpiresAt = null;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Password reset OTP has expired",
      });
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    if (otpHash !== user.otpHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid password reset OTP",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.otpHash = null;
    user.otpExpiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting password",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  register,
  resendVerificationOtp,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
};