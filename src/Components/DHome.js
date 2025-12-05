import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/DHome.css';

const BloodLinkHome = () => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    // aadhar will be handled separately as base64
    bloodType: '',
    phone: '',
    age: '',
    gender: '',
    weight: '',
    lastDonation: '',
    email: '',
    medicalConditions: ''
  });

  const [aadharBase64, setAadharBase64] = useState('');
  const [aadharType, setAadharType] = useState('');
  const [aadharName, setAadharName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // handle aadhar file separately: convert to base64
    if (name === "aadhar" && files && files[0]) {
      const file = files[0];
      setAadharType(file.type);
      setAadharName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result is data:<type>;base64,<data>
        const base64Data = reader.result.split(',')[1];
        setAadharBase64(base64Data);
      };
      reader.readAsDataURL(file);
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Basic validation
      if (!formData.name || !formData.location || !formData.bloodType || !formData.phone || !formData.age || !formData.gender || !formData.weight || !formData.email) {
        alert("Please fill required fields.");
        return;
      }

      const dataToSend = {
        name: formData.name,
        location: formData.location,
        aadharBase64: aadharBase64 || null,
        aadharType: aadharType || null,
        aadharName: aadharName || null,
        bloodType: formData.bloodType,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        weight: Number(formData.weight),
        lastDonation: formData.lastDonation || null,
        email: formData.email,
        medicalConditions: formData.medicalConditions || ""
      };

      await axios.post('http://localhost:8000/api/donors-pending', dataToSend);
      alert('✅ Donor request submitted for admin approval!');
      // reset
      setFormData({
        name: '',
        location: '',
        bloodType: '',
        phone: '',
        age: '',
        gender: '',
        weight: '',
        lastDonation: '',
        email: '',
        medicalConditions: ''
      });
      setAadharBase64('');
      setAadharType('');
      setAadharName('');
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
            <span className="close-btn" onClick={() => setShowForm(false)}>×</span>
            <h2>Register as a Donor ❤️</h2>
            <p>Kindly fill in the form to become a lifesaver.</p>

            <form className="donor-form" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
              </div>

              {/* Location */}
              <div className="form-group">
                <label>Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="Enter your city" />
              </div>

              {/* Aadhaar Proof */}
              <div className="form-group">
                <label>Aadhaar Proof (PDF/Image)</label>
                <input type="file" name="aadhar" accept=".pdf, image/*" onChange={handleChange} />
                {aadharName && <small>Selected: {aadharName}</small>}
              </div>

              {/* Age */}
              <div className="form-group">
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required min="18" max="65" placeholder="Enter your age" />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Weight */}
              <div className="form-group">
                <label>Weight (kg)</label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} required min="45" placeholder="Enter weight in kg" />
              </div>

              {/* Blood Type */}
              <div className="form-group">
                <label>Blood Type</label>
                <select name="bloodType" value={formData.bloodType} onChange={handleChange} required>
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

              {/* Phone */}
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required pattern="[0-9]{10}" placeholder="Enter 10-digit phone number" />
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" />
              </div>

              {/* Last Donation */}
              <div className="form-group">
                <label>Last Donation Date</label>
                <input type="date" name="lastDonation" value={formData.lastDonation} onChange={handleChange} />
              </div>

              {/* Medical Conditions */}
              <div className="form-group">
                <label>Medical Conditions (if any)</label>
                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="Mention health issues if any"></textarea>
              </div>

              <button type="submit" className="submit-btn">Submit</button>
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
