import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";
import "./UpdateJobStatus.css";

const UpdateJobStatus = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [walletUpdate, setWalletUpdate] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const applicationsPerPage = 10;
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}api/applications/all`);
      let fetchedApplications = response.data.applications || [];

      // Sort by appliedAt date: latest first
      fetchedApplications.sort((a, b) => {
        const dateA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const dateB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return dateB - dateA;
      });

      const walletStatus = {};
      fetchedApplications.forEach((app) => {
        if (app.status === "joined") {
          walletStatus[app._id] = true;
        }
      });

      setApplications(fetchedApplications);
      setWalletUpdate(walletStatus);
    } catch (error) {
      toast.error("Failed to load applications. Please try again.");
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (applicationId, userId, jobId, newStatus, referralAmount) => {
    try {
      const statusMap = {
        inProgress: "inProgress",
        pending: "pending",
        rejected: "rejected",
        selected: "selected",
        joined: "joined",
        resigned: "resigned",
      };

      const formattedStatus = statusMap[newStatus] || newStatus;

      await axios.put(`${BASE_URL}api/applications/update/${applicationId}`, {
        status: formattedStatus,
      });

      if (walletUpdate[applicationId] && formattedStatus !== "joined") {
        const joinedDate = new Date(applications.find((app) => app._id === applicationId)?.appliedAt);
        const today = new Date();
        const diffDays = Math.floor((today - joinedDate) / (1000 * 60 * 60 * 24));

        if (diffDays <= 90) {
          handleDeductFromWallet(userId, applicationId);
          setWalletUpdate((prev) => {
            const updatedWallet = { ...prev };
            delete updatedWallet[applicationId];
            return updatedWallet;
          });
          toast.success("Referral amount deducted successfully!");
        } else {
          toast.info("Joined more than 90 days ago. No deduction made.");
        }
      }

      if (formattedStatus === "joined" && !walletUpdate[applicationId]) {
        handleAddToWallet(userId, applicationId, referralAmount);
        setWalletUpdate((prev) => ({
          ...prev,
          [applicationId]: true,
        }));
        toast.success("Referral amount added successfully!");
      }

      toast.success("Status updated successfully!");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update status, please try again.");
    }
  };

  const handleAddToWallet = async (userId, applicationId, referralAmount) => {
    try {
      await fetch(`${BASE_URL}api/wallet/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, applicationId, amount: referralAmount }),
      });
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const handleDeductFromWallet = async (userId, applicationId) => {
    try {
      await fetch(`${BASE_URL}api/wallet/deduct`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, applicationId }),
      });
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
  };

  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    return app.name.toLowerCase().includes(query) || app.email.toLowerCase().includes(query);
  });

  // Pagination logic
  const indexOfLast = currentPage * applicationsPerPage;
  const indexOfFirst = indexOfLast - applicationsPerPage;
  const currentApplications = filteredApplications.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredApplications.length / applicationsPerPage);

  // Helper to format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="admin-job-status-container">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="admin-job-status-header">
        <h2 className="admin-job-status-title">Manage Job Applications</h2>
        <div className="admin-job-status-search-wrapper">
          <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="admin-job-status-search-input" />
          <button className="admin-job-status-search-button" onClick={handleSearchClick}>
            <FaSearch />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-job-status-loading">Loading applications...</p>
      ) : (
        <>
          <table className="admin-job-status-table">
            <thead>
              <tr>
                <th>Applicant Name(Referred by)</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Job Title</th>
                <th>Company</th>
                <th>Resume</th>
                <th>Applied At</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {currentApplications.length > 0 ? (
                currentApplications.map((app) => (
                  <tr key={app._id}>
                    <td>{app.name}<br/>({app.userId})</td>
<td className="email-cell">{app.email}</td>
                    <td>{app.mobile}</td>
                    <td>{app.jobId?.jobTitle || "N/A"}</td>
                    <td>{app.jobId?.companyCode || "N/A"}</td>
                    <td>
                      <a href={app.resume} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </td>
                    <td>{formatDate(app.appliedAt)}</td> {/* Here */}
                    <td>
                      <span className={`admin-job-status-badge admin-job-status-${app.status}`}>{app.status}</span>
                    </td>
                    <td>
                      <select value={app.status} onChange={(e) => handleStatusUpdate(app._id, app.userId, app.jobId?._id, e.target.value, app.referralAmount)} className="admin-job-status-dropdown">
                        <option value="pending">Pending</option>
                        <option value="inProgress">In Progress</option>
                        <option value="rejected">Rejected</option>
                        <option value="selected">Selected</option>
                        <option value="joined">Joined</option>
                        <option value="resigned">Resigned</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="admin-job-status-no-data">
                    No job applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="admin-job-status-pagination">
            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Prev
            </button>
            {[...Array(totalPages).keys()].map((num) => (
              <button key={num + 1} onClick={() => setCurrentPage(num + 1)} className={currentPage === num + 1 ? "active-page" : ""}>
                {num + 1}
              </button>
            ))}
            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UpdateJobStatus;