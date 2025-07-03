import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaUsers } from "react-icons/fa";
import "./Subscription.css";

const StatsSubscription = () => {
  const [count, setCount] = useState(0);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  const disposableDomains = [
    'mailinator.com', 'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'trashmail.com', 'fakeinbox.com', 'yopmail.com', 'sharklasers.com'
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect(); // Ensuring observer cleanup
    };
  }, []);

  useEffect(() => {
    if (isVisible && count < 1000) {
      const interval = setInterval(() => {
        setCount((prev) => (prev + 10 >= 1000 ? 1000 : prev + 10));
      }, 10);
      return () => clearInterval(interval);
    }
  }, [isVisible, count]);

  const handleSubscribe = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
      setMessage("Please enter a valid email.");
      return;
    }

    const domain = normalizedEmail.split('@')[1];
    if (disposableDomains.includes(domain)) {
      setMessage("Temporary email addresses are not allowed.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}api/subscribe`, {
        email: normalizedEmail,
      });

      if (response.data.success) {
        setMessage("Subscription successful!");
        setEmail("");
      } else {
        setMessage("Subscription failed. Please try again.");
      }
    } catch (error) {
      setMessage("Email already existed..!");
    }
  };

  return (
    <div className="main-subs-div">
      <div ref={ref} className="stats-subscription-container">
        <div className="subscription-candidates-box">
          <FaUsers className="subscription-candidates-icon" />
          <div className="subscription-candidates-text">
            <p className="subscription-candidates-count">{count}+</p>
            <p className="subscription-candidates-label">Candidates Placed</p>
          </div>
        </div>

        <div className="subscribe-box">
          <p className="subscribe-title">
            Never Want to Miss Any <span className="subscription-highlight">Job News?</span>
          </p>
          <div className="subscribe-input-box">
            <input
              type="email"
              placeholder="Your@email.com"
              className="subscribe-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="subscribe-button" onClick={handleSubscribe}>
              Subscribe
            </button>
            <br />
          </div>
          {message && <p className="subscription-message">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatsSubscription;
