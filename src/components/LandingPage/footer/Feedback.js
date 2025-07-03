import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thanks for your feedback!');
    setFeedback('');
  };

  return (
    <div className="fb-container">
      {/* Floating Top-Left Home Button */}
      <button className="fb-home-btn" onClick={() => navigate('/')}>
        <Home size={18} /> Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fb-card"
      >
        <h1 className="fb-title">Feedback</h1>
        <p className="fb-subtitle">We appreciate your feedback! Let us know how we can improve.</p>
        <form onSubmit={handleSubmit}>
          <textarea
            className="fb-textarea"
            rows="6"
            placeholder="Write your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <button type="submit" className="fb-button">
            Submit
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Feedback;
