import React, { useEffect, useState } from "react";
import axios from "axios";
import { Steps } from "intro.js-react";
import {
  BsPeopleFill,
  BsClipboardCheck,
  BsHourglassSplit,
  BsCheckCircleFill,
  BsWallet2,
  BsXCircleFill,
  BsPatchCheckFill,
} from "react-icons/bs";
import { FaMoneyBillWave } from "react-icons/fa";
import "./UserDashboard.css";

const AnimatedCounter = ({ value, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    if (value === 0) return;

    let startTime;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const nextCount = Math.min(
        Math.floor((progress / duration) * value),
        value
      );
      setCount(nextCount);

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return <>{count}</>;
};

const UserDashboard = () => {
  const [referrals, setReferrals] = useState(0);
  const [applied, setApplied] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [joined, setJoined] = useState(0);
  const [selected, setSelected] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [totalRewardAmount, setTotalRewardAmount] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_URL;

  // Tooltip tour config
//   const [stepsEnabled, setStepsEnabled] = useState(false);
//   const steps = [
//   {
//     element: ".referral-widget",
//     intro: "This shows how many candidates you've referred.",
//   },
//   {
//     element: ".applied-widget",
//     intro: "This shows how many jobs you've applied to.",
//   },
//   {
//     element: ".progress-widget",
//     intro: "These are the applications still being reviewed.",
//   },
//   {
//     element: ".joined-widget",
//     intro: "Here you can track the candidates who've joined companies.",
//   },
//   {
//     element: ".selected-widget",
//     intro: "Shows the number of candidates selected for roles.",
//   },
//   {
//     element: ".rejected-widget",
//     intro: "This displays the number of applications that were rejected.",
//   },
//   {
//     element: ".wallet-widget",
//     intro: "This is your current available wallet balance.",
//   },
//   {
//     element: ".earn-widget",
//     intro: "This is the total amount you've earned through referrals.",
//   },
// ];


  useEffect(() => {
  const fetchAllData = async () => {
    await Promise.all([
      fetchReferrals(),
      fetchApplied(),
      fetchApplicationStatuses(),
      fetchWalletBalance(),
      fetchRewardHistory(),
    ]);
    setIsDataLoaded(true);
  };

  fetchAllData();

  // Show tooltip only if user hasn't seen it before (per user)
  // const userId = localStorage.getItem("userId");
  // const seenKey = `hasSeenUserTour_${userId}`;

  // const hasSeenTour = localStorage.getItem(seenKey);
  // if (!hasSeenTour) {
  //   setStepsEnabled(true);
  //   localStorage.setItem(seenKey, "true");
  // }
}, []);


  const userId = localStorage.getItem("userId");

  const fetchReferrals = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/resumes/${userId}`);
      setReferrals(res.data.length);
    } catch (err) {
      console.error("Error fetching referrals:", err);
    }
  };

  const fetchApplied = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/applications/user/${userId}`);
      setApplied(res.data.applications.length);
    } catch (err) {
      console.error("Error fetching applied:", err);
    }
  };

  const fetchApplicationStatuses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/applications/user/${userId}`);
      const applications = res.data.applications || [];

      const counts = applications.reduce(
        (acc, job) => {
          if (job.status === "inProgress") acc.inProgress++;
          if (job.status === "rejected") acc.rejected++;
          if (job.status === "selected") acc.selected++;
          if (job.status === "joined") acc.joined++;
          return acc;
        },
        { inProgress: 0, rejected: 0, selected: 0, joined: 0 }
      );

      setInProgress(counts.inProgress);
      setRejected(counts.rejected);
      setSelected(counts.selected);
      setJoined(counts.joined);
    } catch (err) {
      console.error("Error fetching statuses:", err);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/wallet/${userId}`);
      if (res.data.wallet) {
        setWalletBalance(res.data.wallet.totalEarnings || 0);
      }
    } catch (err) {
      console.error("Error fetching wallet:", err);
    }
  };

  const fetchRewardHistory = async () => {
    try {
      const res = await axios.get(`${BASE_URL}api/wallet/reward-history/${userId}`);
      const history = res.data.rewardHistory || [];
      setRewardHistory(history);

      const total = history.reduce((sum, item) => sum + (item.amount || 0), 0);
      setTotalRewardAmount(total);
    } catch (err) {
      console.error("Error fetching reward history:", err);
    }
  };

  return (
    <div className="user-dashboard">

      <h1 className="user-dashboard-title">Your Dashboard</h1>

      <div className="user-dashboard-widgets">
        <div className="user-dashboard-widget referral-widget">
          <div className="widget-icon-container">
            <BsPeopleFill className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>Candidates</h3>
            <p>{isDataLoaded ? <AnimatedCounter value={referrals} /> : 0}</p>
          </div>
        </div>

        <div className="user-dashboard-widget applied-widget">
          <div className="widget-icon-container">
            <BsClipboardCheck className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>Applied</h3>
            <p>{isDataLoaded ? <AnimatedCounter value={applied} /> : 0}</p>
          </div>
        </div>

        <div className="user-dashboard-widget progress-widget">
          <div className="widget-icon-container">
            <BsHourglassSplit className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>In Progress</h3>
            <p>{isDataLoaded ? <AnimatedCounter value={inProgress} /> : 0}</p>
          </div>
        </div>

        <div className="user-dashboard-widget joined-widget">
          <div className="widget-icon-container">
            <BsCheckCircleFill className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>Joined</h3>
            <p>{isDataLoaded ? <AnimatedCounter value={joined} /> : 0}</p>
          </div>
        </div>

        <div className="user-dashboard-widget selected-widget">
          <div className="widget-icon-container">
            <BsPatchCheckFill className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>Selected</h3>
            <p>{isDataLoaded ? <AnimatedCounter value={selected} /> : 0}</p>
          </div>
        </div>

        <div className="user-dashboard-widget rejected-widget">
          <div className="widget-icon-container">
            <BsXCircleFill className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>Rejected</h3>
            <p>{isDataLoaded ? <AnimatedCounter value={rejected} /> : 0}</p>
          </div>
        </div>

        <div className="user-dashboard-widget wallet-widget">
          <div className="widget-icon-container">
            <BsWallet2 className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>Available Balance</h3>
            <p>
              ₹ {isDataLoaded ? <AnimatedCounter value={Math.round(walletBalance)} /> : 0}
              {walletBalance % 1 !== 0
                ? `.${(walletBalance % 1).toFixed(2).substring(2)}`
                : ".00"}
            </p>
          </div>
        </div>

        <div className="user-dashboard-widget earn-widget">
          <div className="widget-icon-container">
            <FaMoneyBillWave className="user-dashboard-widget-icon" />
          </div>
          <div className="user-dashboard-widget-info">
            <h3>Total Earnings</h3>
            <p>
              ₹ {isDataLoaded ? <AnimatedCounter value={Math.round(totalRewardAmount)} /> : 0}
              {totalRewardAmount % 1 !== 0
                ? `.${(totalRewardAmount % 1).toFixed(2).substring(2)}`
                : ".00"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
