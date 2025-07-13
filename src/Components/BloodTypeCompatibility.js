import React from 'react';
import '../Styles/BHome.css';

const BloodTypeCompatibility = () => {
  return (
    <div className="bhome-container">
      <nav className="navbar">
        <div className="logo">❤️ BloodLink</div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#blog">Blog</a></li>
          <li><a href="#register">Register</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <button className="cta-btn">Donate Now</button>
      </nav>

      <header className="blog-section">
        <h2>Blood Type Compatibility Made Simple</h2>
        <p>Understand who can donate to whom in a few easy steps</p>
        <img
          src="https://www.regenesys.net/reginsights/wp-content/uploads/2024/06/11-1.png"
          alt="Blood Type Compatibility"
          style={{
            width: '100%',
            maxWidth: '800px',
            height: 'auto',
            margin: '30px auto 0',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            display: 'block'
          }}
        />
      </header>

      <section className="register-section" style={{ background: '#fff' }}>
        <div style={{ maxWidth: "800px", margin: "auto", textAlign: "left" }}>
          <p>
            Knowing blood type compatibility is essential for safe transfusions. 
            Whether you’re a donor or recipient, understanding how blood types match can save lives.
          </p>

          <h3>The Basics of Blood Types</h3>
          <p>
            Blood types are determined by antigens on red blood cells. The main systems are:
          </p>
          <ul>
            <li><strong>A, B, AB, O</strong> – based on the type of antigen present</li>
            <li><strong>Rh Factor (+ or -)</strong> – presence or absence of Rh protein</li>
          </ul>

          <h3>Who Can Donate to Whom?</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Recipient</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Compatible Donors</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>O-</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>O-</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>O+</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>O-, O+</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>A+</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>A+, A-, O+, O-</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>B+</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>B+, B-, O+, O-</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>AB+</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>All blood types</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>AB-</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>A-, B-, AB-, O-</td>
              </tr>
            </tbody>
          </table>

          <h3>Universal Donors & Recipients</h3>
          <ul>
            <li><strong>O-</strong> is the universal donor (can donate to anyone)</li>
            <li><strong>AB+</strong> is the universal recipient (can receive from anyone)</li>
          </ul>

          <h3>Why Compatibility Matters</h3>
          <p>
            Incompatible transfusions can cause serious reactions, such as immune attacks and organ failure.
            This is why blood matching is a critical part of any transfusion process.
          </p>

          <h3>Conclusion</h3>
          <p>
            A basic understanding of blood type compatibility helps you become a smarter donor and a safer recipient.
            Knowing your type is the first step toward being a hero.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 BloodLink | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default BloodTypeCompatibility;
