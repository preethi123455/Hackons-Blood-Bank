import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/ReceiverHomepage.css';
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
  const [bloodBanks, setBloodBanks] = useState([]);

  useEffect(() => {
    const fetchBloodBanks = async () => {
      try {
        const res = await axios.get('https://blood-qgas.onrender.com/fetch-all-bloodbanks');
        if (res.data.success) {
          setBloodBanks(res.data.bloodBanks);
        }
      } catch (err) {
        console.error('Error fetching blood banks:', err);
      }
    };

    fetchBloodBanks();
  }, []);

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
      <section style={{ padding: '2rem', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Registered Blood Banks</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {bloodBanks.map((bank) => (
            <div
              key={bank._id}
              style={{
                backgroundColor: '#fff',
                padding: '1rem',
                borderRadius: '10px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <h3 style={{ marginBottom: '0.5rem', color: '#d32f2f' }}>{bank.name}</h3>
              <p style={{ margin: '0.25rem 0' }}><strong>Location:</strong> {bank.location}</p>
              <p style={{ margin: '0.25rem 0' }}><strong>Email:</strong> {bank.email}</p>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Blood Availability:</strong>
                {bank.bloodAvailability.length > 0 ? (
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                    {bank.bloodAvailability.map((b, i) => (
                      <li key={i}>{b.bloodGroup} - {b.units} units</li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontStyle: 'italic', color: '#777' }}>No data available</p>
                )}
              </div>
            </div>
          ))}
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
