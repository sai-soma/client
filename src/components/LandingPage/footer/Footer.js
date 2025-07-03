import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <footer className="footer-container">
      <hr /><br />
      <div className="footer-content" id="contact-us">
        {/* Left Section: Brand Info */}
        <div className="footer-brand">
          <h2 className="footer-highlight">REFER & EARN</h2><br />
          <p>Your dream job is just an application away – Apply, Refer, Earn!</p>
        </div>

        {/* Middle Section: Product Links */}
        <div className="footer-section">
          <h3>Product</h3>
          <ul>
            <li onClick={handleNavigateToLogin}>Find Job</li>
            <li onClick={handleNavigateToLogin}>Find Company</li>
            <li onClick={handleNavigateToLogin}>Find Employee</li>
          </ul>
        </div>

        {/* Right Section: Company Info */}
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li><Link to="/about-us" style={{ textDecoration: 'none' }}>About Us</Link></li>
            <li><Link to="/contact-us" style={{ textDecoration: 'none' }}>Contact Us</Link></li>
            <li><Link to="/privacy-policy" style={{ textDecoration: 'none' }}>Privacy Policy</Link></li>
            <li><Link to="/terms-and-conditions" style={{ textDecoration: 'none' }}>Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Support Section */}
        <div className="footer-section">
          <h3>Support</h3>
          <ul>
            <li><Link to="/help-support" style={{ textDecoration: 'none' }}>Help & Support</Link></li>
            <li><Link to="/feedback" style={{ textDecoration: 'none' }}>Feedback</Link></li>
            <li><Link to="/faqs" style={{ textDecoration: 'none' }}>FAQs</Link></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <hr />
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Refer & Earn. All rights reserved. <br />
          Developed by <strong>Lyros Technologies Pvt. Ltd.</strong> | Designed by <strong>Lyros Developers</strong>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
