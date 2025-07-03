import React, { useState, useEffect, useRef } from "react";
import { IoMdNotifications } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../../../context/StateContext";
import { useNotification } from "../../../context/NotificationContext";
import AccountSettings from "../accountsettings/AccountSettings";
import UploadResume from "../uploadResume/UploadResume";
import SuggestionsHelp from "../SuggestionsHelp/SuggestionsHelp";
import PostReview from "../reviews/PostReview";
import axios from "axios";
import "./Topbar.css";

const Topbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showPostReview, setShowPostReview] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [withdrawalNotifications, setWithdrawalNotifications] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_URL;

  const navigate = useNavigate();
  const { user, setUser } = useStateContext();
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } = useNotification();

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(`${BASE_URL}api/auth/user/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching updated user:", error);
      }
    };

    fetchUserData();
  }, [BASE_URL, setUser]);

  useEffect(() => {
    if (user?.userId) {
      fetchWithdrawalNotifications();
    }
  }, [BASE_URL, user?.userId]);

  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      await fetchNotifications();
      await fetchWithdrawalNotifications();
    }
  };

  const fetchWithdrawalNotifications = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/withdraw-requests/notifications/${user?.userId}`);
      const notifications = response.data.notifications || [];
      const notificationsWithType = notifications.map((notif) => ({
        ...notif,
        type: "withdrawal",
      }));
      setWithdrawalNotifications(notificationsWithType);
    } catch (error) {
      console.error("Error fetching withdrawal notifications:", error);
    }
  };

  const getReadNotifications = () => {
    return JSON.parse(localStorage.getItem("readNotifications")) || [];
  };

  const markNotificationAsRead = (notification) => {
    const readNotifications = getReadNotifications();
    if (!readNotifications.includes(notification._id)) {
      localStorage.setItem("readNotifications", JSON.stringify([...readNotifications, notification._id]));
      if (notification.type === "withdrawal") {
        setWithdrawalNotifications((prev) => prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n)));
      }
    }
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification);
    markAsRead(notification._id);

    // Handle navigation based on notification type
    switch (notification.type) {
      case "job_post":
        navigate("/jobs");
        break;
      case "application_status":
        navigate("/appliedJobs");
        break;
      case "withdrawal":
        navigate("/myWallet");
        break;
      default:
        // Default navigation if type is not specified
        if (notification.jobId) {
          navigate("/jobs");
        }
    }

    setShowNotifications(false);
  };

  const markAllNotificationsAsRead = () => {
    const allNotificationIds = [...notifications.map((n) => n._id), ...withdrawalNotifications.map((n) => n._id)];
    localStorage.setItem("readNotifications", JSON.stringify(allNotificationIds));
    markAllAsRead();
    setWithdrawalNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const combinedNotifications = [...notifications, ...(withdrawalNotifications || [])].filter((v, i, a) => a.findIndex((t) => t._id === v._id && t.type === v.type) === i);

  const getUnreadCount = () => {
    const readNotifications = getReadNotifications();
    const regularUnread = notifications.filter((n) => !readNotifications.includes(n._id)).length;
    const withdrawalUnread = withdrawalNotifications.filter((n) => !readNotifications.includes(n._id)).length;
    return regularUnread + withdrawalUnread;
  };

  const totalUnreadCount = getUnreadCount();

  return (
    <div className="topbar">
      <div className="topbar-right">
        {/* Notification Icon */}
        <div className="notification-container" ref={notificationRef}>
          <div className="notification-icon-wrapper" onClick={toggleNotifications}>
            <IoMdNotifications className="notification-icon" />
            {totalUnreadCount > 0 && <span className="notification-badge">{totalUnreadCount}</span>}
          </div>

          {showNotifications && (
            <div className="notifications-dropdown show">
              <div className="notifications-header">
                <h3>Notifications</h3>
                {totalUnreadCount > 0 && (
                  <button className="mark-all-read" onClick={markAllNotificationsAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="notifications-list">
                {combinedNotifications
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((notification) => (
                    <div key={`${notification.type}-${notification._id}`} className={`notification-item ${!getReadNotifications().includes(notification._id) ? "unread" : ""}`} onClick={() => handleNotificationClick(notification)}>
                      <p>{notification.message}</p>
                      <span className="notification-time">{new Date(notification.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info & Dropdown */}
        {user ? (
          <div className="user-info">
            <div className="avatar-container" onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef}>
              <span className="username">
                <b>{user?.fullName?.toUpperCase() || "ADMIN"}</b>
              </span>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <ul>
                    <li onClick={() => setShowAccountModal(true)}>Account Settings</li>
                    <li onClick={() => setShowUploadModal(true)}>Upload Resume</li>
                    <li onClick={() => setShowSuggestionsModal(true)}>Suggestions / Help</li>
                    <li onClick={() => setShowPostReview(true)}>Post A Review</li>
                    <li onClick={() => setShowLogoutModal(true)}>Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>

      {/* Modals */}
      {showAccountModal && <AccountSettings onClose={() => setShowAccountModal(false)} />}
      {showUploadModal && <UploadResume userId={user?.userId} onClose={() => setShowUploadModal(false)} />}
      {showSuggestionsModal && <SuggestionsHelp onClose={() => setShowSuggestionsModal(false)} />}
      {showPostReview && <PostReview onClose={()=> setShowPostReview(false)}/>}
      {showLogoutModal && (
        <div className="topbar-modal-overlay">
          <div className="topbar-modal-content">
            <p>Are you sure you want to logout?</p>
            <div className="topbar-modal-buttons">
              <button
                className="topbar-yes-btn"
                onClick={() => {
                  localStorage.removeItem("userId");
                  setUser(null);
                  setShowLogoutModal(false);
                  navigate("/login");
                }}
              >
                Yes
              </button>
              <button className="topbar-no-btn" onClick={() => setShowLogoutModal(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Topbar;
