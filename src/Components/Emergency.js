import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Emergency = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    bloodGroup: '',
    units: '',
    hospitalAddress: '',
    mobileNumber: '',
    place: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('http://localhost:8000/api/emergency-request', formData);
      setMessage(res.data.message || 'Emergency request sent successfully!');
      setFormData({
        recipientName: '',
        bloodGroup: '',
        units: '',
        hospitalAddress: '',
        mobileNumber: '',
        place: '',
      });
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to send emergency request.');
    } finally {
      setLoading(false);
    }
  };

  const [donors, setDonors] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/donors');
        setDonors(res.data.donors || []);
      } catch (err) {
        console.error('Failed to fetch donors:', err.message);
      }
    };
    fetchDonors();
  }, []);

  const bloodGroups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const uniqueLocations = [...new Set(donors.map(d => d.location))];

  const filteredDonors = donors.filter(donor => {
    if (!selectedGroup) return true;

    if (selectedGroup === 'A-'||selectedGroup === 'B-') {
      return [selectedGroup,'O-','O+'].includes(donor.bloodType);
    }
    if (selectedGroup === 'O-'){
      return [selectedGroup].includes(donor.bloodType);
    }
    if (selectedGroup === 'O+'){
      return [selectedGroup,'O-'].includes(donor.bloodType);
    }
    if (selectedGroup === 'A+'){
      return [selectedGroup,'O-','O+','A-'].includes(donor.bloodType);
    }
    if (selectedGroup === 'B+'){
      return [selectedGroup,'O-','O+','B-'].includes(donor.bloodType);
    }
    if (selectedGroup === 'AB+') {
      return [selectedGroup,'O-', 'O+','A+','A-','B+','B-','AB-'].includes(donor.bloodType);
    }
    if (selectedGroup === 'AB-') {
      return [selectedGroup,'O-','A-','B-'].includes(donor.bloodType);
    }

    return donor.bloodType === selectedGroup || donor.bloodType === 'O+';

  }).filter(donor => {
    return selectedLocation ? donor.location === selectedLocation : true;
  });

  const handleCall = async (phoneNumber) => {
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const response = await axios.post('http://localhost:12000/api/make-call', { phoneNumber: formattedPhone });
      alert(response.data.message || 'Calling...');
    } catch (err) {
      console.error('Error making call:', err.response?.data || err.message);
      alert('Failed to initiate call.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <h2 style={styles.heading}>🚨 Emergency Blood Request</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="recipientName"
            placeholder="Recipient Name"
            value={formData.recipientName}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="bloodGroup"
            placeholder="Blood Group (e.g. A+)"
            value={formData.bloodGroup}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="units"
            type="number"
            placeholder="Units of Blood Needed"
            value={formData.units}
            onChange={handleChange}
            min="1"
            required
            style={styles.input}
          />
          <input
            name="hospitalAddress"
            placeholder="Hospital / Receiving Address"
            value={formData.hospitalAddress}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            pattern="^\+?[0-9]{10,15}$"
            title="Please enter a valid phone number"
            required
            style={styles.input}
          />
          <input
            name="place"
            placeholder="Place (City/Area)"
            value={formData.place}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Sending...' : 'Send Emergency Request'}
          </button>

          {message && <p style={{ ...styles.message, color: 'green' }}>{message}</p>}
          {error && <p style={{ ...styles.message, color: 'red' }}>{error}</p>}
        </form>
      </div>

      <div style={styles.right}>
        <h2 style={styles.heading}>🩸 Available Donors</h2>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            style={styles.input}
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map((group, idx) => (
              <option key={idx} value={group}>
                {group}
              </option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            style={styles.input}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((loc, idx) => (
              <option key={idx} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.donorList}>
          {filteredDonors.length > 0 ? (
            filteredDonors.map((donor, index) => (
              <div key={index} style={styles.donorCard}>
                <p><strong>Name:</strong> {donor.name}</p>
                <p><strong>Blood Type:</strong> {donor.bloodType}</p>
                <p><strong>Location:</strong> {donor.location}</p>
                <p><strong>Phone:</strong> {donor.phone}</p>
                {/* Uncomment to enable calling */}
                {/* <button onClick={() => handleCall(donor.phone)} style={styles.callButton}>
                  Call Now
                </button> */}
              </div>
            ))
          ) : (
            <p>No donors found for selected filters.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
    padding: 30,
    justifyContent: 'center',
    backgroundColor: '#fefefe',
  },
  left: {
    flex: 1,
    maxWidth: 500,
    background: '#fff3f3',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  right: {
    flex: 1,
    maxWidth: 500,
    background: '#f3faff',
    padding: 20,
    borderRadius: 12,
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    height: 'fit-content',
  },
  heading: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#b30000',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    padding: 10,
    fontSize: 16,
    borderRadius: 6,
    border: '1px solid #ccc',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    background: '#b30000',
    color: '#fff',
    padding: 12,
    fontSize: 16,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  message: {
    marginTop: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  donorList: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  donorCard: {
    background: '#fff',
    padding: 12,
    borderRadius: 8,
    border: '1px solid #ddd',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  callButton: {
    background: '#007bff',
    color: '#fff',
    padding: '8px 16px',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    marginTop: 10,
  },
};

export default Emergency;
