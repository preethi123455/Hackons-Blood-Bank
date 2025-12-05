const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const nodemailer = require("nodemailer");

let otpStorage = {}; // temporary OTP store

// 🔹 Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin)
    return res.status(404).json({ success: false, message: "Admin not found" });

  const match = await bcrypt.compare(password, admin.password);
  if (!match)
    return res.status(401).json({ success: false, message: "Invalid credentials" });

  res.json({ success: true, message: "Admin Login Successful" });
});

// 🔹 Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email });

  if (!admin)
    return res.status(404).json({ success: false, message: "Admin not found" });

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage[email] = otp;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "obupreethig.23cse@kongu.edu",
      pass: "yapl lbak jons ihtg",
    },
  });

  await transporter.sendMail({
    from: "obupreethig.23cse@kongu.edu",
    to: admin.email,
    subject: "Admin Password Reset OTP",
    text: `Your OTP is ${otp}`,
  });

  res.json({ success: true, message: "OTP Sent" });
});

// 🔹 Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStorage[email] && otpStorage[email] == otp) {
    return res.json({ success: true, message: "OTP Verified" });
  }

  res.json({ success: false, message: "Invalid OTP" });
});

// 🔹 Reset Admin Password
router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  const hashed = await bcrypt.hash(newPassword, 10);

  await Admin.findOneAndUpdate({ email }, { password: hashed });

  res.json({ success: true, message: "Password Updated Successfully" });
});

module.exports = router;
