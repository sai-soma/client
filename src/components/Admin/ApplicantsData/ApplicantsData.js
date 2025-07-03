import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./ApplicantsData.css";

const ApplicantsData = ({ jobId, onClose }) => {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchApplicantsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}api/applications/all`);
        const jobApplicants = response.data.applications.filter(
          (application) => application.jobId._id === jobId
        );
        setApplicants(jobApplicants);
        
        const jobResponse = await axios.get(`${BASE_URL}api/jobs/${jobId}`);
        setJobDetails(jobResponse.data.job);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applicants data:", err);
        setError("Failed to load applicants data. Please try again.");
        setLoading(false);
      }
    };

    fetchApplicantsData();
  }, [jobId]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(applicants.map(applicant => ({
      "User ID": applicant.userId,
      "Name": applicant.name,
      "Email": applicant.email,
      "Phone": applicant.mobile,
      "Resume": applicant.resume ? "Available" : "No Resume",
      "Status": applicant.status
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants Data");
    XLSX.writeFile(workbook, "ApplicantsData.xlsx");
  };

  if (loading) return <div className="applicants-loading">Loading applicants data...</div>;
  if (error) return <div className="applicants-error">{error}</div>;

  return (
    <div className="applicants-data-container">
      <div className="applicants-header">
        <h2>Applications for: {jobDetails?.jobTitle || "Job"}</h2>
        <button className="applicants-data-close-btn" onClick={onClose}>×</button>
      </div>
      
      <button className="export-excel-btn" onClick={exportToExcel}>Download Excel</button>
      
      {applicants.length === 0 ? (
        <div className="no-applicants">No applications for this job yet.</div>
      ) : (
        <div className="applicants-table-container">
          <table className="applicants-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Resume</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((applicant) => (
                <tr key={applicant._id}>
                  <td>{applicant.userId}</td>
                  <td>{applicant.name}</td>
                  <td>{applicant.email}</td>
                  <td>{applicant.mobile}</td>
                  <td>
                    {applicant.resume ? (
                      <a 
                        href={`${BASE_URL}${applicant.resume}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="resume-link"
                      >
                        View Resume
                      </a>
                    ) : (
                      "No Resume"
                    )}
                  </td>
                  <td>
                    {applicant.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicantsData;