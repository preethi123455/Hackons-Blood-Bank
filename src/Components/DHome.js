import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/DHome.css';

const BloodLinkHome = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    aadhar: null,
    bloodType: '',
    phone: '',
  });

  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        name: formData.name,
        location: formData.location,
        aadhar: formData.aadhar ? formData.aadhar.name : 'N/A',
        bloodType: formData.bloodType,
        phone: formData.phone,
      };

      const response = await axios.post('http://localhost:8000/api/donors', dataToSend);
      alert('✅ Form submitted successfully!');
      console.log(response.data);

      setFormData({
        name: '',
        location: '',
        aadhar: null,
        bloodType: '',
        phone: '',
      });
      setShowForm(false);
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('Submission failed. Check console.');
    }
  };

  return (
    <div className="bloodlink-container">
      <nav className="navbar">
        <div className="logo">❤️ BloodLink</div>
      </nav>

      <section className="hero">
        <div className="hero-text">
          <h1>
            Be a Hero, <span className="highlight">Donate Blood</span>
          </h1>
          <p>
            Your donation can save up to <strong>3 lives</strong>. Join our community of heroes and
            make a difference today.
          </p>
          <div className="hero-buttons">
            <button className="register-btn" onClick={() => setShowForm(true)}>
              Register as Donor
            </button>
            <button className="outline-btn" onClick={() => navigate('/bankdetails')}>
              Find Blood Bank
            </button>
          </div>
        </div>
        <div className="hero-img">
          <div className="heart-icon">❤️</div>
        </div>
      </section>

      <section className="stats">
        <div><h3>4.5M+</h3><p>Lives Saved</p></div>
        <div><h3>10K+</h3><p>Active Donors</p></div>
        <div><h3>24/7</h3><p>Emergency Access</p></div>
        <div><h3>100%</h3><p>Safe & Verified</p></div>
      </section>

      <section className="why-donate">
        <h2>Why Donate Blood?</h2>
        <p>Blood donation is a simple act of kindness that goes a long way.</p>
        <div className="reasons">
          <div>
            <h4>💉 Health Check-up</h4>
            <p>Free health screening before every donation.</p>
          </div>
          <div>
            <h4>❤️ Save Lives</h4>
            <p>Each donation can save up to 3 lives.</p>
          </div>
          <div>
            <h4>🧬 Health Benefits</h4>
            <p>Helps reduce iron overload & supports blood flow.</p>
          </div>
          <div>
            <h4>🌍 Community Impact</h4>
            <p>Be a role model and help your society.</p>
          </div>
        </div>
      </section>

      <section className="facts">
        <h2>Did You Know?</h2>
        <div className="facts-grid">
          <p>🩸 Every 2 seconds, someone needs blood.</p>
          <p>🧍 Only 3% of eligible people donate.</p>
          <p>🚫 Blood can't be manufactured.</p>
          <p>🧪 One pint saves 3 lives.</p>
          <p>⏱ Platelets last 5 days.</p>
          <p>📦 Red cells last 42 days.</p>
        </div>
      </section>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={() => setShowForm(false)}>
              ×
            </span>
            <h2>Register as a Donor ❤️</h2>
            <p>Kindly fill in the form to become a lifesaver.</p>

            <form className="donor-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter your city"
                />
              </div>

              <div className="form-group">
                <label>Aadhaar Proof (PDF/Image)</label>
                <input
                  type="file"
                  name="aadhar"
                  accept=".pdf, image/*"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Blood Type</label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your blood type</option>
                  <option value="A+">A+</option>
                  <option value="A-">A−</option>
                  <option value="B+">B+</option>
                  <option value="B-">B−</option>
                  <option value="O+">O+</option>
                  <option value="O-">O−</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB−</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <button type="submit" className="submit-btn">
                Submit
              </button>
            </form>
          </div>
        </div>
      )}

      <div
        className="chatbot-icon"
        title="Chat with BloodLink Assistant"
        onClick={() => navigate('/chatbot')}
      >
        <span role="img" aria-label="Chatbot">🤖</span>
      </div>
    </div>
  );
};

export default BloodLinkHome;
