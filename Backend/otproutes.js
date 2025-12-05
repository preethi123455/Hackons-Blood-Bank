// otpRoutes.js
const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

let generatedOTP = "";

// Gmail SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "praneesh582@gmail.com",
    pass: "lfqw qowx gfvt bpsq",
  },
});

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

  const mailOptions = {
    from: "praneesh582@gmail.com",
    to: email,
    subject: "Admin Login OTP",
    text: `Your OTP for admin login is: ${generatedOTP}`,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return res.json({ success: false, message: "Failed to send OTP", error: err });
    }
    return res.json({ success: true, message: "OTP sent successfully" });
  });
});

// Verify OTP
router.post("/verify-otp", (req, res) => {
  const { otp } = req.body;

  if (otp === generatedOTP) {
    generatedOTP = ""; // clear OTP
    return res.json({ success: true });
  }

  return res.json({ success: false, message: "Invalid OTP" });
});

module.exports = router;
