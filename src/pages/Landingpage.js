import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./LandingPage.css"; // Import the global CSS file

import Navbar from "../components/LandingPage/navbar/Navbar";
import HeroSection from "../components/LandingPage/herosection/HeroSection";
import JobCategories from "../components/LandingPage/content/JobCategories";
import HowItWorks from "../components/LandingPage/howItWorks/HowItWorks";
import StatsSubscription from "../components/LandingPage/Subscription/Subscription";
import Reviews from "../components/LandingPage/Reviews/Reviews";
import Footer from "../components/LandingPage/footer/Footer";

const Landingpage = () => {
  useEffect(() => {
    AOS.init({
      duration: 800, // animation duration in ms
      once: true, // whether animation should happen only once
    });
  }, []);

  return (
    <div className="landing-page-container">
      {" "}
      {/* Use the container class */}
      <Navbar />
      <div className="section-wrapper" data-aos="fade-right">
        <HeroSection />
      </div>
      <div className="section-wrapper" data-aos="fade-up">
        <JobCategories />
      </div>
      <div className="section-wrapper" data-aos="fade-right">
        <HowItWorks />
      </div>
      <div className="section-wrapper" data-aos="zoom-in">
        <StatsSubscription />
      </div>
      <div className="section-wrapper" data-aos="fade-left">
        <Reviews />
      </div>
      <div className="section-wrapper" data-aos="fade-up">
        <Footer />
      </div>
    </div>
  );
};

export default Landingpage;
