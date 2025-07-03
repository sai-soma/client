import React, { useEffect, useState } from "react";
import "./FeedbackList.css";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`${BASE_URL}api/totalfeedback`);
      const data = await response.json();

      if (response.ok) {
        setFeedbacks(data);
      } else {
        setError("Failed to load feedback");
      }
    } catch (error) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedFeedbacks = [...feedbacks].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedFeedbacks.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentFeedbacks = sortedFeedbacks.slice(indexOfFirst, indexOfLast);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="FL-container">
      <h2 className="FL-heading">Feedback Received</h2>

      {loading && <div className="FL-loading">Loading feedback...</div>}
      {error && <div className="FL-error">{error}</div>}

      {feedbacks.length === 0 && !loading ? (
        <div className="FL-no-data">No feedback available.</div>
      ) : (
        <>
          <div className="FL-table-wrapper">
            <table className="FL-table">
              <thead className="FL-thead">
                <tr className="FL-header-row">
                  <th className="FL-th" onClick={() => requestSort("fullName")}>
                    Name
                  </th>
                  <th className="FL-th" onClick={() => requestSort("email")}>
                    Email
                  </th>
                  <th className="FL-th" onClick={() => requestSort("priority")}>
                    Priority
                  </th>
                  <th className="FL-th" onClick={() => requestSort("createdAt")}>
                    Date
                  </th>
                  <th className="FL-th">Feedback</th>
                </tr>
              </thead>
              <tbody className="FL-tbody">
                {currentFeedbacks.map((item) => (
                  <tr key={item._id} className="FL-row">
                    <td className="FL-cell">{item.fullName}</td>
                    <td className="FL-cell">{item.email}</td>
                    <td className={`FL-cell FL-priority-${item.priority.toLowerCase()}`}>{item.priority}</td>
                    <td className="FL-cell">{new Date(item.createdAt).toLocaleString()}</td>
                    <td className="FL-cell">{item.feedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="FL-pagination">
            <button className="FL-page-btn" onClick={handlePrev} disabled={currentPage === 1}>
              &lt; Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} className={`FL-page-btn ${currentPage === i + 1 ? "active" : ""}`} onClick={() => setCurrentPage(i + 1)}>
                {i + 1}
              </button>
            ))}

            <button className="FL-page-btn" onClick={handleNext} disabled={currentPage === totalPages}>
              Next &gt;
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackList;
