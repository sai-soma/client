import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TransactionHistory.css";
import { FaSearch } from "react-icons/fa";

const TransactionHistory = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchCombinedData = async () => {
      try {
        const [withdrawRes, rewardRes] = await Promise.all([
          axios.get(`${BASE_URL}api/withdraw-requests`),
          axios.get(`${BASE_URL}api/wallet/reward-history/${userId}`),
        ]);

        const withdrawData = withdrawRes.data
          .filter((txn) => txn.userId === userId)
          .map((txn) => ({
            type: "Withdraw",
            _id: txn._id,
            fullName: txn.fullName || "N/A",
            amount: txn.withdrawAmount,
            mode: txn.paymentMode || "N/A",
            date: new Date(txn.requestDate),
            status: txn.status || "Pending",
          }));

        const rewardData =
          rewardRes.data.rewardHistory?.map((reward, index) => ({
            type: "Reward",
            _id: reward._id || `reward-fallback-${index}`,
            fullName: reward.referName || "N/A",
            amount: reward.amount,
            mode: "Reward",
            date: new Date(reward.date),
            status: reward.amount < 0 ? "Debited" : reward.status || "Credited",
          })) || [];

        const combined = [...withdrawData, ...rewardData].sort((a, b) => b.date - a.date);

        setAllTransactions(combined);
        setFilteredTransactions(combined);
      } catch (err) {
        console.error("\u274C Failed to fetch transaction or reward history:", err);
      }
    };

    fetchCombinedData();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = allTransactions.filter((tx) =>
      tx.fullName?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredTransactions.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, startIndex + entriesPerPage);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="user-txn-container">
      <div className="user-txn-topbar">
        <h2>Transaction History</h2>
        <div className="user-txn-search">
          <input
            type="text"
            placeholder="Search by Name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <FaSearch className="user-txn-search-icon" />
        </div>
      </div>

      <div className="user-txn-table-wrapper">
        <table className="user-txn-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>User/Candidate Name</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((txn) => (
                <tr key={`${txn.type}-${txn._id}`}>
                  <td>
                    <span className={`user-txn-type-badge ${txn.type.toLowerCase()}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td>{txn.fullName}</td>
                  <td>
                    <span className={txn.amount < 0 ? "negative-amount" : "positive-amount"}>
                      {txn.amount < 0 ? "−" : "+"}₹{Math.abs(txn.amount)}
                    </span>
                  </td>
                  <td>{txn.mode}</td>
                  <td>{formatDate(txn.date)}</td>
                  <td>
                    <span className={`status-badge ${txn.status?.toLowerCase().replace(/\s+/g, "-")}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="user-txn-pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const pageNum = index + 1;
          return (
            <button
              key={pageNum}
              className={currentPage === pageNum ? "active-page" : ""}
              onClick={() => setCurrentPage(pageNum)}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionHistory;