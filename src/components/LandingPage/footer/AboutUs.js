import React, { useEffect } from 'react';
import './AboutUs.css';
import missionImg from './images/mission.png';
import visionImg from './images/vision.jpg';
import rewardImg from './images/Reward.jpg';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const AboutUs = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-us">
      {/* Floating Top-Left Home Button */}
      <button className="aboutus-home-btn" onClick={() => navigate('/')}>
        <Home size={18} /> Home
      </button>

      <div className="hero-section">
        <h1>About Us</h1>
        <p>
          Empowering your network, rewarding your referrals. Join us in transforming the hiring landscape.
        </p>
      </div>

      {/* --- rest of your content unchanged --- */}

      <div className="section">
        <h2>Our Mission</h2>
        <div className="content">
          <img src={missionImg} alt="Mission" />
          <p>
            At Refer & Earn, we aim to democratize job referrals by making them accessible to all. Anyone—students, freelancers, or professionals—can refer candidates and earn rewards. Our platform offers transparent tracking, fair payouts, and a 90-day retention model to ensure genuine placements. We’re building a trusted, people-powered hiring system where effort is rewarded and opportunities are shared.
          </p>
        </div>
      </div>

      <div className="section reverse">
        <h2>Our Vision</h2>
        <div className="content">
          <img src={visionImg} alt="Vision" />
          <p>
            We envision a world where job opportunities are accessible to all, and referrals drive fair employment across communities. By combining personal connections with technology, we simplify hiring for employers and empower individuals to participate. Our platform promotes transparency, rewards meaningful referrals, and supports job seekers—creating a collaborative, trusted ecosystem where talent thrives, and everyone benefits from shared success.
          </p>
        </div>
      </div>

      <div className="section">
        <h2>Why Choose Us?</h2>
        <ul className="features-list">
          <li>✅ Free & open access for all users</li>
          <li>✅ Transparent referral & reward tracking</li>
          <li>✅ Secure wallet & payout system</li>
          <li>✅ Scalable system for growing job needs</li>
          <li>✅ Active engagement & real-time updates</li>
        </ul>
      </div>

      <div className="section">
        <h2>Rewards That Matter</h2>
        <div className="content">
          <img src={rewardImg} alt="Rewards" />
          <p>
            We believe in rewarding genuine effort. Referrers earn commissions only after successful, sustained placements, supported by our 90-day retention model. This ensures trust and protects employers from short-term attrition. Our transparent wallet system gives users full visibility into their earnings. By aligning payouts with real impact, we foster a community built on accountability, fairness, and shared success for referrers, candidates, and employers alike.
          </p>
        </div>
      </div>

      <div className="footer-quote">
        <p>“Refer someone. Change a life. Earn rewards.”</p>
      </div>
    </div>
  );
};

export default AboutUs;
