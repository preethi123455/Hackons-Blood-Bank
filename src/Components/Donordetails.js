import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/DHome.css';

const DonorDetails = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await axios.get('https://blood-qgas.onrender.com/api/donors');
        setDonors(response.data.donors || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch donor details');
        console.error('❌ Fetch error:', err.message);
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  return (
    <div className="donor-details-container">
      <h1>🩸 Registered Donors</h1>

      {loading && <p>Loading donors...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && donors.length === 0 && <p>No donors found.</p>}

      <div className="donor-grid">
        {donors.map((donor) => (
          <div key={donor._id} className="donor-card">
            <h3>{donor.name}</h3>
            <p><strong>Location:</strong> {donor.location}</p>
            <p><strong>Blood Type:</strong> {donor.bloodType}</p>
            <p><strong>Phone:</strong> {donor.phone}</p>
            <p><strong>Aadhaar:</strong> {donor.aadhar}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorDetails;
