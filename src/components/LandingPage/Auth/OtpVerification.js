import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./OtpVerification.css";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [timer, setTimer] = useState(60);
  const [disableResend, setDisableResend] = useState(true);
  const email = location.state?.email || "";
  const BASE_URL = process.env.REACT_APP_API_URL;

  // Handle OTP input changes
  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    //console.log(`OTP Input at index ${index}:`, value);

    // Move to next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle OTP submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    //console.log("Submitting OTP:", otp.join(""));
    try {
      const response = await axios.post(`${BASE_URL}api/auth/verify-otp`, {
        email,
        otp: otp.join(""),
      });

      if (response.status === 200) {
        navigate("/reset-password", { state: { email } });
      }
    } catch (error) {
      setErrorMessage("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP function
  const resendOTP = async () => {
    setDisableResend(true);

    try {
      const response = await axios.post(`${BASE_URL}api/auth/resend-otp`, { email });

      //console.log("Resend OTP response:", response);
      if (response.status === 200) {
        alert("OTP resent successfully!");
        setTimer(60);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      alert("Failed to resend OTP.");
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setDisableResend(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  return (
    <div className="otp-verification-container">
      <form onSubmit={handleSubmit} className="otp-verification-form">
        <h1>Email Verification</h1>
        <p>
          We have sent a code to your email <strong>{email}</strong>
        </p>
        {errorMessage && <div className="otp-verification-error-message">{errorMessage}</div>}
        <br></br>

        {/* OTP Inputs */}
        <div className="otp-verification-inputs">
          {otp.map((data, index) => (
            <input key={index} id={`otp-${index}`} type="text" maxLength="1" value={data} onChange={(e) => handleChange(e, index)} />
          ))}
        </div>

        <button type="submit" disabled={isLoading} className="otp-verification-verify-btn">
          {isLoading ? "Verifying..." : "Verify Account"}
        </button>

        {/* Resend OTP Section */}
        <p className="otp-verification-resend-link">
          Didn't receive code?{" "}
          <button
            onClick={resendOTP}
            disabled={disableResend}
            style={{
              color: disableResend ? "gray" : "blue",
              cursor: disableResend ? "not-allowed" : "pointer",
              border: "none",
              background: "none",
            }}
          >
            Resend OTP in {timer}s
          </button>
        </p>
      </form>
    </div>
  );
};

export default OtpVerification;
