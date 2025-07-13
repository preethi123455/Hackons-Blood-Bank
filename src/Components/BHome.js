import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Styles/BHome.css";

const BHome = () => {
  const [bloodData, setBloodData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await axios.get("http://localhost:8000/fetch-bloodbank", {
          params: { userId },
        });
        if (response.data.success) {
          const fetchedData = response.data.bloodAvailability;
          setBloodData(fetchedData.length > 0 ? fetchedData : getDefaultData());
        } else {
          setBloodData(getDefaultData());
        }
      } catch (err) {
        console.error("Error fetching stock:", err);
        setBloodData(getDefaultData());
      } finally {
        setLoading(false);
      }
    };
    fetchStock();
  }, [userId]);

  const getDefaultData = () => [
    { bloodGroup: "A+", units: 0 },
    { bloodGroup: "A-", units: 0 },
    { bloodGroup: "B+", units: 0 },
    { bloodGroup: "B-", units: 0 },
    { bloodGroup: "AB+", units: 0 },
    { bloodGroup: "AB-", units: 0 },
    { bloodGroup: "O+", units: 0 },
    { bloodGroup: "O-", units: 0 },
  ];

  const handleUnitsChange = (index, value) => {
    const updated = [...bloodData];
    updated[index].units = Math.max(0, parseInt(value || "0", 10));
    setBloodData(updated);
  };

  const adjustUnits = (index, delta) => {
    const updated = [...bloodData];
    updated[index].units = Math.max(0, updated[index].units + delta);
    setBloodData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = "Blood Bank - " + email.split("@")[0];

    const confirm1 = window.confirm("Are you sure you want to update the blood stock?");
    if (!confirm1) return;

    const confirm2 = window.confirm("This action will overwrite existing stock. Confirm again?");
    if (!confirm2) return;

    try {
      const response = await axios.post("http://localhost:8000/register-bloodbank", {
        name,
        bloodAvailability: bloodData,
        userId,
        email,
      });

      if (response.data.success) {
        setMessage("✅ Blood bank data updated successfully.");
      } else {
        setMessage("❌ Submission failed.");
      }
    } catch (error) {
      console.error("Error submitting blood bank:", error);
      setMessage("❌ Server error. Please try again.");
    }
  };

  return (
    <div className="bhome-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">🩸 BloodLink</div>
        <ul className="navbar-links">
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/donate")}>Donate</li>
          <li onClick={() => navigate("/learn")}>Learn</li>
          <li onClick={() => navigate("/contact")}>Contact</li>
        </ul>
      </nav>

      <div className="bhome-design">
        <h2 className="headline">
          Save Lives, <span className="highlight">Donate Blood</span>
        </h2>
        <p className="subtext">
          Join thousands of heroes who donate blood regularly. Your contribution can
          save up to three lives and make a lasting impact in your community.
        </p>
        <div className="button-group">
          <li onClick={() => navigate("/diffbb")}><button className="start-donating">Search Blood Banks →</button></li>
          <button className="learn-more">Learn More</button>
        </div>

        <div className="why-choose">
          <h3>Why Choose BloodLink?</h3>
          <div className="features">
            <div className="feature-card">
              <h4>🔒 Secure & Safe</h4>
              <p>Advanced security and screening protocols ensure complete safety.</p>
            </div>
            <div className="feature-card">
              <h4>🕒 24/7 Availability</h4>
              <p>Round-the-clock emergency support and supply.</p>
            </div>
            <div className="feature-card">
              <h4>✅ Certified Excellence</h4>
              <p>Accredited facilities with top medical standards.</p>
            </div>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">❤ 50K+<br />Lives Saved</div>
          <div className="stat-item">🧑‍🤝‍🧑 25K+<br />Active Donors</div>
          <div className="stat-item">🏥 500+<br />Partner Hospitals</div>
          <div className="stat-item">✔ 99.99%<br />Success Rate</div>
        </div>

        <div className="latest-articles">
          <h3>Latest Articles</h3>
          <div className="articles">
            <div className="article-card">
              <img src="/img1.png" alt="Science of Blood Donation" />
              <p>The Science Behind Blood Donation</p>
              <a href="#">Read More →</a>
            </div>
            <div className="article-card">
              <img src="/img2.png" alt="Blood Compatibility" />
              <p>Blood Type Compatibility Made Simple</p>
              <a href="#">Read More →</a>
            </div>
            <div className="article-card">
              <img src="/img3.png" alt="Donation Prep" />
              <p>Preparing for Your Donation Day</p>
              <a href="#">Read More →</a>
            </div>
          </div>
        </div>

        <h2 className="form-title">Manage Blood Bank Stock</h2>
        {loading ? (
          <p>Loading blood stock...</p>
        ) : (
          <form className="bhome-form" onSubmit={handleSubmit}>
            <h4>Current Availability</h4>
            <div className="blood-groups">
              {bloodData.map((blood, index) => (
                <div key={blood.bloodGroup} className="blood-row">
                  <label>{blood.bloodGroup}:</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => adjustUnits(index, -1)}
                      className="adjust-btn"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={blood.units}
                      onChange={(e) => handleUnitsChange(index, e.target.value)}
                      style={{ width: "60px", textAlign: "center" }}
                    />
                    <button
                      type="button"
                      onClick={() => adjustUnits(index, 1)}
                      className="adjust-btn"
                    >
                      +
                    </button>
                    <span style={{ marginLeft: "10px" }}>units</span>
                  </div>
                </div>
              ))}
            </div>
            <button type="submit">Update Stock</button>
            {message && <p className="status-msg">{message}</p>}
          </form>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#6200ea',
          borderRadius: '50%',
          width: '65px',
          height: '65px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          zIndex: 1000,
        }}
        title="Chat with BloodLink Assistant"
        onClick={() => navigate('/chatbot')}
      >
        <span style={{ fontSize: '30px', color: '#fff' }}>🤖</span>
      </div>

      <footer className="footer">
        <p>Developed by Team BloodLink © 2025</p>
        <p>
          <a href="mailto:support@bloodlink.org">Contact Us</a> | 
          <a href="https://www.bloodlink.org/privacy">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
};

export default BHome;