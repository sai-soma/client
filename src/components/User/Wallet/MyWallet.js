import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MyWallet.css";

const MyWallet = () => {
  const [wallet, setWallet] = useState({
    totalEarnings: 0,
    pendingRewards: 0,
    withdrawnAmount: 0,
  });
  const [rewardHistory, setRewardHistory] = useState([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [isWithdrawApproved, setIsWithdrawApproved] = useState(false);
  const [withdrawalNotifications, setWithdrawalNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;

  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to access your wallet.");
      return;
    }

    fetchWalletData();
    fetchRewardHistory();
    fetchWithdrawalNotifications();
    // fetchWithdrawStatus();
  }, []);

  useEffect(() => {
    if (wallet.pendingRewards > 0) {
      const timer = setTimeout(async () => {
        try {
          const userId = localStorage.getItem("userId");
          if (!userId) return; // Exit if userId is not found
          await axios.post(`${BASE_URL}api/wallet/claim-rewards`, { userId });
          await fetchWalletData(); // ✅ Fetch updated wallet data after claim

          // Auto add missing rewards
          rewardHistory.forEach(async (reward) => {
            if (!reward.amount || reward.amount === 0) {
              await addRewardToWallet(reward.applicationId);
            }
          });
        } catch (error) {
          console.error("❌ Error updating pending rewards:", error);
        }
      }, 10000);
      return () => clearTimeout(timer); // Cleanup on component unmount or dependency change
    }
  }, [wallet.pendingRewards, rewardHistory]); // Add rewardHistory as a dependency

  const fetchWalletData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const response = await axios.get(`${BASE_URL}api/wallet/${userId}`);
      //console.log("Wallet data fetched:", response.data);
      if (response.data.wallet) {
        setWallet({
          totalEarnings: response.data.wallet.totalEarnings || 0,
          pendingRewards: response.data.wallet.pendingRewards || 0,
        });
      }
    } catch (error) {
      console.error("❌ Error fetching wallet data:", error);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault(); // Prevent page reload
    const userId = localStorage.getItem("userId");

    if (!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > wallet.totalEarnings) {
      alert("⚠ Please enter a valid withdrawal amount.");
      return;
    }

    try {
      await axios.post(`${BASE_URL}api/wallet/withdraw`, {
        userId,
        amount: parseFloat(withdrawAmount),
      });

      alert(`✅ Withdrawal Request of ₹${withdrawAmount} sent successfully!`);
      setShowWithdrawForm(false);
      setWithdrawAmount("");
      setIsWithdrawApproved(true);
      // await fetchWithdrawStatus();
    } catch (error) {
      console.error("❌ Withdrawal failed:", error);
      alert("⚠ Withdrawal failed. Please try again.");
    }
  };

  const addRewardToWallet = async (applicationId) => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId || !applicationId) {
        console.error("❌ Missing data: userId or applicationId", { userId, applicationId });
        return;
      }

      //console.log("📢 API Calling for:", { userId, applicationId });

      const response = await axios.post(`${BASE_URL}api/wallet/add`, {
        userId,
        applicationId,
      });

      //console.log("✅ API Response:", response.data);

      // Fetch updated reward history after adding a reward
      await fetchRewardHistory();
    } catch (error) {
      console.error("❌ Error adding reward:", error.response ? error.response.data : error);
    }
  };

  const fetchRewardHistory = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const response = await axios.get(`${BASE_URL}api/wallet/reward-history/${userId}`);

    if (response.data.rewardHistory) {
      const sorted = response.data.rewardHistory.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRewardHistory(sorted || []);
    } else {
      console.error("Reward history not found or malformed response.");
    }
  } catch (error) {
    console.error("❌ Error fetching reward history:", error);
  }
};


  const fetchWithdrawalNotifications = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const response = await axios.get(`${BASE_URL}api/withdraw-requests/notifications/${userId}?timestamp=${new Date().getTime()}`); // ⬅ Force fresh data to prevent caching
      //console.log("🔍 Withdrawal Notifications:", response.data.notifications);  // Debugging
      const allNotifications = response.data.notifications || [];

      const filteredSorted = allNotifications
        .filter((notif) => (notif.status && (notif.status === "Approved" || notif.status === "Rejected")) || notif.message.includes("Approved") || notif.message.includes("Rejected"))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setWithdrawalNotifications(filteredSorted);
      //console.log("🔄 Updated withdrawal notifications:", response.data);
    } catch (error) {
      console.error("❌ Error fetching withdrawal notifications:", error);
    }
  };

  return (
    <div className="mywallet-container" id="myWallet">
      <h2 className="mywallet-title">Your Reward Wallet</h2>

      <div className="mywallet-grid">
        <div className="mywallet-card">
          <p>Available Balance</p>
          <p className="mywallet-value">₹{(wallet.totalEarnings || 0).toFixed(2)}</p>
        </div>

        <div className="mywallet-card">
          <button className="mywallet-button" onClick={() => setShowWithdrawForm(true)}>
            Withdraw Funds
          </button>
        </div>

        <div className="mywallet-card">
          <p>Pending Rewards</p>
          <p className="mywallet-value">₹{wallet.pendingRewards.toFixed(2)}</p>
        </div>
      </div>

      {/* ✅ Modal Popup for Withdraw Form */}
      {/* ✅ Modal Popup for Withdraw Form */}
      {/* ✅ Modal Popup for Withdraw Form */}
      {showWithdrawForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Withdraw Funds</h3>

            {/* Display Total Earnings */}
            <p className="wallet-balance">
              <strong>
                Your Total Earnings: <span className="amount">₹{(wallet.totalEarnings || 0).toFixed(2)}</span>
              </strong>
            </p>

            <form onSubmit={handleWithdraw} className="withdraw-form">
              <label className="withdraw-label">Enter Amount to Withdraw:</label>
              <input type="number" className="withdraw-input" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} min="1" max={wallet.totalEarnings} required />

              <button type="submit" className="confirm-btn">
                Confirm Withdrawal
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowWithdrawForm(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Referral Earnings Section */}
      <h3 className="wallet-titles">Referral Earnings</h3>
      <div className="reward-history">
        {rewardHistory && rewardHistory.length > 0 ? (
          rewardHistory.slice(0, 3).map((reward, index) => (
            <div key={index} className="reward-box">
              <p>
                <strong>{reward.referName || "Unknown"}</strong> referred for
                <strong> {reward.jobTitle || "Unknown Job"}</strong>
                <span style={{ marginLeft: "8px" }}>role and </span>
                <span className="reward-amount green-text">
                  {reward.amount < 0 ? " lost " : " earned "}₹{Math.abs(reward.amount)}
                </span>
                !
              </p>
            </div>
          ))
        ) : (
          <p>🔹 No referral earnings yet.</p>
        )}
      </div>

      {/* Withdrawal Updates with Pagination */}
<div className="withdrawal-updates-container">
  <h3 className="wallet-titles">Withdrawal Updates</h3>
  <div className="withdrawal-table">
    <table>
      <thead>
        <tr>
          <th>Amount</th>
          <th>Payment Method</th>
          <th>Status</th>
          <th>Updated Date</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {withdrawalNotifications.length > 0 ? (
          withdrawalNotifications
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((notif, index) => {
              const amountMatch = notif.message.match(/₹(\d+)/);
              const amount = amountMatch ? `₹${amountMatch[1]}` : "-";

              return (
                <tr key={index}>
                  <td>
                    <span className="withdrawal-green-text">{amount}</span>
                  </td>
                  <td className="withdrawal-payment-method">
                    {notif.modeOfPayment || notif.message.match(/via (.*?) has been/i)?.[1] || "N/A"}
                  </td>
                  <td
                    className={
                      notif.status?.toLowerCase() === "approved"
                        ? "withdrawal-status-approved"
                        : notif.status?.toLowerCase() === "rejected"
                        ? "withdrawal-status-rejected"
                        : notif.message.includes("Approved")
                        ? "withdrawal-status-approved"
                        : notif.message.includes("Rejected")
                        ? "withdrawal-status-rejected"
                        : "withdrawal-status-pending"
                    }
                  >
                    {notif.status || notif.message.match(/has been (\w+)/i)?.[1] || "Pending"}
                  </td>
                  <td>{new Date(notif.createdAt).toLocaleString()}</td>
                  <td
                    className="withdrawal-message"
                    dangerouslySetInnerHTML={{
                      __html: notif.message.replace(/(₹\d+)/g, '<span class="withdrawal-green-text">$1</span>'),
                    }}
                  ></td>
                </tr>
              );
            })
        ) : (
          <tr>
            <td colSpan="5">🔹 No withdrawal updates yet.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>

  {/* Pagination Controls */}
  {withdrawalNotifications.length > itemsPerPage && (
    <div className="pagination-controls">
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => prev - 1)}
      >
        Prev
      </button>
      <span>
        Page {currentPage} of {Math.ceil(withdrawalNotifications.length / itemsPerPage)}
      </span>
      <button
        disabled={currentPage === Math.ceil(withdrawalNotifications.length / itemsPerPage)}
        onClick={() => setCurrentPage((prev) => prev + 1)}
      >
        Next
      </button>
    </div>
  )}
</div>

    </div>
  );
};

export default MyWallet;
