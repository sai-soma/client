import React, { useState, useEffect } from "react";
import "./Sidebar1.css";
import { BsFillGridFill, BsPersonPlusFill, BsBriefcaseFill, BsClockHistory, BsCollectionFill, BsFileEarmarkTextFill, BsPeopleFill, BsWalletFill, BsBank2, BsFileEarmarkPlusFill, BsListUl, BsChatDotsFill } from "react-icons/bs";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { useNavigate, useLocation } from "react-router-dom";

// Component imports
import UserDashboard from "../UserDashboard/UserDashboard";
import AddFriendsResume from "../addFriendsResume/AddFriendsResume";
import FullTimeJobs from "../FullTimeJObs/FullTimeJobs";
import PartTimeJobs from "../PartTimeJobs/PartTimeJobs";
import OtherJobs from "../OtherJobs/OtherJobs";
import AppliedJobs from "../AppliedJobs/AppliedJobs";
import MyWallet from "../Wallet/MyWallet";
import BankDetails from "../BankDetails/BankDetails";
import UserResume from "../UserResume/UserResumes";
import ResumeBuilder from "../ResumeBuilder/ResumeBuilder";
import TransactionHistory from "../TransactionHistory/TransactionHistory";

const Sidebar = ({ initialActiveItem, setParentActiveItem, currentPath }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(initialActiveItem || "dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (initialActiveItem) {
      setActiveItem(initialActiveItem);
    }
  }, [initialActiveItem]);

  useEffect(() => {
    const pathMap = {
      '/jobs': 'fullTimeJobs',
      '/appliedJobs': 'appliedJobs',
      '/myWallet': 'myWallet',
      '/transactionHistory': 'transactionHistory'
    };

    const matchedPath = Object.keys(pathMap).find(path => 
      currentPath.startsWith(path)
    );

     if (matchedPath) {
      const newActiveItem = pathMap[matchedPath];
      setActiveItem(newActiveItem);
      if (setParentActiveItem) {
        setParentActiveItem(newActiveItem);
      }
    }

    // if (pathMap[location.pathname]) {
    //   setActiveItem(pathMap[location.pathname]);
    //   if (setParentActiveItem) {
    //     setParentActiveItem(pathMap[location.pathname]);
    //   }
    // }
  }, [currentPath, setParentActiveItem]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

 const handleItemClick = (item) => {
    setActiveItem(item);
    if (setParentActiveItem) {
      setParentActiveItem(item);
    }

    const itemToPath = {
      dashboard: "/user",
      fullTimeJobs: "/jobs",
      partTimeJobs: "/partTimeJobs",
      otherJobs: "/otherJobs",
      uploadResume: "/user",
      appliedJobs: "/appliedJobs",
      reviews: "/user",
      myWallet: "/myWallet",
      transactionHistory: "/transactionHistory",
      bankDetails: "/user",
      userresumes: "/user",
      createyourownresume: "/user",
    };

    if (itemToPath[item]) {
      navigate(itemToPath[item]);
    }
  };
useEffect(() => {
  const userId = localStorage.getItem("userId");
  const seenKey = `hasSeenSidebarTour_${userId}`;
  const hasSeenSidebarTour = localStorage.getItem(seenKey);

  if (!hasSeenSidebarTour) {
    introJs()
      .setOptions({
        steps: [
           {
            element: "#btn",
            intro: "Click here to Toggle the Sidebar.",
          },
          {
            element: ".nav-list li:nth-child(1)",
            intro: "Click here to add a new candidate's resume.",
          },
          {
            element: ".nav-list li:nth-child(2)",
            intro: "Your dashboard summary lives here.",
          },
          {
            element: ".nav-list li:nth-child(3)",
            intro: "Explore full-time job opportunities.",
          },
          {
            element: ".nav-list li:nth-child(4)",
            intro: "Explore part-time job openings.",
          },
          {
            element: ".nav-list li:nth-child(5)",
            intro: "Check out other available jobs.",
          },
          {
            element: ".nav-list li:nth-child(6)",
            intro: "Track jobs you’ve applied to.",
          },
          {
            element: ".nav-list li:nth-child(7)",
            intro: "View your referred candidates.",
          },
          {
            element: ".nav-list li:nth-child(8)",
            intro: "Check your wallet balance here.",
          },
          {
            element: ".nav-list li:nth-child(9)",
            intro: "See your transaction history.",
          },
          {
            element: ".nav-list li:nth-child(10)",
            intro: "Add or update your bank details.",
          },
          {
            element: ".nav-list li:nth-child(11)",
            intro: "Post feedback or reviews.",
          },
          {
            element: ".nav-list li:nth-child(12)",
            intro: "Create a free professional resume.",
          },
        ],
        showProgress: true,
        exitOnEsc: true,
        hidePrev: true,
        hideNext: false,
        tooltipPosition: "auto",
      })
      .start();

    localStorage.setItem(seenKey, "true");
  }
}, []);

  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <UserDashboard />;
      case "fullTimeJobs":
        return <FullTimeJobs />;
      case "partTimeJobs":
        return <PartTimeJobs />;
      case "otherJobs":
        return <OtherJobs />;
      case "uploadResume":
        return <AddFriendsResume />;
      case "appliedJobs":
        return <AppliedJobs />;
      case "myWallet":
        return <MyWallet />;
      case "transactionHistory":
        return <TransactionHistory />;
      case "bankDetails":
        return <BankDetails />;
      case "userresumes":
        return <UserResume />;
      case "createyourownresume":
        return <ResumeBuilder />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="app">
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="logo_details">
          <div className="logo_name">
            <b>Refer & Earn</b>
          </div>
          <BsFillGridFill id="btn" onClick={toggleSidebar} />
        </div>

        <ul className="nav-list">
          <li onClick={() => handleItemClick("uploadResume")} className={activeItem === "uploadResume" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsPersonPlusFill /> &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Add Candidate +</b>
              </span>
            </a>
          </li>

          <li onClick={() => handleItemClick("dashboard")} className={activeItem === "dashboard" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsFillGridFill /> &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Dashboard</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("fullTimeJobs")} className={activeItem === "fullTimeJobs" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsBriefcaseFill /> &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Full-Time Jobs</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("partTimeJobs")} className={activeItem === "partTimeJobs" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsClockHistory /> &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Part-Time Jobs</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("otherJobs")} className={activeItem === "otherJobs" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsCollectionFill /> &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Other Jobs</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("appliedJobs")} className={activeItem === "appliedJobs" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsListUl /> &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Applied Jobs</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("userresumes")} className={activeItem === "userresumes" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsPeopleFill /> &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>My Referrals</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("myWallet")} className={activeItem === "myWallet" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsWalletFill />
              &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>My Wallet</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("transactionHistory")} className={activeItem === "transactionHistory" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsWalletFill />
              &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Transaction History</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("bankDetails")} className={activeItem === "bankDetails" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsBank2 /> &nbsp;&nbsp;
              <span className="link_name">
                <b>Bank Details</b>
              </span>
            </a>
          </li>
          <li onClick={() => handleItemClick("createyourownresume")} className={activeItem === "createyourownresume" ? "active" : ""}>
            <a href="#" onClick={(e) => e.preventDefault()}>
              <BsFileEarmarkPlusFill />
              &nbsp;&nbsp;{" "}
              <span className="link_name">
                <b>Free Resume Creator</b>
              </span>
            </a>
          </li>
        </ul>
      </div>
      {!isOpen && (
        <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Open navigation menu">
          <BsFillGridFill />
        </button>
      )}
      <div className={`content-wrapper ${isOpen ? "shifted" : ""}`}>{renderContent()}</div>
    </div>
  );
};

export default Sidebar;