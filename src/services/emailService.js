const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==========================================
// Registration OTP
// ==========================================

const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"AI Campus Assistant" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "AI Campus Assistant - Email Verification OTP",
    text: `Your AI Campus Assistant verification OTP is ${otp}. This OTP is valid for 10 minutes. Do not share this OTP with anyone.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>AI Campus Assistant</h2>
        <p>Your email verification OTP is:</p>
        <h1 style="letter-spacing: 6px;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>Please do not share this OTP with anyone.</p>
      </div>
    `,
  });
};

// ==========================================
// Password Reset OTP
// ==========================================

const sendPasswordResetOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"AI Campus Assistant" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "AI Campus Assistant OTP",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  });
};

// ==========================================
// Exports
// ==========================================

module.exports = {
  sendOtpEmail,
  sendPasswordResetOtpEmail,
};