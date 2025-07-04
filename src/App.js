import React from "react";
import { Routes, Route } from "react-router-dom";

// Landing Page & Auth
import LandingPage from "./pages/Landingpage";
import LoginSignup from "./components/LandingPage/Auth/LoginSignup";
import OtpVerification from "./components/LandingPage/Auth/OtpVerification";
import ResetPassword from "./components/LandingPage/Auth/ResetPassword";
import VerifySuccess from "./components/LandingPage/Auth/VerifySuccess";
import VerifyEmail from "./components/LandingPage/Auth/VerifyEmail";
import SetPassword from "./components/LandingPage/Auth/SetPassword";

// Admin & User Pages
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";

// Footer Pages
import TermsAndConditions from "./components/LandingPage/footer/TermsAndConditions";
import HelpSupport from "./components/LandingPage/footer/HelpSupport";
import Feedback from "./components/LandingPage/footer/Feedback";
import FAQs from "./components/LandingPage/footer/FAQs";
import AboutUs from "./components/LandingPage/footer/AboutUs";
import ContactUs from "./components/LandingPage/footer/ContactUs";
import PrivacyPolicy from "./components/LandingPage/footer/PrivacyPolicy";

// Context
import { NotificationProvider } from "./context/NotificationContext";

const App = () => {
  return (
    <NotificationProvider>
      <Routes>
        {/* Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route path="/verify-success" element={<VerifySuccess />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage />} />

        {/* User & Subroutes */}
        <Route path="/user" element={<UserPage />} />
        <Route path="/user/*" element={<UserPage />} />
        <Route path="/jobs" element={<UserPage initialActiveItem="fullTimeJobs" />} />
        <Route path="/otherJobs" element={<UserPage initialActiveItem="otherJobs" />} />
        <Route path="/partTimeJobs" element={<UserPage initialActiveItem="partTimeJobs" />} />
        <Route path="/appliedJobs" element={<UserPage initialActiveItem="appliedJobs" />} />
        <Route path="/myWallet" element={<UserPage initialActiveItem="myWallet" />} />
        <Route path="/transactionHistory" element={<UserPage initialActiveItem="transactionHistory" />} />

        {/* Footer Pages */}
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </NotificationProvider>
  );
};

export default App;