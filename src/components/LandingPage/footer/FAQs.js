import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQs.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Home } from 'lucide-react';

const faqs = [
  {
    question: 'How do I refer a candidate?',
    answer: 'Log in, open a job post, and click “Refer Candidate”. Upload the resume and fill in basic details.',
  },
  {
    question: 'When do I get my reward?',
    answer: 'After the candidate completes 90 days of employment.',
  },
  {
    question: 'Can I refer multiple candidates?',
    answer: 'Yes! You can refer as many candidates as you\'d like.',
  },
  {
    question: 'Can a referred candidate apply for multiple jobs?',
    answer: 'Yes, if they meet the skill requirements of each job.',
  },
  {
    question: 'What if a candidate leaves before 90 days?',
    answer: 'You won’t be eligible for the reward in such cases.',
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      {/* Home Button */}
      <button className="faq-home-btn" onClick={() => navigate('/')}>
        <Home size={18} /> Home
      </button>

      <motion.div
        className="faq-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="faq-title">Frequently Asked Questions</h1>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                {faq.question}
                {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    className="faq-answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p>{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FAQs;
