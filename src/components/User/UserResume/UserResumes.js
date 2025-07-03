import React, { useEffect, useState, useRef } from "react";
import "./UserResumes.css";

const UserResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editResumeId, setEditResumeId] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [resumesPerPage] = useState(4); // You can adjust this number
  const BASE_URL = process.env.REACT_APP_API_URL;
  const [editFormData, setEditFormData] = useState({
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
    skills: "",
    newResume: null,
    resumeFile: "",
  });
  const editFileInputRef = useRef(null);

  const fetchResumes = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setSuccessMessage("User not logged in. Please login and try again.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}api/resumes/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setResumes(data);
        setFilteredResumes(data); // Initialize filtered resumes with all resumes
      } else {
        setSuccessMessage("Failed to fetch resumes.");
      }
    } catch (error) {
      setSuccessMessage("Error fetching resumes.");
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // Apply search filter whenever searchTerm or resumes change
  useEffect(() => {
    const filtered = resumes.filter(resume => {
      const searchLower = searchTerm.toLowerCase();
      return (
        resume.firstName.toLowerCase().includes(searchLower) ||
        resume.surname.toLowerCase().includes(searchLower) ||
        resume.email.toLowerCase().includes(searchLower) ||
        resume.phone.toLowerCase().includes(searchLower) ||
        (resume.CId && resume.CId.toLowerCase().includes(searchLower)) ||
        (resume.aadharNumber && resume.aadharNumber.toLowerCase().includes(searchLower)) ||
        (resume.skills && resume.skills.join(" ").toLowerCase().includes(searchLower)) ||
        (resume.location && resume.location.toLowerCase().includes(searchLower)) ||
        (resume.highestQualification && resume.highestQualification.toLowerCase().includes(searchLower)) ||
        (resume.specialization && resume.specialization.toLowerCase().includes(searchLower))
      );
    });
    setFilteredResumes(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, resumes]);

  // Get current resumes for pagination
  const indexOfLastResume = currentPage * resumesPerPage;
  const indexOfFirstResume = indexOfLastResume - resumesPerPage;
  const currentResumes = filteredResumes.slice(indexOfFirstResume, indexOfLastResume);
  const totalPages = Math.ceil(filteredResumes.length / resumesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleEditClick = (resume) => {
    setEditResumeId(resume._id);
    setEditFormData({
      firstName: resume.firstName,
      surname: resume.surname,
      email: resume.email,
      phone: resume.phone,
      dob: resume.dateOfBirth ? new Date(resume.dateOfBirth).toISOString().split("T")[0] : "",
      location: resume.location,
      aadharNumber: resume.aadharNumber,
      yearOfPassing: resume.yearOfPassing,
      highestQualification: resume.highestQualification,
      specialization: resume.specialization,
      experienceType: resume.experienceType,
      experience: resume.experience || "",
      skills: resume.skills ? resume.skills.join(", ") : "",
      newResume: null,
      resumeFile: resume.resumeFile || "",
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
      setEditFormData((prevData) => ({
        ...prevData,
        newResume: file,
        resumeFile: file.name,
      }));
    }
  };

  const handleSaveClick = async (resumeId) => {
    try {
      const updateData = new FormData();

      updateData.append("firstName", editFormData.firstName);
      updateData.append("surname", editFormData.surname);
      updateData.append("email", editFormData.email);
      updateData.append("phone", editFormData.phone);
      updateData.append("dob", editFormData.dob);
      updateData.append("location", editFormData.location);
      updateData.append("aadharNumber", editFormData.aadharNumber);
      updateData.append("yearOfPassing", editFormData.yearOfPassing);
      updateData.append("highestQualification", editFormData.highestQualification);
      updateData.append("specialization", editFormData.specialization);
      updateData.append("experienceType", editFormData.experienceType);

      if (editFormData.experienceType === "Experienced") {
        updateData.append("experience", editFormData.experience);
      }

      updateData.append("skills", editFormData.skills);

      if (editFormData.newResume) {
        updateData.append("resume", editFormData.newResume);
      }

      const response = await fetch(`${BASE_URL}api/resumes/${resumeId}`, {
        method: "PUT",
        body: updateData,
      });

      if (response.ok) {
        setEditResumeId(null);
        fetchResumes();
        setErrorMessage("");
        setSuccessMessage("Resume updated successfully!");
      } else {
        const errorResult = await response.json();
        setErrorMessage(errorResult.message);
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
        setTimeout(() => {
          document.querySelector(".error-box")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      setErrorMessage("Error updating resume");
    }
  };

  const handleCancelClick = () => {
    setEditResumeId(null);
  };

  const handleDeleteClick = (resumeId) => {
    setSelectedResumeId(resumeId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${BASE_URL}api/resumes/${selectedResumeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchResumes();
        setErrorMessage("");
      } else {
        const errorResult = await response.json();
        setErrorMessage(errorResult.message);
      }
    } catch (error) {
      setErrorMessage("Error deleting resume");
    } finally {
      setShowDeleteDialog(false);
      setSelectedResumeId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setSelectedResumeId(null);
  };

  return (
    <div className="user-resumes-container">
      <h2 className="title">My Resumes</h2>
      
      {/* Search Box */}
      <div className="search-container">
        <input
          type="text"
          placeholder="  Search resumes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {errorMessage && (
        <div className="error-box">
          {errorMessage}
          <button className="close-error" onClick={() => setErrorMessage("")}>
            ✖
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-box">
          {successMessage}
          <button className="close-btn" onClick={() => setSuccessMessage("")}>
            ✖
          </button>
        </div>
      )}

      {/* Resume count */}
      <div className="resume-count">
        Showing {currentResumes.length} of {filteredResumes.length} resumes
        {searchTerm && ` (filtered from ${resumes.length} total resumes)`}
      </div>

      {filteredResumes.length > 0 ? (
        <>
          <div className="resume-grid">
            {currentResumes.map((resume) => {
              if (editResumeId === resume._id) {
                return (
                  <div key={resume._id} className="resume-card edit-mode">
                    <div className="edit-resume-form">
                      <input type="text" name="firstName" value={editFormData.firstName} onChange={handleEditFormChange} placeholder="First Name" className="resume-edit-input" />
                      <input type="text" name="surname" value={editFormData.surname} onChange={handleEditFormChange} placeholder="Surname" className="resume-edit-input" />
                      <input type="email" name="email" value={editFormData.email} onChange={handleEditFormChange} placeholder="Email" className="resume-edit-input" />
                      <input type="tel" name="phone" value={editFormData.phone} onChange={handleEditFormChange} placeholder="Phone" className="resume-edit-input" />
                      <input type="date" name="dob" value={editFormData.dob} onChange={handleEditFormChange} placeholder="Date of Birth" className="resume-edit-input" />
                      <input type="text" name="location" value={editFormData.location} onChange={handleEditFormChange} placeholder="Location" className="resume-edit-input" />
                      <input type="text" name="aadharNumber" value={editFormData.aadharNumber} onChange={handleEditFormChange} placeholder="Aadhar Number" className="resume-edit-input" />
                      <input type="number" name="yearOfPassing" value={editFormData.yearOfPassing} onChange={handleEditFormChange} placeholder="Year of Passing" className="resume-edit-input" />
                      <input
                        type="text"
                        name="highestQualification"
                        value={editFormData.highestQualification}
                        onChange={handleEditFormChange}
                        placeholder="Highest Qualification"
                        className="resume-edit-input"
                      />
                      <input type="text" name="specialization" value={editFormData.specialization} onChange={handleEditFormChange} placeholder="Specialization" className="resume-edit-input" />
                      <select name="experienceType" value={editFormData.experienceType} onChange={handleEditFormChange} className="resume-edit-input">
                        <option value="">Select Experience Type</option>
                        <option value="Fresher">Fresher</option>
                        <option value="Experienced">Experienced</option>
                      </select>
                      {editFormData.experienceType === "Experienced" && (
                        <input type="number" name="experience" value={editFormData.experience} onChange={handleEditFormChange} placeholder="Years of Experience" className="resume-edit-input" />
                      )}
                      <textarea name="skills" value={editFormData.skills} onChange={handleEditFormChange} placeholder="Skills (comma-separated)" className="resume-edit-input" />
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleEditFileChange} ref={editFileInputRef} className="resume-edit-input-file" />
                      <div className="resume-edit-actions">
                        <button onClick={() => handleSaveClick(resume._id)} className="save-button">
                          Save
                        </button>
                        <button onClick={handleCancelClick} className="cancel-button">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={resume._id} className="resume-card">
                  <h3 className="resume-name">
                    {resume.firstName} {resume.surname}
                  </h3>
                  <p className="resume-detail">Email: {resume.email}</p>
                  <p className="resume-detail">Phone: {resume.phone}</p>
                  <p className="resume-detail" style={{ fontWeight: "bolder" }}>
                    CId: {resume.CId}
                  </p>
                  <p className="resume-detail">Aadhar No: {resume.aadharNumber}</p>
                  <p className="resume-detail">Date of Birth: {resume.dateOfBirth ? new Date(resume.dateOfBirth).toLocaleDateString() : "Not Provided"}</p>
                  <p className="resume-detail">Year Of Passing: {resume.yearOfPassing}</p>
                  <p className="resume-detail">Highest Qualification: {resume.highestQualification}</p>
                  <p className="resume-detail">Specialization: {resume.specialization}</p>
                  <p className="resume-detail">Skills: {resume.skills?.join(", ") || "Not Provided"}</p>
                  <p className="resume-detail">Location: {resume.location}</p>
                  <p className="resume-detail">Experience: {resume.experienceType}</p>
                  {resume.experienceType === "Experienced" && <p className="resume-detail">Years: {resume.experience}</p>}
                  <a href={`${BASE_URL}${resume.resumeFile}`} target="_blank" rel="noopener noreferrer" className="resume-link">
                    View Resume
                  </a>
                  <div className="resume-actions">
                    <button onClick={() => handleEditClick(resume)} className="edit-button">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteClick(resume._id)} className="delete-button">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => paginate(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-button"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`page-button ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
              
              <button 
                onClick={() => paginate(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-button"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="no-resumes">
          {searchTerm ? "No resumes match your search." : "No resumes found."}
        </p>
      )}

      {showDeleteDialog && (
        <div className="delete-dialog-overlay">
          <div className="delete-dialog-box">
            <p>Are you sure you want to delete this resume?</p>
            <div className="delete-dialog-actions">
              <button className="confirm-delete-btn" onClick={confirmDelete}>
                Yes, Delete
              </button>
              <button className="cancel-delete-btn" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserResumes;