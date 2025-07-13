import React from 'react';
import '../Styles/BHome.css';

const ScienceArticle = () => {
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
        <h2>The Science Behind Blood Donation</h2>
        <p>Discover how your blood donation makes a difference at the cellular level</p>
        <img
          src="https://png.pngtree.com/thumb_back/fh260/background/20190221/ourmid/pngtree-public-welfare-blood-donation-volunteer-rescue-image_11578.jpg"
          alt="Blood donation science"
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
            Blood donation is not just a noble act — it’s a biological necessity for saving lives. 
            Every two seconds, someone needs blood for surgeries, trauma care, cancer treatments, and more.
          </p>

          <h3>What Happens During Donation?</h3>
          <p>
            When you donate blood, approximately 350-450 ml of blood is collected. This blood is then separated into:
          </p>
          <ul>
            <li><strong>Red Blood Cells</strong> – carry oxygen, used for anemia and surgery patients.</li>
            <li><strong>Platelets</strong> – help blood clot, crucial for cancer and trauma patients.</li>
            <li><strong>Plasma</strong> – the liquid portion, used for burn and shock treatments.</li>
          </ul>

          <h3>Your Body’s Amazing Regeneration</h3>
          <p>
            After donating, your body begins replenishing lost fluids within 24 hours. Red cells regenerate in about 4-6 weeks.
            This natural recovery makes regular donation possible every 3 months (for men) and every 4 months (for women).
          </p>

          <h3>Benefits for Donors</h3>
          <ul>
            <li>Free mini health check-up (pulse, BP, hemoglobin).</li>
            <li>Reduces risk of hemochromatosis (iron overload).</li>
            <li>Psychological boost — you're saving lives!</li>
          </ul>

          <h3>Conclusion</h3>
          <p>
            Blood donation is a simple, safe, and selfless act that supports complex medical care. 
            With every unit donated, you become a silent hero in someone’s recovery story.
          </p>
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 BloodLink | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default ScienceArticle;
