import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const BASE_URL = process.env.REACT_APP_API_URL;

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChecked) {
      setErrorMessage("You must accept the Terms and Conditions.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}api/auth/reset-password`, {
        email,
        password,
      });

      if (response.status === 200) {
        alert("Password reset successful!");
        navigate("/");
      }
    } catch (error) {
      setErrorMessage("Failed to reset password. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <form onSubmit={handleSubmit} className="reset-password-form">
        <h1>Change Password</h1>

        {errorMessage && <div className="reset-password-error-message">{errorMessage}</div>}

        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

<div className="reset-password-checkbox-container">
    <input 
        type="checkbox" 
        id="termsCheckbox" 
        checked={isChecked} 
        onChange={(e) => setIsChecked(e.target.checked)} 
    />
    <label htmlFor="termsCheckbox">
        I accept the <a href="/terms">Terms and Conditions</a>
    </label>
</div>



        <button type="submit" className="reset-password-reset-btn" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;