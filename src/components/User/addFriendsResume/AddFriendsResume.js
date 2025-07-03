import React, { useState, useEffect, useRef } from "react";
import "./AddFriendsResume.css";

const AddFriendsResume = () => {
  const [formData, setFormData] = useState({
    firstName: "", surname: "", email: "", phone: "", dob: "", location: "", aadharNumber: "", yearOfPassing: "", highestQualification: "", specialization: "", experienceType: '', experience: "", resume: null, skills: "",
  });
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [resumes, setResumes] = useState([]); // Fetched resume details
  const [lastUpdatedResume, setLastUpdatedResume] = useState(null); // Track only the last updated or submitted resume
  const [editResumeId, setEditResumeId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: "", surname: "", email: "", phone: "", dob: "", location: "", aadharNumber: "", yearOfPassing: "", highestQualification: "", specialization: "", experience: "", resumeFile: "", skills: "", newResume: null,
  });
  
  // New state for validation errors
  const [validationErrors, setValidationErrors] = useState({
    dob: "",
    yearOfPassing: "",
    experience: ""
  });

  // New state for delete confirmation popup
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteResumeId, setDeleteResumeId] = useState(null);

  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const BASE_URL = process.env.REACT_APP_API_URL;

  const fetchResumes = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User not logged in. Cannot fetch resumes.");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}api/resumes/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
        
        // Set the last updated resume (assuming resumes are returned in chronological order)
        if (data.length > 0) {
          // Sort resumes by updatedAt or createdAt to get the most recently modified one
          const sortedResumes = [...data].sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return dateB - dateA;
          });
          setLastUpdatedResume(sortedResumes[0]);
        }
      } else {
        console.error("Error fetching resumes");
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Real-time validation function
  const validateField = (name, value) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    let error = "";

    if (name === "dob" && value) {
      const dobDate = new Date(value);
      if (dobDate > today) {
        error = "Date of Birth cannot be in the future.";
      } else {
        const age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        const dayDiff = today.getDate() - dobDate.getDate();
        const isBirthdayPassed = monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0);
        const actualAge = isBirthdayPassed ? age : age - 1;
        
        if (actualAge < 18) {
          error = "You must be at least 18 years old.";
        }
      }
    }

    if (name === "yearOfPassing" && value) {
      const passingYear = parseInt(value);
      if (isNaN(passingYear)) {
        error = "Year of passing must be a valid number.";
      } else if (passingYear > currentYear) {
        error = "Year of passing cannot be in the future.";
      }
    }

    if (name === "experience" && value !== "") {
      const experienceYears = parseFloat(value);
      if (isNaN(experienceYears)) {
        error = "Experience must be a valid number.";
      } else if (experienceYears <= 0) {
        error = "Experience must be greater than 0 years. Use 'Fresher' if no experience.";
      }
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate the field in real-time
    if (name === "dob" || name === "yearOfPassing" || name === "experience") {
      validateField(name, value);
    }

    setFormData((prevData) => {
      if (name === "experienceType" && value === "Fresher") {
        // Clear experience validation error when switching to Fresher
        setValidationErrors(prev => ({
          ...prev,
          experience: ""
        }));
        return { ...prevData, experienceType: value, experience: "" }; // Clear experience if Fresher
      }
      return { ...prevData, [name]: value };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({ ...prevData, resume: file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage("User not logged in. Please login and try again.");
      return;
    }

    if (!formData.experienceType) {
      setMessage("Experience type is required.");
      return;
    }

    // Check if there are any validation errors
    const dobValid = validateField("dob", formData.dob);
    const yearValid = validateField("yearOfPassing", formData.yearOfPassing);
    let experienceValid = true;
    
    // Only validate experience if experienceType is "Experienced"
    if (formData.experienceType === "Experienced") {
      experienceValid = validateField("experience", formData.experience);
    }

    if (!dobValid || !yearValid || !experienceValid) {
      setMessage("Please fix the validation errors before submitting.");
      return;
    }

    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("surname", formData.surname);
    data.append("email", formData.email.toLowerCase());
    data.append("phone", formData.phone);
    data.append("dob", formData.dob);
    data.append("location", formData.location);
    data.append("aadharNumber", formData.aadharNumber);
    data.append("yearOfPassing", formData.yearOfPassing);
    data.append("highestQualification", formData.highestQualification);
    data.append("specialization", formData.specialization);
    data.append("experienceType", formData.experienceType);
    if (formData.experienceType === "Experienced") {
      data.append("experience", formData.experience);
    }
    data.append("resume", formData.resume);
    data.append("skills", formData.skills);

    try {
      const response = await fetch(`${BASE_URL}api/uploadResume/${userId}`, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        setMessage("Submitted Successfully");
        fetchResumes(); // Refresh resume list

        // Reset form
        setFormData({
          firstName: "",
          surname: "",
          email: "",
          phone: "",
          dob: "",
          location: "",
          aadharNumber: "",
          yearOfPassing: "",
          highestQualification: "",
          specialization: "",
          experienceType: "",
          experience: "",
          resume: null,
          skills: "",
        });

        // Reset validation errors
        setValidationErrors({
          dob: "",
          yearOfPassing: "",
          experience: ""
        });

        setFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorResult = await response.json();
        setMessage("Submission failed: " + errorResult.message);
      }
    } catch (error) {
      setMessage("Error uploading resume");
      console.error(error);
    }
  };

  const handleEditClick = (resume) => {
    setEditResumeId(resume._id);
    setEditFormData({
      firstName: resume.firstName,
      surname: resume.surname,
      email: resume.email,
      phone: resume.phone,
      dob: resume.dob ? new Date(resume.dob).toISOString().split('T')[0] : "",
      location: resume.location,
      aadharNumber: resume.aadharNumber,
      yearOfPassing: resume.yearOfPassing,
      highestQualification: resume.highestQualification,
      specialization: resume.specialization,
      experienceType: resume.experienceType,
      experience: resume.experience,
      resumeFile: resume.resumeFile,
      newResume: null,
      skills: resume.skills ? resume.skills.join(", ") : "",
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditFormData((prevData) => ({ ...prevData, newResume: file }));
    }
  };

  const handleSaveClick = async (resumeId) => {
    try {
      let response;
      let updatedData = { ...editFormData };
      if (updatedData.experienceType === "Fresher") {
        delete updatedData.experience;
      }
      if (editFormData.newResume) {
        const updateData = new FormData();
        updateData.append("firstName", updatedData.firstName);
        updateData.append("surname", updatedData.surname);
        updateData.append("email", updatedData.email);
        updateData.append("phone", updatedData.phone);
        updateData.append("dob", updatedData.dob);
        updateData.append("location", updatedData.location);
        updateData.append("aadharNumber", updatedData.aadharNumber);
        updateData.append("yearOfPassing", updatedData.yearOfPassing);
        updateData.append("highestQualification", updatedData.highestQualification);
        updateData.append("specialization", updatedData.specialization);
        updateData.append("experienceType", updatedData.experienceType);
        if (updatedData.experienceType === "Experienced") {
          updateData.append("experience", updatedData.experience);
        }
        updateData.append("resume", editFormData.newResume);
        response = await fetch(`${BASE_URL}api/resumes/${resumeId}`, {
          method: "PUT",
          body: updateData,
        });
      } else {
        response = await fetch(`${BASE_URL}api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        });
      }
      if (response.ok) {
        setEditResumeId(null);
        fetchResumes(); // This will update lastUpdatedResume
      } else {
        console.error("Error updating resume");
      }
    } catch (error) {
      console.error("Error updating resume:", error);
    }
  };

  const handleCancelClick = () => {
    setEditResumeId(null);
  };

  // Show delete confirmation popup
  const handleDeleteClick = (resumeId) => {
    setDeleteResumeId(resumeId);
    setShowDeletePopup(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}api/resumes/${deleteResumeId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // If deleting the last updated resume, we need to fetch the new last one
        if (lastUpdatedResume && lastUpdatedResume._id === deleteResumeId) {
          setLastUpdatedResume(null);
        }
        fetchResumes();
      } else {
        console.error("Error deleting resume");
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
    } finally {
      setShowDeletePopup(false);
      setDeleteResumeId(null);
    }
  };

  // Cancel delete action
  const cancelDelete = () => {
    setShowDeletePopup(false);
    setDeleteResumeId(null);
  };

  return (
    <div className="friends-form-container">
      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this resume? This action cannot be undone.</p>
            <div className="popup-buttons">
              <button onClick={confirmDelete} className="confirm-delete-btn">
                Yes, Delete
              </button>
              <button onClick={cancelDelete} className="cancel-delete-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Box */}
      <div className="form-box">
        <h2>Add Friend's Resume</h2>
        <form onSubmit={handleSubmit}>
          <label className="friends-label">First Name:</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="friends-input" required/>
          
          <label className="friends-label">Surname:</label>
          <input type="text" name="surname" value={formData.surname} onChange={handleChange} className="friends-input" required />
          
          <label className="friends-label">Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="friends-input" required/>
          
          <label className="friends-label">Mobile Number:</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="friends-input" pattern="\d{10}" title="Mobile number must be exactly 10 digits." required/>
          
          <label className="friends-label">Date of Birth:</label>
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="friends-input" required/>
          {validationErrors.dob && <p className="validation-error">{validationErrors.dob}</p>}
          
          <label className="friends-label">Location:</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="friends-input" required/>
          
          <label className="friends-label">Aadhar Number:</label>
          <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} className="friends-input" pattern="\d{12}" title="Aadhar number must be exactly 12 digits." required/>
          
          <label className="friends-label">Year of Passing:</label>
          <input type="number" name="yearOfPassing" value={formData.yearOfPassing} onChange={handleChange} className="friends-input" pattern="\d{4}" title="Year Of Passing." required/>
          {validationErrors.yearOfPassing && <p className="validation-error">{validationErrors.yearOfPassing}</p>}
          
          <label className="friends-label">Highest Qualification:</label>
          <input type="text" name="highestQualification" value={formData.highestQualification} onChange={handleChange} className="friends-input" required/>
          
          <label className="friends-label">Specialization:</label>
          <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} className="friends-input" required/>
          
          <label className="friends-label">Skills:</label>
          <textarea name="skills" value={formData.skills} onChange={handleChange} className="friends-input" placeholder="Enter skills, separated by commas" required/>
          
          <label className="friends-label">Experience Type:</label>
          <select name="experienceType" value={formData.experienceType} onChange={handleChange} className="friends-input" required>
            <option value="">Select</option>
            <option value="Fresher">Fresher</option>
            <option value="Experienced">Experienced</option>
          </select>
          
          {formData.experienceType === "Experienced" && (
            <div>
              <label className="friends-label">Experience (in years):</label>
              <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="friends-input" min="0.1" step="0.1"
                required={formData.experienceType === "Experienced"}/>
              {validationErrors.experience && <p className="validation-error">{validationErrors.experience}</p>}
            </div>
          )}
          
          <label className="friends-label">Upload Resume:</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="friends-file-input" required ref={fileInputRef}/>
          {fileName && <p className="file-name">Selected File: {fileName}</p>}
          
          <button type="submit" className="friends-submit-btn">
            Submit
          </button>
        </form>
        {message && <p className="submission-message">{message}</p>}
      </div>
          
      {/* Last Updated Resume Box */}
      {lastUpdatedResume && (
        <div className="uploaded-resumes-container">
          <h3>Last Updated Resume</h3>
          <div className="resume-cards-wrapper">
            {editResumeId === lastUpdatedResume._id ? (
              // EDIT MODE
              <div className="resume-card" key={lastUpdatedResume._id}>
                <div className="resume-card-row">
                  <div className="resume-card-col">
                    <strong>Full Name:</strong>
                    <input
                      type="text"
                      name="firstName"
                      value={editFormData.firstName}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                    &nbsp;
                    <input
                      type="text"
                      name="surname"
                      value={editFormData.surname}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Email:</strong>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Specialization:</strong>
                    <input
                      type="text"
                      name="specialization"
                      value={editFormData.specialization}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Year of Passing:</strong>
                    <input
                      type="number"
                      name="yearOfPassing"
                      value={editFormData.yearOfPassing}
                      onChange={handleEditFormChange}
                      className="friends-input"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Location:</strong>
                    <input
                      type="text"
                      name="location"
                      value={editFormData.location}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Experience Type:</strong>
                    <select
                      name="experienceType"
                      value={editFormData.experienceType}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="Experienced">Experienced</option>
                    </select>
                  </div>
                  {editFormData.experienceType === "Experienced" && (
                    <div className="resume-card-col">
                      <strong>Experience:</strong>
                      <input
                        type="number"
                        name="experience"
                        value={editFormData.experience}
                        onChange={handleEditFormChange}
                        className="friends-input"
                        min="0"
                      />
                    </div>
                  )}
                  <div className="resume-card-col">
                    <strong>Date of Birth:</strong>
                    <input
                      type="date"
                      name="dob"
                      value={editFormData.dob}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Resume:</strong>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleEditFileChange}
                      className="friends-file-input"
                      ref={editFileInputRef}
                    />
                    {editFormData.newResume ? (
                      <p className="file-name">
                        New: {editFormData.newResume.name}
                      </p>
                    ) : (
                      <p className="file-name">
                        Current:{" "}
                        {editFormData.resumeFile
                          ? editFormData.resumeFile.split("/").pop()
                          : ""}
                      </p>
                    )}
                  </div>
                  <div className="resume-card-col actions-col">
                    <button
                      onClick={() => handleSaveClick(lastUpdatedResume._id)}
                      className="save-btn"
                    >
                      ✔
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="cancel-btn"
                    >
                      ❌
                    </button>
                  </div>
                </div>
                <div className="resume-card-row">
                  <div className="resume-card-col">
                    <strong>Aadhar Number:</strong>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={editFormData.aadharNumber}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Highest Qualification:</strong>
                    <input
                      type="text"
                      name="highestQualification"
                      value={editFormData.highestQualification}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Skills:</strong>
                    <textarea
                      name="skills"
                      value={editFormData.skills}
                      onChange={handleEditFormChange}
                      className="friends-input"
                      placeholder="Enter skills, separated by commas"
                    />
                  </div>
                  <div className="resume-card-col">
                    <strong>Phone:</strong>
                    <input
                      type="text"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleEditFormChange}
                      className="friends-input"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // READ-ONLY MODE
              <div className="resume-card" key={lastUpdatedResume._id}>
                {/* Row 1 */}
                <div className="resume-card-row">
                  <div className="resume-card-col">
                    <p>
                      <strong>Full Name:</strong> {lastUpdatedResume.firstName}{" "}
                      {lastUpdatedResume.surname}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Email:</strong> {lastUpdatedResume.email}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Experience Type:</strong> {lastUpdatedResume.experienceType || "Not Provided"}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Date of Birth:</strong>{" "}
                      {lastUpdatedResume.dateOfBirth && lastUpdatedResume.dateOfBirth !== "null" && lastUpdatedResume.dateOfBirth !== "undefined"
                        ? new Date(lastUpdatedResume.dateOfBirth).toISOString().split("T")[0]
                        : "Not Provided"}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Resume:</strong>{" "}
                      {lastUpdatedResume.resumeFile && (
                        <a
                          href={`${BASE_URL}${lastUpdatedResume.resumeFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {lastUpdatedResume.resumeFile.split("/").pop()}
                        </a>
                      )}
                    </p>
                  </div>
                  <div className="resume-card-col actions-col">
                    <button
                      onClick={() => handleEditClick(lastUpdatedResume)}
                      className="edit-btn"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => handleDeleteClick(lastUpdatedResume._id)}
                      className="delete-btn"
                      style={{ marginLeft: "10px" }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
                {/* Row 2 */}
                <div className="resume-card-row">
                  <div className="resume-card-col">
                    <p>
                      <strong>Aadhar Number:</strong> {lastUpdatedResume.aadharNumber}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Phone:</strong> {lastUpdatedResume.phone}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Experience:</strong> {lastUpdatedResume.experience} years
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p><strong>Highest Qualification:</strong> {lastUpdatedResume.highestQualification}</p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Skills:</strong> {lastUpdatedResume.skills ? lastUpdatedResume.skills.join(", ") : "Not Provided"}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Specialization:</strong> {lastUpdatedResume.specialization || "Not Provided"}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Year of Passing:</strong> {lastUpdatedResume.yearOfPassing || "Not Provided"}
                    </p>
                  </div>
                  <div className="resume-card-col">
                    <p>
                      <strong>Location:</strong> {lastUpdatedResume.location || "Not Provided"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFriendsResume;