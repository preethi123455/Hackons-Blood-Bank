import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/DHome.css';
import axios from 'axios';

const ReceiverHomepage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bloodType: '',
    hospital: '',
    contactNumber: '',
    location: '',
    urgencyLevel: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, age, bloodType, hospital, contactNumber, location, urgencyLevel } = formData;
    return name && age && bloodType && hospital && contactNumber && location && urgencyLevel;
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/request-blood', formData);
      alert(res.data.message || 'Request submitted successfully!');
      setFormData({
        name: '',
        age: '',
        bloodType: '',
        hospital: '',
        contactNumber: '',
        location: '',
        urgencyLevel: '',
      });
    } catch (err) {
      console.error('Error submitting request:', err);
      alert(err.response?.data?.message || 'Failed to submit blood request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="receiver-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">RECEIVER</h1>

        </div>
        <div className="hero-image">
          <div className="blood-drop-icon">🩸</div>
        </div>
      </section>

      <section className="blood-types-section">
        <div className="section-header">
          <h2>BLOOD TYPES NEEDED</h2>
          <div className="header-underline"></div>
        </div>
        <div className="blood-content">
          <div className="blood-info">
            <p className="blood-description">
              Many variables can impact our blood inventories such as weather, holidays or tragic events.
              Every day, patients who need blood are in crisis and <strong>you can help</strong> by volunteering to donate.
              Less than 10% of the population gives blood, so regular donors are crucial.
            </p>
            
          </div>
          <div className="blood-types-grid">
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((type) => (
              <div key={type} className="blood-bag">
                <div className="bag-icon">{type}</div>
                <div className="urgency-indicator"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="quick-actions-section">
        <div className="section-header">
          <h2>QUICK ACTIONS</h2>
          <div className="header-underline"></div>
        </div>
        <div className="actions-grid">
          <div className="action-card primary" onClick={() => navigate('/request-blood')}>
            <div className="card-icon">🆘</div>
            <h3>Request Blood</h3>
            <p>Submit a new blood request and get immediate response from donors.</p>
            <div className="card-arrow">→</div>
          </div>
          <div className="action-card" onClick={() => navigate('/matchdonors')}>
            <div className="card-icon">🔍</div>
            <h3>Matching Donors</h3>
            <p>Find the best matches based on availability and location.</p>
            <div className="card-arrow">→</div>
          </div>
          <div className="action-card" onClick={() => navigate('/history')}>
            <div className="card-icon">📋</div>
            <h3>Request History</h3>
            <p>View your previous blood requests and statuses.</p>
            <div className="card-arrow">→</div>
          </div>
          {/*<div className="action-card" onClick={() => navigate('/bankdetails')}>
            <div className="card-icon">🩸</div>
            <h3>Find BloodBank</h3>
            <p>Find Donators[BloodBanks]</p>
            <div className="card-arrow">→</div>
          </div>*/}
          <div className="action-card" onClick={() => navigate('/donordetails')}>
            <div className="card-icon">🩸</div>
            <h3>Find Donors(individual)</h3>
            <p>Find Donors?</p>
            <div className="card-arrow">→</div>
          </div>
        </div>
      </section>
      <section className="emergency-banner">
        <div className="banner-content">
          <div className="banner-icon">🚨</div>
          <div className="banner-text">
            <h3>Emergency Blood Request</h3>
            <p>Need blood urgently? Our emergency response team is available 24/7.</p>
          </div>
          <button className="emergency-button" onClick={() => navigate('/emergency')}>
            Emergency Request
          </button>
        </div>
      </section>

      

      <footer className="receiver-footer">
        <div className="footer-content">
          <div className="footer-links">
            <span>© 2025 BloodBank Platform</span>
            <a href="/help">Help</a>
            <a href="/logout">Logout</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReceiverHomepage;
