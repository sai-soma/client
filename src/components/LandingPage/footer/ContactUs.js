import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactUs.css';
import { Home, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import map from './images/map.jpeg';

const ContactUs = () => {
  const navigate = useNavigate();

  return (
    <div className="CU-container">
      {/* Floating Home Button */}
      <button className="CU-home-btn" onClick={() => navigate('/')}>
        <Home size={18} /> Home
      </button>

      <motion.div
        className="CU-wrapper"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="CU-title">Contact Us</h1>
        <p className="CU-subtitle">
          We’d love to hear from you! Reach out using the information below.
        </p>

        <div className="CU-section">
          <div className="CU-item">
            <Mail className="CU-icon" />
            <strong>Email:</strong> contact@refernearn.com
          </div>
          <div className="CU-item">
            <Phone className="CU-icon" />
            <strong>Phone:</strong> +91-98765-43210
          </div>
          <div className="CU-item">
            <MapPin className="CU-icon" />
            <strong>Address:</strong> Q-4, A2, 10th Floor, Cyber Towers, Hitech City, Hyderabad, Telangana, India - 500081
          </div>
        </div>

        {/* Embedded Map Image */}
        <div className="CU-map-wrapper">
          <img
            src={map} alt="Map" 
            className="CU-map-img"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
