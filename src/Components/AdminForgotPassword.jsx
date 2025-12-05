import React, { useState } from "react";

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = otp, 3 = reset pass
  const [message, setMessage] = useState("");

  const sendOtp = async () => {
    const res = await fetch("http://localhost:8000/admin-forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (data.success) setStep(2);
  };

  const verifyOtp = async () => {
    const res = await fetch("http://localhost:8000/admin-verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    setMessage(data.message);
    if (data.success) setStep(3);
  };

  const resetPassword = async () => {
    const res = await fetch("http://localhost:8000/admin-reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2>Admin Password Reset</h2>
        <p>{message}</p>

        {step === 1 && (
          <>
            <input type="email" placeholder="Enter admin email"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <button onClick={sendOtp}>Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <input type="text" placeholder="Enter OTP"
              value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        )}

        {step === 3 && (
          <>
            <input type="password" placeholder="Enter new password"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={resetPassword}>Reset Password</button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminForgotPassword;
