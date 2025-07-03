import React, { useState, useEffect } from "react";
import "./Herosection.css";
import Boy from "../../../assets/herosection/Boy.png";
import { useNavigate } from "react-router-dom";

// Arrays for rotating placeholders
const jobTitles = [
  "Software Engineer", "Software Tester", "BPO Executive", "Content Moderator",
  "Data Analyst", "UI/UX Designer", "React Developer", "Node.js Developer",
  "Customer Support", "Digital Marketer"
];

const jobTypes = [
  "Full-Time", "Part-Time", "Internship", "Remote",
  "Contract", "Freelance", "On-site", "Hybrid",
  "Temporary", "Commission-Based"
];

const HeroSection = () => {
  const navigate = useNavigate();

  // Job Title Typing Effect
  const [placeholder, setPlaceholder] = useState("");
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = jobTitles[index % jobTitles.length];
    const typingSpeed = isDeleting ? 50 : 100;

    const type = () => {
      setPlaceholder((prev) =>
        isDeleting ? current.substring(0, charIndex - 1) : current.substring(0, charIndex + 1)
      );
      setCharIndex((prev) => (isDeleting ? prev - 1 : prev + 1));
    };

    if (!isDeleting && charIndex === current.length) {
      setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % jobTitles.length);
    }

    const timeout = setTimeout(type, typingSpeed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, index]);

  // Job Type Typing Effect
  const [typePlaceholder, setTypePlaceholder] = useState("");
  const [typeIndex, setTypeIndex] = useState(0);
  const [typeCharIndex, setTypeCharIndex] = useState(0);
  const [isTypeDeleting, setIsTypeDeleting] = useState(false);

  useEffect(() => {
    const current = jobTypes[typeIndex % jobTypes.length];
    const typingSpeed = isTypeDeleting ? 50 : 100;

    const type = () => {
      setTypePlaceholder((prev) =>
        isTypeDeleting ? current.substring(0, typeCharIndex - 1) : current.substring(0, typeCharIndex + 1)
      );
      setTypeCharIndex((prev) => (isTypeDeleting ? prev - 1 : prev + 1));
    };

    if (!isTypeDeleting && typeCharIndex === current.length) {
      setTimeout(() => setIsTypeDeleting(true), 1200);
    } else if (isTypeDeleting && typeCharIndex === 0) {
      setIsTypeDeleting(false);
      setTypeIndex((prev) => (prev + 1) % jobTypes.length);
    }

    const timeout = setTimeout(type, typingSpeed);
    return () => clearTimeout(timeout);
  }, [typeCharIndex, isTypeDeleting, typeIndex]);

  return (
    <div className="hero-container" id="about-us">
      <div className="hero-image">
        <img src={Boy} alt="Illustration" />
      </div>
      <div className="hero-content">
        <h1>
          Find Your <span className="hero-highlight">Dream Job</span> With Us
        </h1>
        <h3>
          Good life begins with a good company. Start exploring thousands of jobs in one place.
        </h3>
        <div className="hero-search-bar">
          <div className="hero-search-field">
            <label>Job Title</label>
            <input type="text" placeholder={placeholder} />
          </div>
          <div className="hero-search-field">
            <label>Job Type</label>
            <input type="text" placeholder={typePlaceholder} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
