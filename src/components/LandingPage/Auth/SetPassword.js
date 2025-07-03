import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SetPassword.css"; // Import the CSS file

const SetPassword = () => {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(""); // 🆕 Add userId field
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(null); // 🆕 Track availability
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromURL = queryParams.get("email");
    const tokenFromURL = queryParams.get("token");

    if (emailFromURL && tokenFromURL) {
      localStorage.setItem("resetEmail", emailFromURL);
      localStorage.setItem("resetToken", tokenFromURL);
      setEmail(emailFromURL);
    } else {
      const emailFromStorage = localStorage.getItem("resetEmail");
      const tokenFromStorage = localStorage.getItem("resetToken");

      if (!emailFromStorage || !tokenFromStorage) {
        alert("⚠ Session expired. Please log in again.");
        navigate("/login");
      } else {
        setEmail(emailFromStorage);
      }
    }
  }, [navigate, location.search]);

  // 🆕 Check if userId is available
  const checkUserIdAvailability = async (id) => {
    if (!id.trim()) return; // Skip empty values
    try {
      const response = await fetch(`${BASE_URL}api/auth/check-userid/${id}`);
      const data = await response.json();
      setIsUserIdAvailable(data.available);
    } catch (error) {
      console.error("Error checking userId:", error);
      setIsUserIdAvailable(null);
    }
  };

  const handleSubmit = async () => {
    const storedToken = localStorage.getItem("resetToken") || "";
    const finalToken = storedToken.trim();

    if (!email.trim()) {
      alert("❌ Error: Email is missing.");
      return;
    }
    if (!finalToken) {
      alert("❌ Error: Token is missing.");
      return;
    }
    if (!userId.trim()) {
      alert("❌ User ID is required.");
      return;
    }
    if (!isUserIdAvailable) {
      alert("❌ User ID is already taken. Please choose another.");
      return;
    }
    if (password.length < 6) {
      alert("❌ Password must be at least 6 characters long!");
      return;
    }
    if (password !== confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}api/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId, newPassword: password, resetToken: finalToken }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Password Set Successfully!");
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetToken");
        navigate("/login");
      } else {
        alert(data.message || "⚠ Error setting password.");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="set-password-container">
      <div className="set-password-box">
        <h2 className="set-password-title">Set Your Password</h2>
        <p>
          <b>Email:</b> {email || "Fetching..."}
        </p>

        {/* 🆕 User ID Field */}
        <input
          type="text"
          placeholder="Choose a User ID"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            checkUserIdAvailability(e.target.value); // Auto-check availability
          }}
          className="set-password-input-field"
        />
        {isUserIdAvailable === null ? "" : isUserIdAvailable ? <p style={{ color: "green" }}>✅ User ID is available</p> : <p style={{ color: "red" }}>❌ User ID is already taken</p>}

        <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} className="set-password-input-field" />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="set-password-input-field" />
        <button onClick={handleSubmit} className={loading ? "set-password-button-disabled" : "set-password-button"} disabled={loading}>
          {loading ? "Setting Password..." : "Set Password"}
        </button>
      </div>
    </div>
  );
};

export default SetPassword;
