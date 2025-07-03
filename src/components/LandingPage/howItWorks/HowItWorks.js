import React from "react";
import "./HowItWorks.css";

import Girl from '../../../assets/Working/Girl.png'
import reward from '../../../assets/Working/reward.jpg'
import resume from '../../../assets/Working/resume.png'
import hired from '../../../assets/Working/hired.png'
import avatar1 from '../../../assets/Working/avatar1.jpeg'


const HowItWorks = () => {
  return (
    <div className="how-it-works" id="how-it-works">
      <div className="how-it-works-container">
        {/* Left Section - Animated Woman */}
        <div className="how-it-works-left-section">
          <img src={Girl} alt="Woman working on laptop" className="how-it-works-woman-img" />
          <div className="how-it-works-profile-status">
            <img src={avatar1} alt="Profile Avatar" className="how-it-works-profile-img" />
            <p className="how-it-works-profile-text">Complete your profile</p>
            <p className="how-it-works-profile-progress">Available for immediate opportunities</p>
          </div>
        </div>

        {/* Right Section - Steps */}
        <div className="how-it-works-right-section">
          <h2 className="how-it-works-title">
            How it <span className="how-it-works-highlight">Works</span>
          </h2>
          <p className="how-it-works-description">Effortlessly navigate through the process and land your dream job.</p>

          <div className="how-it-works-steps">

<div className="how-it-works-step">
  <img src={resume} alt="Refer" className="how-it-works-step-icon" />
  <div>
    <h3 className="how-it-works-step-title">Step 1: Refer a Candidate</h3>
    <p className="how-it-works-step-desc">Upload resumes of potential candidates and refer them for job openings.</p>
  </div>
</div>

<div className="how-it-works-step">
  <img src={hired} alt="Selection" className="how-it-works-step-icon" />
  <div>
    <h3 className="how-it-works-step-title">Step 2: Candidate Gets Hired</h3>
    <p className="how-it-works-step-desc">If the company selects your referred candidate and they join the job, your referral is confirmed.</p>
  </div>
</div>

<div className="how-it-works-step">
  <img src={reward} alt="Earn Rewards" className="how-it-works-step-icon" />
  <div>
    <h3 className="how-it-works-step-title">Step 3: Receive Your Reward</h3>
    <p className="how-it-works-step-desc">After the candidate completes 90 days in the company, your reward is credited to your wallet.</p>
  </div>
</div>
</div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
