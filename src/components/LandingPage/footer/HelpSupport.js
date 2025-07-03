import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HelpSupport.css';
import { Mail, Phone, Clock, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const HelpSupport = () => {
  const navigate = useNavigate();

  return (
    <div className="hs-container">
      {/* Floating Home Button */}
      <button className="hs-home-btn" onClick={() => navigate('/')}>
        <Home size={18} /> Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="hs-card"
      >
        <h1 className="hs-title">Help & Support</h1>
        <p className="hs-subtitle">Need help? We're here for you.</p>

        <ul className="hs-list">
          <li>
            <Mail className="hs-icon" size={20} />
            Email: <a href="mailto:support@refernearn.com">support@refernearn.com</a>
          </li>
          <li>
            <Phone className="hs-icon" size={20} />
            Phone: <a href="tel:+919999988888">+91-99999-88888</a>
          </li>
          <li>
            <Clock className="hs-icon" size={20} />
            Support Hours: Mon - Fri, 9 AM – 6 PM
          </li>
        </ul>

        <p className="hs-note">
          Please include your <strong>User ID</strong> in support queries for faster assistance.
        </p>
      </motion.div>
    </div>
  );
};

export default HelpSupport;
