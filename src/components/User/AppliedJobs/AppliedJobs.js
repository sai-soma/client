import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AppliedJobs.css";
import { useStateContext } from "../../../context/StateContext";
import { FaSearch } from "react-icons/fa";

const AppliedJobs = () => {
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [referralStatus, setReferralStatus] = useState({
    inProgress: 0,
    rejected: 0,
    selected: 0,
    joined: 0,
    resigned: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const { user } = useStateContext();
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user?.userId) {
      fetchAppliedJobs(user.userId);
      fetchReferralStatus(user.userId);
    }
  }, [user]);

  const fetchAppliedJobs = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}api/applications/user/${userId}`);
      const applications = response.data.applications || [];

      // Sort applications by appliedAt in descending order
      const sortedApplications = applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

      setAppliedJobs(sortedApplications);

      // Fetch job details for each application
      sortedApplications.forEach((job) => {
        if (job?.jobId && typeof job.jobId === "string") {
          fetchJobDetails(job.jobId);
        }
      });
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const fetchJobDetails = async (jobId) => {
    if (!jobId || typeof jobId !== "string") return;
    try {
      const response = await axios.get(`${BASE_URL}api/jobs/${jobId}`);
      if (response.data.job) {
        setJobDetails((prev) => ({
          ...prev,
          [jobId]: response.data.job,
        }));
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`Job not found for jobId ${jobId}`);
      } else {
        console.error(`Error fetching job details for jobId ${jobId}:`, error);
      }
    }
  };

  const fetchReferralStatus = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}api/applications/user/${userId}`);
      const applications = response.data.applications || [];
      const statusCount = applications.reduce(
        (acc, job) => {
          if (job.status === "inProgress") acc.inProgress++;
          if (job.status === "rejected") acc.rejected++;
          if (job.status === "selected") acc.selected++;
          if (job.status === "joined") acc.joined++;
          if (job.status === "resigned") acc.resigned++;
          return acc;
        },
        { inProgress: 0, rejected: 0, selected: 0, joined: 0, resigned: 0 }
      );
      setReferralStatus(statusCount);
    } catch (error) {
      console.error("Error fetching referral status:", error);
    }
  };

  // Filtered and paginated jobs
  const filteredJobs = appliedJobs.filter((job) => job?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalPages = Math.ceil(filteredJobs.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentJobs = filteredJobs.slice(startIndex, startIndex + entriesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="aj-dashboard-container">
      <div className="aj-header">
        <div className="aj-profile-info">
          <h2>{user?.fullName || "User Name"}</h2>
          <p>{user?.email || "user@example.com"}</p>
        </div>

        <div className="aj-stats-section">
          <div className="aj-stat-card aj-in-progress">
            <div className="aj-stat-icon">⏳</div>
            <div className="aj-number">{referralStatus.inProgress}</div>
            <div className="aj-label">In Progress</div>
          </div>
          <div className="aj-stat-card aj-rejected">
            <div className="aj-stat-icon">✕</div>
            <div className="aj-number">{referralStatus.rejected}</div>
            <div className="aj-label">Rejected</div>
          </div>
          <div className="aj-stat-card aj-selected">
            <div className="aj-stat-icon">✔</div>
            <div className="aj-number">{referralStatus.selected}</div>
            <div className="aj-label">Selected</div>
          </div>
          <div className="aj-stat-card aj-joined">
            <div className="aj-stat-icon">🎉</div>
            <div className="aj-number">{referralStatus.joined}</div>
            <div className="aj-label">Joined</div>
          </div>
          <div className="aj-stat-card aj-resigned">
            <div className="aj-stat-icon">🚪</div>
            <div className="aj-number">{referralStatus.resigned}</div>
            <div className="aj-label">Resigned</div>
          </div>
        </div>
      </div>

      <div className="aj-search-input-wrapper">
        <span className="aj-search-icon">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search by candidate name..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="aj-search-input"
        />
      </div>
      <br />
      <div className="aj-referrals-section">
        <table className="aj-referral-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Job Name</th>
              <th>Company Code</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.length > 0 ? (
              currentJobs.map((job, index) => {
                const jobDetail = job.jobId ? jobDetails[job.jobId] || {} : {};
                const statusClass = `aj-status-${job.status}`;
                let statusIcon = "☐";
                if (job.status === "inProgress") statusIcon = "⏳";
                else if (job.status === "rejected") statusIcon = "✕";
                else if (job.status === "selected") statusIcon = "✔";
                else if (job.status === "joined") statusIcon = "🎉";
                else if (job.status === "resigned") statusIcon = "🚪";

                return (
                  <tr key={index} className="aj-referral-row">
                    <td className="aj-candidate-cell">{job?.name || "Unknown"}</td>
                    <td className="aj-job-cell">{jobDetail?.jobTitle || "Loading..."}</td>
                    <td className="aj-company-cell">{jobDetail?.companyCode || "Loading..."}</td>
                    <td className="aj-email-cell">
                      {job.appliedAt
                        ? new Date(job.appliedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className={`aj-status-badge ${statusClass}`}>
                      <span>{statusIcon}</span>
                      <span>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="aj-no-jobs">
                  No applied jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="page-button">
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => handlePageChange(i + 1)} className={`page-button ${currentPage === i + 1 ? "active" : ""}`} disabled={currentPage !== i + 1}>
              {i + 1}
            </button>
          ))}

          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="page-button">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
