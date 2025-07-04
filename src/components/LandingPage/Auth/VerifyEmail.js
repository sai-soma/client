import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import VerifySuccess from "./VerifySuccess"; // Import the VerifySuccess component

const VerifyEmail = () => {
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const [isVerified, setIsVerified] = useState(false); // Track verification status
  const navigate = useNavigate();
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token");
     //console.log("Token from URL:", token); 
      try {
        const res = await axios.get(`${BASE_URL}api/auth/verify-email`, {
            params: { token }
          });          
        setMessage("Email verified successfully.");
        setIsVerified(true); // Set verification status to true
        setTimeout(() => navigate("/login"), 3000); // redirect to login after 3s (optional)
      } catch (err) {
        setMessage("Invalid or expired verification link.");
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {isVerified ? (
        <VerifySuccess /> // Show VerifySuccess component on successful verification
      ) : (
        <h2>{message}</h2> // Display verification message
      )}
    </div>
  );
};

export default VerifyEmail;