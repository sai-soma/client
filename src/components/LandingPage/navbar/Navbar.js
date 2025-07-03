import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";
import { FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-text">Refer & Earn</div>
      <div className={`navbar-links ${isMobileMenuOpen ? "active" : ""}`}>
        <ul>
            <li><Link to="/about-us" style={{ color: "white", textDecoration: "none" }}>About Us</Link></li>

            <li><Link to="/contact-us" style={{ color: "white", textDecoration: 'none' }}>Contact Us</Link></li>
          <li onClick={() => handleScrollToSection("how-it-works")}>How It Works</li>
          <li onClick={handleNavigateToLogin}>Find Job</li>
         
        </ul>
      </div>

      <div className="navbar-actions">
        <button className="navbar-login-btn" onClick={handleNavigateToLogin}>
          Login
        </button>
      </div>

      <div className="navbar-toggle-icon" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes size={30} /> : <FaBars size={30} />}
      </div>
    </div>
  );
};

export default Navbar;
