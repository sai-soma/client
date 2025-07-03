import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import companyLogo from "../../../assets/herosection/lyroslogo.jpg";
import { useStateContext } from "../../../context/StateContext";
import "./JobListing.css";
import { FaIdBadge, FaSearch, FaGraduationCap, FaTools, FaMoneyBillWave, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../../LoadingSpinner";

const JobListing = ({ employmentTypeFilter }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [applicationCounts, setApplicationCounts] = useState({});
  const { user } = useStateContext();
  const userId = useMemo(() => user?.userId, [user]);
  const BASE_URL = process.env.REACT_APP_API_URL;

  const [application, setApplication] = useState({
    email: "",
    mobile: "",
    yearOfPassing: "",
    resume: null,
  });

  // Filter jobs by employment type
  const filterJobsByType = useCallback(
    (jobs) => {
      if (!employmentTypeFilter) return jobs;

      const filtered = jobs.filter((job) => {
        if (employmentTypeFilter === "Fulltime") {
          return job.employmentType === "Fulltime" || job.employmentType === "Fulltime/Parttime";
        } else if (employmentTypeFilter === "Parttime") {
          return job.employmentType === "Parttime" || job.employmentType === "Fulltime/Parttime";
        } else if (employmentTypeFilter === "Contract/Freelance") {
          return job.employmentType === "Contract" || job.employmentType === "Freelance";
        }
        return false; // <- This ensures it doesn't fallback to all jobs
      });

      if (filtered.length === 0) {
        toast.info(`No ${employmentTypeFilter} jobs found.`);
      }

      return filtered;
    },
    [employmentTypeFilter]
  );

  // Fetch all jobs from API
  const fetchJobs = useCallback(async () => {
    setLoading(true); // Start loading

    try {
      const response = await axios.get(`${BASE_URL}api/jobs/all`);

      if (response.data && Array.isArray(response.data.jobs)) {
        // Filter, sort and limit jobs
        const filteredJobs = filterJobsByType(response.data.jobs);
        const sortedJobs = filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const latestJobs = sortedJobs.slice(0, 10);
        // await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 seconds delay for loading spinner check

        setJobs(latestJobs);

        // Fetch application counts if jobs exist
        if (latestJobs.length > 0) {
          try {
            await fetchApplicationCounts(latestJobs.map((job) => job._id));
          } catch (error) {
            console.error("Failed to fetch application counts", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching jobs", error);
    } finally {
      setLoading(false); // End loading
    }
  }, [BASE_URL, filterJobsByType]);

  // Fetch application counts for specific jobs
  const fetchApplicationCounts = useCallback(
    async (jobIds) => {
      try {
        const jobIdsParam = jobIds.join(",");
        const response = await axios.get(`${BASE_URL}api/applications/counts?jobIds=${jobIdsParam}`);
        if (response.data) {
          setApplicationCounts(response.data);
        }
      } catch (error) {
        console.error("Error fetching application counts", error);
      }
    },
    [BASE_URL]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle job application modal opening
  const handleApply = async (job) => {
    setSelectedJob(job);
    setShowModal(true);
    setApplyLoading(true); // Start loading

    try {
      const response = await axios.get(`${BASE_URL}api/resumes/${userId}`);

      if (response.data.length > 0) {
        const firstResume = response.data[0];
        setResumes(response.data);
        setSelectedResumeId(firstResume._id);
        setApplication((prev) => ({
          ...prev,
          email: firstResume.email || "",
          mobile: firstResume.phone || "",
          yearOfPassing: firstResume.yearOfPassing || "",
          resume: `${BASE_URL}`+firstResume.resumeFile,
        }));
      }
    } catch (error) {
      console.error("Error fetching resumes", error);
      toast.error("Failed to fetch resumes. Please try again.");
    } finally {
      setApplyLoading(false); // End loading
    }
  };

  const handleMoreDetails = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  // Update form fields based on selected resume
  const updateFormFields = (resume) => {
    setApplication({
      email: resume.email || "",
      mobile: resume.phone || "",
      yearOfPassing: resume.yearOfPassing || "",
      resume: resume.resumeFile ? `${BASE_URL}${resume.resumeFile}` : null,
    });
  };

  // Handle resume selection change
  const handleResumeChange = async (e) => {
    const selectedId = e.target.value;
    setSelectedResumeId(selectedId);
    setResumeLoading(true); // Start loading

    if (selectedId === "self") {
      try {
        const response = await axios.get(`${BASE_URL}api/auth/user/${user.userId}`);
        const userData = response.data;

        if (userData) {
          setApplication({
            email: userData.email || "",
            mobile: userData.phone || "",
            yearOfPassing: "",
            resume: userData.resumes ? `${BASE_URL}${userData.resumes}` : null,
          });
        }
      } catch (error) {
        console.error("Error fetching user data", error);
        toast.error("Failed to fetch user data. Please try again.");
      }
    } else {
      const selectedResume = resumes.find((resume) => resume._id === selectedId);
      if (selectedResume) {
        updateFormFields(selectedResume);
      }
    }

    setResumeLoading(false); // End loading
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setApplication({ ...application, resume: e.target.files[0] });
  };

  // Handle input field changes
  const handleInputChange = (e) => {
    setApplication({ ...application, [e.target.name]: e.target.value });
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDetailsModal(false);
    setSelectedJob(null);
    setApplyLoading(false);
    setResumeLoading(false);
    setSubmitLoading(false);
  };

  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true); // Start loading

    if (!userId) {
      toast.error("User ID is missing! Please log in again.");
      setSubmitLoading(false);
      return;
    }

    let selectedResume = resumes.find((resume) => resume._id === selectedResumeId);

    if (selectedResumeId === "self") {
      try {
        const response = await axios.get(`${BASE_URL}api/auth/user/${userId}`);
        selectedResume = response.data;
      } catch (error) {
        console.error("Error fetching user data", error);
        toast.error("Failed to fetch user details. Please try again.");
        setSubmitLoading(false);
        return;
      }
    }

    if (!selectedResume) {
      toast.warning("Please select a valid resume.");
      setSubmitLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("userId", user.userId);
    formData.append("name", selectedResume.fullName || `${selectedResume.firstName} ${selectedResume.surname}`);
    formData.append("resumeId", selectedResumeId === "self" ? "self-applied" : selectedResumeId);
    formData.append("email", application.email);
    formData.append("mobile", application.mobile);
    formData.append("yearOfPassing", application.yearOfPassing);
    formData.append("resume", application.resume);
    formData.append("jobId", selectedJob._id);

    try {
      await axios.post(`${BASE_URL}api/applications/apply`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Application submitted successfully!");

      // Update the application count locally
      setApplicationCounts((prev) => ({
        ...prev,
        [selectedJob._id]: (prev[selectedJob._id] || 0) + 1,
      }));

      setShowModal(false);
    } catch (error) {
      console.error("Error submitting application", error);

      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } finally {
      setSubmitLoading(false); // End loading
    }
  };

  // Get application count for a specific job
  const getApplicationCount = (jobId) => {
    return applicationCounts[jobId] || 0;
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) => {
    return (
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.jobLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <div className="user-dashboard1">
        <div className="user-navbar">
          <div className="user-search-container">
            <FaSearch className="user-search-icon" />
            <input type="text" placeholder="Search jobs..." className="user-search-bar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="user-job-list">
          <h1>{employmentTypeFilter} Job Notifications :</h1>
          <hr />
          {loading ? (
            <LoadingSpinner text="Fetching latest jobs..." />
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div key={job._id} className="user-job-card">
                <div className="job-details">
                  <h4>
                    <FaIdBadge style={{ marginRight: "8px", color: "#4A90E2" }} />
                    Job ID : {job.companyCode}
                  </h4>
                  <h1>
                    <strong>Role :</strong> {job.jobTitle}
                    <span className="application-count">
                      <FaUsers style={{ marginRight: "5px", color: "#2A9D8F" }} />
                      {getApplicationCount(job._id)} applications
                    </span>
                  </h1>
                  <p>
                    <FaGraduationCap style={{ marginRight: "8px", color: "#F4A261" }} />
                    <strong>Qualification :</strong> {job.qualification}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <FaTools style={{ marginRight: "8px", color: "#2A9D8F" }} />
                    <strong>Skills :</strong> {job.skills.join(", ")}
                  </p>
                  <p>
                    <FaMoneyBillWave style={{ marginRight: "8px", color: "#E76F51" }} />
                    <strong>Package :</strong> {job.package}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <FaBriefcase style={{ marginRight: "8px", color: "#E9C46A" }} />
                    <strong>Employment Type :</strong> {job.employmentType}
                  </p>
                  <p>
                    <FaMapMarkerAlt style={{ marginRight: "8px", color: "#264653" }} />
                    <strong>Location :</strong> {job.jobLocation}
                  </p>
                </div>
                <div className="company-section">
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="company-logo"
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop if fallback also fails
                      e.target.src = require("../../../assets/herosection/lyroslogo.jpg");
                    }}
                  />
                  <div className="buttons">
                    <button className="apply-btn" onClick={() => handleApply(job)} disabled={applyLoading && selectedJob?._id === job._id}>
                      {applyLoading && selectedJob?._id === job._id ? "Loading..." : "Apply"}
                    </button>
                    <button className="details-btn" onClick={() => handleMoreDetails(job)}>
                      More Details
                    </button>
                    <p className="job-posted-on">
                      <FaCalendarAlt style={{ marginRight: "5px", color: "#8ECAE6" }} />
                      Job Posted On : {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No jobs found for "{employmentTypeFilter}" filter. Try a different type or search term.</p>
          )}
        </div>

        {showModal && (
          <div className="modal-overlays">
            <div className="modal-container">
              <h2 className="modal-title">Apply for {selectedJob?.jobTitle}</h2>

              {applyLoading ? (
                <LoadingSpinner text="Loading application form..." />
              ) : (
                <form onSubmit={handleSubmit} className="modal-form">
                  <label htmlFor="resumeId" className="modal-label">
                    For Whom you are Applying:
                  </label>
                  <select id="resumeId" name="resumeId" required value={selectedResumeId} onChange={handleResumeChange} className="modal-select" disabled={resumeLoading || submitLoading}>
                    <option value="self">I (Myself)</option>
                    {resumes.map((resume) => (
                      <option key={resume._id} value={resume._id}>
                        {resume.firstName} {resume.surname}
                      </option>
                    ))}
                  </select>

                  {resumeLoading && <LoadingSpinner text="Loading resume data..." />}

                  <label htmlFor="email" className="modal-label">
                    Email:
                  </label>
                  <input id="email" type="email" name="email" placeholder="Enter your email" required value={application.email} onChange={handleInputChange} className="modal-input" disabled={resumeLoading || submitLoading} />

                  <label htmlFor="mobile" className="modal-label">
                    Mobile Number:
                  </label>
                  <input id="mobile" type="tel" name="mobile" placeholder="Enter your mobile number" required value={application.mobile} onChange={handleInputChange} className="modal-input" disabled={resumeLoading || submitLoading} />

                  <label htmlFor="yearOfPassing" className="modal-label">
                    Year of Passing:
                  </label>
                  <input
                    id="yearOfPassing"
                    type="number"
                    name="yearOfPassing"
                    placeholder="Enter year of passing"
                    required
                    value={application.yearOfPassing}
                    onChange={handleInputChange}
                    className="modal-input"
                    disabled={resumeLoading || submitLoading}
                  />

                  <label htmlFor="resumeFile" className="modal-label">
                    Upload Resume:
                  </label>
                  <input id="resumeFile" type="file" name="resume" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="modal-file-input" disabled={resumeLoading || submitLoading} />

                  {application.resume && (
                    <p className="modal-resume-link">
                      Current Resume:
                      <a href={`${application.resume}`} target="_blank" rel="noopener noreferrer">
                        View Resume
                      </a>
                    </p>
                  )}

                  {submitLoading ? (
                    <LoadingSpinner text="Submitting application..." />
                  ) : (
                    <>
                      <button type="submit" className="modal-submit-btn" disabled={resumeLoading}>
                        Submit
                      </button>
                      <button type="button" className="modal-cancel-btn" onClick={() => setShowModal(false)} disabled={submitLoading}>
                        Cancel
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        )}
        {showDetailsModal && selectedJob && (
          <div className="job-details-overlay">
            <div className="job-details-box">
              <button className="job-details-close" onClick={closeModal}>
                ✖
              </button>
              <h2>{selectedJob.jobTitle}</h2>
              <p>
                <strong>Company Code:</strong> {selectedJob.companyCode}
              </p>
              <p>
                <strong>Job Location:</strong> {selectedJob.jobLocation}
              </p>
              <p>
                <strong>Package:</strong> ₹{selectedJob.package}
              </p>
              <p>
                <strong>Experience:</strong> {selectedJob.experience} year(s)
              </p>
              <p>
                <strong>Employment Type:</strong> {selectedJob.employmentType}
              </p>
              <p>
                <strong>Notice Period:</strong> {selectedJob.noticePeriod} days
              </p>
              <p>
                <strong>Qualification:</strong> {selectedJob.qualification}
              </p>
              <p>
                <strong>Referral Amount:</strong> ₹{selectedJob.referralAmount}
              </p>
              <p>
                <strong>Skills:</strong> {selectedJob.skills.join(", ")}
              </p>
              <p>
                <strong>Description:</strong> {selectedJob.jobDescription}
              </p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default JobListing;
