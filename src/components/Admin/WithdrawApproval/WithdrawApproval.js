import React, { useEffect, useState } from "react";
import axios from "axios";
import "./WithdrawApproval.css";

const WithdrawApproval = () => {
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [disabledButtons, setDisabledButtons] = useState({});
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [selectedPaymentModes, setSelectedPaymentModes] = useState(() => {
    const savedModes = localStorage.getItem("selectedPaymentModes");
    return savedModes ? JSON.parse(savedModes) : {};
  });

  useEffect(() => {
    const savedState = localStorage.getItem("disabledButtons");
    if (savedState) {
      setDisabledButtons(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    const savedModes = localStorage.getItem("selectedPaymentModes");
    if (savedModes) setSelectedPaymentModes(JSON.parse(savedModes));

    const savedState = localStorage.getItem("disabledButtons");
    if (savedState) setDisabledButtons(JSON.parse(savedState));

    const fetchWithdrawRequests = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}api/withdraw-requests`);
        const updatedRequests = data
          .reverse()
          .filter((req) => req.status?.toLowerCase() === "pending")
          .map((request) => ({
            ...request,
            paymentMode: request.paymentMode || selectedPaymentModes[request._id] || "",
          }));

        setWithdrawRequests(updatedRequests);
        setFilteredRequests(updatedRequests);
      } catch (error) {
        console.error("Error fetching withdraw requests:", error);
      }
    };

    fetchWithdrawRequests();
  }, []);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const lowerTerm = term.toLowerCase();
    const filtered = withdrawRequests.filter((req) => req.userId?.toLowerCase().includes(lowerTerm) || req.fullName?.toLowerCase().includes(lowerTerm));
    setFilteredRequests(filtered);
  };

  const handlePaymentModeSelect = (withdrawRequestId, mode) => {
    const updatedModes = { ...selectedPaymentModes, [withdrawRequestId]: mode };
    setSelectedPaymentModes(updatedModes);
    localStorage.setItem("selectedPaymentModes", JSON.stringify(updatedModes));
    setWithdrawRequests((prevRequests) => prevRequests.map((request) => (request._id === withdrawRequestId ? { ...request, paymentMode: mode } : request)));
  };

  const handleWithdrawAction = async (action, userId, withdrawRequestId, withdrawAmount) => {
    try {
      let paymentMode = selectedPaymentModes[withdrawRequestId] || withdrawRequests.find((req) => req._id === withdrawRequestId)?.paymentMode;

      if (action === "approve" && !paymentMode) {
        alert("Please select a payment mode before proceeding.");
        return;
      }

      setDisabledButtons((prev) => {
        const updatedState = { ...prev, [withdrawRequestId]: true };
        localStorage.setItem("disabledButtons", JSON.stringify(updatedState));
        return updatedState;
      });

      const requestBody = {
        userId,
        withdrawRequestId,
        action,
        withdrawAmount: Number(withdrawAmount),
        modeOfPayment: action === "approve" ? paymentMode : "N/A", // Set "N/A" for rejection
      };

      //console.log("🔵 Sending Request Body:", requestBody);

      const { data } = await axios.post(`${BASE_URL}api/update-withdraw-status`, requestBody);

      if (data?.updatedRequest) {
        // Remove the updated request from the lists
        setWithdrawRequests((prevRequests) => prevRequests.filter((request) => request._id !== withdrawRequestId));

        setFilteredRequests((prevRequests) => prevRequests.filter((request) => request._id !== withdrawRequestId));

        // 🛠️ Update the local state to reflect removed payment mode
        setSelectedPaymentModes((prevModes) => {
          const updatedModes = { ...prevModes };
          delete updatedModes[withdrawRequestId];
          localStorage.setItem("selectedPaymentModes", JSON.stringify(updatedModes));
          return updatedModes;
        });

        alert(`✅ Withdrawal ${action}d successfully!`);
      } else {
        alert("❌ Action failed. Please check the backend response.");
      }
    } catch (error) {
      console.error("⚠️ Error in handleWithdrawAction:", error.response?.data);
      alert(`⚠️ Action failed: ${error.response?.data?.error || "An error occurred"}`);
    }
  };

  return (
    <div className="withdraw-approval-container">
      <div className="withdraw-approval-topbar">
        <div className="withdraw-approval-search-box">
          <input type="text" placeholder="Search by User ID or Name..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />
        </div>
        <div className="withdraw-approval-header">
          <strong>Withdraw Approval</strong>
        </div>
      </div>
      <div className="withdraw-approval-table-wrapper">
        <table className="withdraw-approval-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Details</th>
              <th className="bank-data">Bank Details</th>
              <th>Total Earnings</th>
              <th>Withdraw Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Mode of Payment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="10">No withdraw requests found.</td>
              </tr>
            ) : (
              filteredRequests.map((request) => (
                <tr key={request._id}>
                  <td>
                    {request.fullName}
                    <br />({request.userId})
                  </td>
                  <td>
                    <strong>Phone:</strong> {request.phone} <br />
                    <strong>Email:</strong> {request.email}
                  </td>
                  <td className="bank-data">
                    <strong>Bank:</strong> {request.bankName} <br />
                    <strong>Acc No:</strong> {request.accountNumber} <br />
                    <strong>UPI:</strong> {request.upiId} <br />
                    <strong>IFSC Code:</strong> {request.ifscCode} <br />
                    <strong>Branch Name:</strong> {request.branchName}
                    <br />
                    <strong>Phonepe Number:</strong> {request.phonepeNumber}
                  </td>
                  <td>₹{request.totalEarnings}</td>
                  <td>₹{request.withdrawAmount}</td>
                  <td>{request.requestDate ? new Date(request.requestDate).toLocaleDateString("en-GB") : "N/A"}</td>
                  <td>{request.status}</td>
                  <td>
                    {request.status?.toLowerCase() !== "pending" ? (
                      <span>{request.paymentMode || "N/A"}</span>
                    ) : (
                      <select value={selectedPaymentModes[request._id] || ""} onChange={(e) => handlePaymentModeSelect(request._id, e.target.value)}>
                        <option value="">Select</option>
                        <option value="PhonePe/Googlepay/Paytm">PhonePe/Googlepay/Paytm</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="UPI ID">UPI ID</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <button
                      className={`withdraw-approval-approve-btn ${disabledButtons[request._id] ? "withdraw-approval-disabled-btn" : ""}`}
                      onClick={() => handleWithdrawAction("approve", request.userId, request._id, request.withdrawAmount)}
                      disabled={disabledButtons[request._id]}
                    >
                      Approve
                    </button>

                    <button
                      className={`withdraw-approval-reject-btn ${disabledButtons[request._id] ? "withdraw-approval-disabled-btn" : ""}`}
                      onClick={() => handleWithdrawAction("reject", request.userId, request._id, request.withdrawAmount)}
                      disabled={disabledButtons[request._id]}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WithdrawApproval;
