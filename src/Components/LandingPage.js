import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/LandingPage.css';

const images = [
  '/images/blood1.jpg',
  '/images/blood2.jpg',
  '/images/blood3.jpg',
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAdminLogin = () => {
    navigate('/admin');
  };

  return (
    <div className="landing-container">
      <div className="home-icon" onClick={handleAdminLogin} title="Admin Login">
        🏠
      </div>

      <div className="fade-carousel">
        {images.map((src, index) => (
          <div
            key={index}
            className={`fade-slide ${index === current ? 'active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          ></div>
        ))}

        <div className="overlay">
          <h1>Welcome to <span>BloodLink</span></h1>
          <p>Connecting donors with lives in need</p>
          <button className="get-started-btn" onClick={() => navigate('/signup')}>
            Get Started →
          </button>
          <button className="emergency-btn" onClick={() => navigate('/emergency')}>
            Emergency?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
