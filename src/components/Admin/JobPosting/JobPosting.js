import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./JobPosting.css";
import { useNotification } from "../../../context/NotificationContext";
import { FaUsers } from "react-icons/fa";
import ApplicantsData from "../ApplicantsData/ApplicantsData";

const JobPosting = () => {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [showApplicants, setShowApplicants] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState(null);
  const { addNotification } = useNotification();
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [newJob, setNewJob] = useState({
    companyCode: "",
    jobTitle: "",
    jobDescription: "",
    package: "",
    referralAmount: "",
    qualification: "",
    employmentType: "",
    jobLocation: "",
    noticePeriod: "",
    experience: "",
    skills: "",
    additionalDetails: "",
  });

  // Fetch application counts for specific jobs
  const fetchApplicationCounts = useCallback(async (jobIds) => {
    try {
      const jobIdsParam = jobIds.join(',');
      const response = await axios.get(`${BASE_URL}api/applications/counts?jobIds=${jobIdsParam}`);
      if (response.data) {
        setApplicationCounts(response.data);
       //console.log("sample" + applicationCounts)
      }
    } catch (error) {
      console.error("Error fetching application counts", error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/jobs/all`);

      // Sort jobs by createdAt in descending order (latest first)
      const sortedJobs = response.data.jobs.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setJobs(sortedJobs);

      // After getting jobs, fetch application counts
      if (sortedJobs.length > 0) {
        try {
          await fetchApplicationCounts(sortedJobs.map(job => job._id));
        } catch (error) {
          console.error("Failed to fetch application counts", error);
        }
      }
    } catch (error) {
      console.error("Error fetching jobs", error);
    }
  }, [fetchApplicationCounts]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Get application count for a specific job
  const getApplicationCount = (jobId) => {
    return applicationCounts[jobId] || 0;
  };

  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert skills from string to array
    const jobData = { ...newJob, skills: newJob.skills.split(",").map(skill => skill.trim()) };

    try {
      let jobId = currentJobId;

      // Create or update job
      const jobResponse = isEditing
        ? await axios.put(`${BASE_URL}api/jobs/${currentJobId}`, jobData)
        : await axios.post(`${BASE_URL}api/jobs/create`, jobData);

      if (!isEditing) {
        jobId = jobResponse.data.job._id;
      }

      // Optimistically reset form for better UX
      resetForm();

      // Fire notification creation (parallel to fetchJobs)
      const notificationPayload = {
        message: `${isEditing ? "Job updated" : "New job posted"}: ${jobData.jobTitle} at ${jobData.companyCode}`,
        jobId,
        type: isEditing ? "job_update" : "job_post",
      };

      const notificationRequest = axios.post(`${BASE_URL}api/notifications/create`, notificationPayload)
        .catch(() => {
          // Fallback to local notification if API fails
          if (typeof addNotification === 'function') {
            addNotification({
              _id: Date.now(),
              message: notificationPayload.message,
              jobId,
              isRead: false,
              createdAt: new Date(),
            });
          }
        });

      // Fetch jobs in parallel with notification
      await Promise.all([
        notificationRequest,
        fetchJobs(),
      ]);

    } catch (error) {
      console.error(isEditing ? "Error updating job" : "Error posting job", error);
    }
  };

  const handleEdit = async (jobId) => {
    try {
      const response = await axios.get(`${BASE_URL}api/jobs/${jobId}`);
      const jobToEdit = response.data.job;

      setNewJob({
        companyCode: jobToEdit.companyCode,
        jobTitle: jobToEdit.jobTitle,
        jobDescription: jobToEdit.jobDescription,
        package: jobToEdit.package,
        referralAmount: jobToEdit.referralAmount,
        qualification: jobToEdit.qualification,
        employmentType: jobToEdit.employmentType,
        jobLocation: jobToEdit.jobLocation,
        noticePeriod: jobToEdit.noticePeriod,
        experience: jobToEdit.experience,
        skills: Array.isArray(jobToEdit.skills) ? jobToEdit.skills.join(", ") : "",
        additionalDetails: jobToEdit.additionalDetails || "",
      });

      setIsEditing(true);
      setCurrentJobId(jobId);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching job for edit", error);
    }
  };

  const handleDelete = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        await axios.delete(`${BASE_URL}api/jobs/${jobId}`);

        // Create notification for job deletion
        if (typeof addNotification === 'function') {
          try {
            await axios.post("${BASE_URL}api/notifications/create", {
              message: "Job posting has been deleted",
              type: "job_delete"
            });
          } catch (notificationError) {
           //console.log("Notification API unavailable, using local notification only");
            addNotification({
              _id: Date.now(),
              message: "Job posting has been deleted",
              isRead: false,
              createdAt: new Date()
            });
          }
        }

        fetchJobs();
      } catch (error) {
        console.error("Error deleting job", error);
      }
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentJobId(null);
    setNewJob({
      companyCode: "",
      jobTitle: "",
      jobDescription: "",
      package: "",
      referralAmount: "",
      qualification: "",
      employmentType: "",
      jobLocation: "",
      noticePeriod: "",
      experience: "",
      skills: "",
      additionalDetails: "",
    });
  };

  const handleViewApplicants = (jobId) => {
    setSelectedJobForApplicants(jobId);
    setShowApplicants(true);
  };

  const closeApplicantsView = () => {
    setShowApplicants(false);
    setSelectedJobForApplicants(null);
  };

  const filteredJobs = jobs.filter((job) =>
    job?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="admin-content-wrapper">
        <div className="admin-main-content">
          <div className="admin-navbar">
            <input
              type="text"
              placeholder="Search jobs..."
              className="admin-search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="admin-post-job-btn" onClick={() => setShowModal(true)}>
              Post Job
            </button>
          </div>

          <div className="admin-job-list">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="admin-job-card"
                >
                  <div className="admin-job-card-header">
                    <div className="admin-job-title-wrapper">
                      <h3>{job.jobTitle}</h3>
                      <span
                        className="application-count"
                        onClick={() => handleViewApplicants(job._id)}
                        title="Click to view applicants"
                      >
                        <FaUsers style={{ marginRight: "5px", color: "#2A9D8F" }} />
                        {getApplicationCount(job._id)} applications
                      </span>
                    </div>
                    <div className="admin-job-actions">
                      <button
                        className="admin-edit-btn"
                        onClick={() => handleEdit(job._id)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(job._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p><strong>Company:</strong> {job.companyCode}</p>
                  <p><strong>Package:</strong> {job.package}</p>
                  <p><strong>Referral Amount:</strong> ₹{job.referralAmount}</p>
                  <p><strong>Location:</strong> {job.jobLocation}</p>
                  <p><strong>Experience:</strong> {job.experience} years</p>
                  <p><strong>Employment Type:</strong> {job.employmentType}</p>
                  <p><strong>Notice Period:</strong> {job.noticePeriod}</p>
                  <p><strong>Skills:</strong> {Array.isArray(job.skills) ? job.skills.join(", ") : "N/A"}</p>
                </div>
              ))
            ) : (
              <p>No jobs found</p>
            )}
          </div>
        </div>

        {showModal && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <h2 className="job-post-title">{isEditing ? "Edit Job" : "Post a New Job"}</h2>
              <form onSubmit={handleSubmit}>
                <input type="text" name="companyCode" placeholder="Company Code" value={newJob.companyCode} onChange={handleChange} required />
                <input type="text" name="jobTitle" placeholder="Job Title" value={newJob.jobTitle} onChange={handleChange} required />
                <textarea name="jobDescription" placeholder="Job Description" value={newJob.jobDescription} onChange={handleChange} required></textarea>
                <input type="text" name="package" placeholder="Package" value={newJob.package} onChange={handleChange} required />
                <input type="number" name="referralAmount" placeholder="Referral Amount" value={newJob.referralAmount} onChange={handleChange} required />
                <input type="text" name="qualification" placeholder="Qualification" value={newJob.qualification} onChange={handleChange} required />
                <select name="employmentType" value={newJob.employmentType} onChange={handleChange} required>
                  <option value="">Select Employment Type</option>
                  <option value="Fulltime">Fulltime</option>
                  <option value="Parttime">Parttime</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Fulltime/Parttime">Fulltime/Parttime</option>
                </select>
                <input type="text" name="jobLocation" placeholder="Job Location" value={newJob.jobLocation} onChange={handleChange} required />
                <input type="text" name="noticePeriod" placeholder="Notice Period" value={newJob.noticePeriod} onChange={handleChange} required />
                <input type="number" name="experience" placeholder="Experience (Years)" value={newJob.experience} onChange={handleChange} required />
                <input type="text" name="skills" placeholder="Skills (comma-separated)" value={newJob.skills} onChange={handleChange} required />
                <textarea name="additionalDetails" placeholder="Additional Details (Optional)" value={newJob.additionalDetails} onChange={handleChange}></textarea>

                <button type="submit">{isEditing ? "Update" : "Submit"}</button>
                <button type="button" className="admin-cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {showApplicants && selectedJobForApplicants && (
          <ApplicantsData
            jobId={selectedJobForApplicants}
            onClose={closeApplicantsView}
          />
        )}
      </div>
    </>
  );
};

export default JobPosting;
