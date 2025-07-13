import React from 'react';
import '../Styles/BHome.css';

const DonationPreparation = () => {
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
        <h2>Preparing for Your Donation Day</h2>
        <p>Everything you need to know before giving the gift of life</p>
        <img
          src="https://cdn.who.int/media/images/default-source/headquarters/campaigns/world-blood-donor-day/2025/wbdd2025-give-hope-banner.tmb-1200v.jpg?sfvrsn=7f88dc2c_6"
          alt="Donation preparation"
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
            Blood donation is a noble act that saves lives. Preparing correctly for your donation ensures
            a safe and smooth experience for both you and the recipient.
          </p>

          <h3>Before Donation</h3>
          <ul>
            <li><strong>Eat a healthy meal:</strong> Avoid fatty foods as they can affect blood tests.</li>
            <li><strong>Stay hydrated:</strong> Drink plenty of water before your appointment.</li>
            <li><strong>Get plenty of sleep:</strong> Rest well the night before your donation.</li>
            <li><strong>Bring ID:</strong> Have a government-issued ID for verification.</li>
            <li><strong>Wear short sleeves:</strong> Or a shirt that can be rolled up for easier access to your arm.</li>
          </ul>

          <h3>During Donation</h3>
          <ul>
            <li>Relax and stay calm. The procedure is quick and safe.</li>
            <li>You’ll donate approximately 350–450 ml of blood.</li>
            <li>The actual blood draw takes around 10–15 minutes.</li>
          </ul>

          <h3>After Donation</h3>
          <ul>
            <li><strong>Rest:</strong> Sit in the donor area for 10–15 minutes post-donation.</li>
            <li><strong>Snacks:</strong> Have juice and light snacks to replenish energy.</li>
            <li><strong>Avoid lifting:</strong> Do not lift heavy objects with the donating arm for the rest of the day.</li>
            <li><strong>Stay hydrated:</strong> Continue drinking water throughout the day.</li>
            <li><strong>Monitor your body:</strong> If you feel dizzy or unwell, lie down and raise your feet.</li>
          </ul>

          <h3>Who Should Avoid Donating?</h3>
          <ul>
            <li>People under 18 or underweight as per donation standards.</li>
            <li>Those with infections, cold, flu, or low hemoglobin.</li>
            <li>People with specific medical conditions or medications (consult your doctor).</li>
          </ul>

          <h3>Conclusion</h3>
          <p>
            With the right preparation, your blood donation can be a smooth, safe, and deeply rewarding experience.
            Remember, every drop you give counts and could save a life.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 BloodLink | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default DonationPreparation;
