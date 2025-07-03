import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import { BsFillGridFill, BsBriefcaseFill, BsCreditCardFill, BsPeopleFill, BsClipboardCheckFill, BsCashStack, BsChatSquareTextFill } from "react-icons/bs";
import { TbTransactionRupee } from "react-icons/tb";

// Component imports
import AdminDashboard from "../AdminDashboard/AdminDashboard";
import JobPosting from "../JobPosting/JobPosting";
import Subscriptions from "../Subscriptions/Subscriptions";
import UserData from "../UserData/UserData";
import UpdateJobStatus from "../UpdateJobStatus/UpdateJobStatus";
import WithdrawApproval from "../WithdrawApproval/WithdrawApproval";
import FeedbackList from "../FeedbackList/FeedbackList";
import ResumeList from "../ResumeList/ResumeList";
import MakeAdmins from "../MakeAdmins/MakeAdmins";
import TransactionHistory from "../TransactionHistory/TransactionHistory";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState("dashboard");
  const user =JSON.parse(localStorage.getItem("user"));
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

 //console.log(user);
  const currentUserRole = user.role; // or "admin", "moderator", etc.
console.log(currentUserRole);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
    if (window.innerWidth > 768) {
      setIsOpen(true); // Keep sidebar open on desktop
    } else {
      setIsOpen(false); // Close sidebar on mobile by default
    }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Modified handleItemClick function
const handleItemClick = (item) => {
  setActiveItem(item);
  
  // Auto-close sidebar on mobile when item is clicked
  if (isMobile) {
    setIsOpen(false);
  }
};

  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <AdminDashboard />;
      case "postjobs":
        return <JobPosting />;
      case "subscriptions":
        return <Subscriptions />;
      case "userdata":
        return <UserData />;
      case "AllResumes":
        return <ResumeList />;
      case "updatejobstatus":
        return <UpdateJobStatus />;
      case "withdrawapproval":
        return <WithdrawApproval />;
      case "feedback":
        return <FeedbackList />;
      case "TransactionHistory":
        return <TransactionHistory />;
      case "makeadmins":
        return currentUserRole === "superadmin" ? <MakeAdmins /> : <div>Access Denied</div>;
      case "settings":
        return <div>Settings Page</div>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-sidebar-app">
    {isMobile && (
      <button 
        className="mobile-sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <BsFillGridFill />
      </button>
    )}
      <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
        <div className="admin-sidebar-logo-details">
          <div className="admin-sidebar-logo-name">
            <b>&nbsp;&nbsp;Refer & Earn</b>
          </div>
          <BsFillGridFill id="admin-sidebar-btn" onClick={toggleSidebar} />
        </div>
        <ul className="admin-sidebar-nav-list">
          <li onClick={() => handleItemClick("dashboard")} className={activeItem === "dashboard" ? "active" : ""}>
            <a href="#">
              <BsFillGridFill />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>Dashboard</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("postjobs")} className={activeItem === "postjobs" ? "active" : ""}>
            <a href="#">
              <BsBriefcaseFill />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>Job Posting</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("subscriptions")} className={activeItem === "subscriptions" ? "active" : ""}>
            <a href="#">
              <BsCreditCardFill />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>Subscriptions</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("userdata")} className={activeItem === "userdata" ? "active" : ""}>
            <a href="#">
              <BsPeopleFill />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>User Data</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("AllResumes")} className={activeItem === "AllResumes" ? "active" : ""}>
            <a href="#">
              <BsPeopleFill />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>All Resumes</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("updatejobstatus")} className={activeItem === "updatejobstatus" ? "active" : ""}>
            <a href="#">
              <BsClipboardCheckFill />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>Update Job Status</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("withdrawapproval")} className={activeItem === "withdrawapproval" ? "active" : ""}>
            <a href="#">
              <BsCashStack />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>Withdraw Approval</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("TransactionHistory")} className={activeItem === "TransactionHistory" ? "active" : ""}>
            <a href="#">
              <TbTransactionRupee />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>Transaction History</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("feedback")} className={activeItem === "feedback" ? "active" : ""}>
            <a href="#">
              <BsChatSquareTextFill />
              &nbsp;&nbsp;
              <span className="admin-sidebar-link-name">
                <b>Feedback</b>
              </span>
            </a>
          </li>
          {currentUserRole === "superadmin" && (
            <li onClick={() => handleItemClick("makeadmins")} className={activeItem === "makeadmins" ? "active" : ""}>
              <a href="#">
                <BsPeopleFill />
                &nbsp;&nbsp;
                <span className="admin-sidebar-link-name">
                  <b>Make Admins</b>
                </span>
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Content Wrapper */}
      <div className={`admin-sidebar-content-wrapper ${isOpen ? "admin-sidebar-shifted" : ""}`}>{renderContent()}</div>
    </div>
  );
};

export default Sidebar;