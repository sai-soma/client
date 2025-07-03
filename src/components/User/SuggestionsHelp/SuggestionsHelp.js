//SuggesstionsHelp.js

import React, { useState } from "react";
import "./SuggestionsHelp.css";
import { useStateContext } from "../../../context/StateContext";

const SuggestionsHelp = ({ onClose }) => {
  const [feedback, setFeedback] = useState("");
  const [priority, setPriority] = useState("Low");
  const [loading, setLoading] = useState(false);
  const { user } = useStateContext();
  const BASE_URL = process.env.REACT_APP_API_URL;

  // Check if user exists to prevent errors
  const fullName = localStorage.getItem("userId");
  const email = user.email;

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      alert("Please enter your feedback before submitting.");
      return;
    }

    if (!fullName || !email) {
      alert("User not authenticated! Please log in.");
      return;
    }

    setLoading(true);

    try {
      //console.log("Submitting Feedback:", { fullName, email, feedback, priority });

      const response = await fetch(`${BASE_URL}api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, feedback, priority }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Feedback submitted successfully!");
        setFeedback("");
        setPriority("Low");
        onClose();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Feedback submission failed:", error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sh-overlay">
      <div className="sh-content">
        <button className="sh-close-btn" onClick={onClose}>✕</button>
        <h2 className="sh-title">Suggestions / Help</h2>

        <textarea
          className="sh-input"
          placeholder="Any suggestions / feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        ></textarea>

        <hr className="sh-divider" />

        <p className="sh-priority-label">How critical is it?</p>
        <div className="sh-priority-options">
          {["High", "Medium", "Low"].map((level) => (
            <button
              key={level}
              className={`sh-priority-btn ${priority === level ? "sh-priority-selected" : ""}`}
              onClick={() => setPriority(level)}
            >
              {level}
            </button>
          ))}
        </div>

        <button 
          className="sh-submit-btn" 
          onClick={handleSubmit} 
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Feedback"}
        </button>
      </div>
    </div>
  );
};

export default SuggestionsHelp;
