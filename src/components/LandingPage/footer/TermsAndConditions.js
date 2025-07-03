import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsAndConditions.css';
import { FileText, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="tc-container">
      {/* Floating Top-Left Back Button */}
      <button className="tc-back-btn" onClick={() => navigate('/')}>
        <Home size={18} /> Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="tc-wrapper"
      >
        <h1 className="tc-title">
          <FileText className="tc-icon" /> Terms & Conditions
        </h1>

        <p className="tc-text">
          Welcome to <strong>Refer & Earn</strong>. By accessing or using our platform, you agree to comply with and be bound by the following Terms & Conditions. Please read them carefully.
        </p>

        <div className="tc-section">
          <h2>1. Eligibility</h2>
          <ul>
            <li>Users must be at least 18 years old to register and participate in referral activities.</li>
            <li>By registering, you confirm that you meet the age requirement and are legally capable of entering into binding contracts.</li>
          </ul>
        </div>

        <div className="tc-section">
          <h2>2. User Responsibilities</h2>
          <ul>
            <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li><strong>Accuracy:</strong> Ensure that all information provided is accurate and up-to-date.</li>
            <li><strong>Compliance:</strong> You must comply with all applicable laws while using the platform.</li>
          </ul>
        </div>

        <div className="tc-section">
          <h2>3. Referral Program</h2>
          <ul>
            <li>Referral rewards apply only if the referred candidate remains employed for 90 days.</li>
            <li>Fake or duplicate referrals will be disqualified.</li>
          </ul>
        </div>

        <div className="tc-section">
          <h2>4. Content Guidelines</h2>
          <ul>
            <li>No false or misleading information.</li>
            <li>No offensive or copyrighted content.</li>
            <li>No malicious code uploads.</li>
          </ul>
        </div>

        <div className="tc-section">
          <h2>5. Platform Usage</h2>
          <ul>
            <li>License granted for personal, non-commercial use only.</li>
            <li>Do not disrupt platform functionality or access other users' data.</li>
          </ul>
        </div>

        <div className="tc-section">
          <h2>6. Privacy Policy</h2>
          <p>Refer & Earn is committed to protecting your privacy. Please refer to our Privacy Policy for full details.</p>
        </div>

        <div className="tc-section">
          <h2>7. Intellectual Property</h2>
          <p>All content belongs to Refer & Earn or its licensors. Reuse is not allowed without permission.</p>
        </div>

        <div className="tc-section">
          <h2>8. Limitation of Liability</h2>
          <p>We are not responsible for indirect damages, or issues arising from using the platform.</p>
        </div>

        <div className="tc-section">
          <h2>9. Termination</h2>
          <p>We may suspend or terminate accounts for violating these terms. You may close your account anytime by contacting us.</p>
        </div>

        <div className="tc-section">
          <h2>10. Modifications</h2>
          <p>Terms may be updated without notice. Continued use means you accept the new terms.</p>
        </div>

        <div className="tc-section">
          <h2>11. Governing Law</h2>
          <p>These terms are governed by Indian law and subject to the jurisdiction of local courts.</p>
        </div>

        <div className="tc-section">
          <h2>12. Contact Us</h2>
          <ul>
            <li>Email: support@refernearn.com</li>
            <li>Phone: +91-99999-88888</li>
            <li>Support Hours: Mon – Fri, 9 AM – 6 PM</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsAndConditions;
