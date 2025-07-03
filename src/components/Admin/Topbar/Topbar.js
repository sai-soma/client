import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../context/StateContext";
import "./Topbar.css";

const Topbar = () => {
  const { user } = useStateContext();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setShowModal(false);
    navigate("/login");
  };

  return (
    <div className="admin-topbar">
      <div className="admin-topbar-right">
        {user ? (
          <div className="admin-topbar-container">
            <div className="admin-topbar-info-wrapper">
              <span className="admin-topbar-greeting"><b>HI ADMIN</b></span>
            </div>
            <button className="admin-topbar-logout-btn" onClick={() => setShowModal(true)}>
              Logout
            </button>
          </div>
        ) : (
          <button className="admin-topbar-login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="admin-topbar-modal-overlay">
          <div className="admin-topbar-modal-content">
            <p>Are you sure you want to logout?</p>
            <div className="admin-topbar-modal-buttons">
              <button className="admin-topbar-yes-btn" onClick={handleLogout}>Yes</button>
              <button className="admin-topbar-no-btn" onClick={() => setShowModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;