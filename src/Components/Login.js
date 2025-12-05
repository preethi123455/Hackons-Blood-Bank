import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("⚠️ Email and password are required.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await axios.post("https://blood-qgas.onrender.com/login", {
        email,
        password,
      });

      const data = response.data;

      if (data.success) {
        const { userId, role } = data;

        localStorage.setItem("email", email);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userRole", role);

        console.log("✅ Login success. Role:", role);

        if (role === 'Donor(Individual)') {
          navigate('/donor-home');
        } else if (role === 'Donor(BloodBank)') {
          navigate('/bloodbank-home');
        } else if (role === 'Receiver') {
          navigate('/receiver-home');
        } else {
          setError("❌ Unknown user role. Please contact support.");
        }
      } else {
        setError(data.message || "❌ Login failed. Try again.");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Log In</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>

        <p>
          New user? <a href="/">Sign Up</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
