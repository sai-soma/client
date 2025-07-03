// VerifySuccess.jsx
import { useNavigate } from "react-router-dom";

const VerifySuccess = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login"); // Redirect to login page
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
        alt="success"
        width="100"
      />
      <h2 style={{ color: "green" }}>Email verified successfully</h2>
      <button
        onClick={goToLogin}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#0e9f6e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Login
      </button>
    </div>
  );
};

export default VerifySuccess;