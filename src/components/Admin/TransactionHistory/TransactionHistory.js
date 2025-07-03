import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionHistory.css";
import { FaSearch } from "react-icons/fa";

const TransactionHistory = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        const [withdrawRes, rewardRes] = await Promise.all([
          axios.get(`${BASE_URL}api/withdraw-requests`),
          axios.get(`${BASE_URL}api/wallet/all-rewards-history`)
        ]);

        const withdrawData = withdrawRes.data.map((txn) => ({
          type: "Withdraw",
          _id: txn._id,
          userId: txn.userId,
          fullName: txn.fullName,
          amount: txn.withdrawAmount,
          mode: txn.paymentMode || "N/A",
          jobTitle: "N/A",
          date: new Date(txn.requestDate),
          status: txn.status,
        }));

        const rewardData = [];
        if (rewardRes.data && rewardRes.data.success) {
          if (rewardRes.data.allRewards && Array.isArray(rewardRes.data.allRewards)) {
            rewardRes.data.allRewards.forEach((reward) => {
              rewardData.push({
                type: "Reward",
                _id: reward._id,
                userId: reward.userId,
                fullName: reward.referName || "N/A",
                amount: reward.amount,
                mode: "Reward",
                jobTitle: reward.jobTitle || "N/A",
                date: new Date(reward.date),
                status: reward.amount < 0 ? "Debited" : "Credited",
              });
            });
          }
        }

        const combined = [...withdrawData, ...rewardData].sort((a, b) => b.date - a.date);

        setAllTransactions(combined);
        setFilteredTransactions(combined);
      } catch (err) {
        console.error("❌ Failed to fetch transaction or reward history:", err);
        try {
          const { data } = await axios.get(`${BASE_URL}api/withdraw-requests`);
          const withdrawData = data.map((txn) => ({
            type: "Withdraw",
            _id: txn._id,
            userId: txn.userId,
            fullName: txn.fullName,
            amount: txn.withdrawAmount,
            mode: txn.paymentMode || "N/A",
            jobTitle: "N/A",
            date: new Date(txn.requestDate),
            status: txn.status,
          })).sort((a, b) => b.date - a.date);

          setAllTransactions(withdrawData);
          setFilteredTransactions(withdrawData);
        } catch (fallbackErr) {
          console.error("❌ Failed to fetch withdrawal data:", fallbackErr);
        }
      }
    };

    fetchCombinedData();
  }, [BASE_URL]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = allTransactions.filter((tx) =>
      tx.userId?.toLowerCase().includes(term.toLowerCase()) ||
      tx.fullName?.toLowerCase().includes(term.toLowerCase()) ||
      tx.type?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const indexOfLastTxn = currentPage * transactionsPerPage;
  const indexOfFirstTxn = indexOfLastTxn - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTxn, indexOfLastTxn);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="txn-container">
      <div className="txn-topbar">
        <h2>Admin Transaction History</h2>
        <div className="txn-search">
          <input 
            type="text" 
            placeholder="Search by User ID, Name, or Type..." 
            value={searchTerm} 
            onChange={(e) => handleSearch(e.target.value)} 
          />
          <FaSearch className="txn-search-icon" />
        </div>
      </div>

      <div className="txn-table-wrapper">
        <table className="txn-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>User ID</th>
              <th>User Name</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Job Title</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((txn) => (
                <tr key={`${txn.type}-${txn._id}`}>
                  <td>
                    <span className={`txn-type-badge ${txn.type.toLowerCase()}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td>{txn.userId}</td>
                  <td>{txn.fullName}</td>
                  <td>
                    <span className={txn.amount < 0 ? "negative-amount" : "positive-amount"}>
                      ₹{Math.abs(txn.amount)}
                    </span>
                  </td>
                  <td>{txn.mode}</td>
                  <td>{txn.jobTitle}</td>
                  <td>{formatDate(txn.date)}</td>
                  <td>
                    <span className={`status-badge ${txn.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="txn-pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button 
              key={index} 
              onClick={() => goToPage(index + 1)} 
              className={currentPage === index + 1 ? "active-page" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={nextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;