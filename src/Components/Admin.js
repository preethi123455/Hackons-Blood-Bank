import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8000/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      alert("✅ Admin login successful");
      navigate("/admin");
    } catch (err) {
      setError("Server error. Try again.");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        <p className="muted">Sign in with your admin credentials.</p>

        {error && <div className="login-error">{error}</div>}

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">Login</button>
          </div>
        </form>
        <p className="forgot-text" onClick={() => navigate("/adminforgetpassword")}>
  Forgot Password?
</p>
      </div>
    </div>
  );
};

export default AdminLogin;
