import React, { useState, useEffect } from "react";
import "./UploadResume.css";
import axios from "axios";

const UploadResume = ({ setResumes, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [fetchedResume, setFetchedResume] = useState("");
  const [uploadMessage, setUploadMessage] = useState("No resume uploaded yet.");

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await axios.get(`${BASE_URL}api/auth/user/${userId}`);
        setFetchedResume(response.data.resumes);
      } catch (error) {
        console.error("Failed to fetch resume:", error);
      }
    };

    if (userId) {
      fetchResume();
    }
  }, [userId, BASE_URL]);

  useEffect(() => {
    if (fetchedResume && typeof fetchedResume === "string") {
      const isValidUrl = fetchedResume.startsWith("http") || fetchedResume.startsWith("uploads");
      if (isValidUrl) {
        const fullUrl = fetchedResume.startsWith("http")
          ? fetchedResume
          : `${BASE_URL}${fetchedResume}`;
        setResumeUrl(fullUrl);
        setUploadMessage("Resume available.");
      } else {
        console.error("Invalid resume URL format.");
        setUploadMessage("Invalid resume data.");
      }
    }
  }, [fetchedResume]);

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("Uploading...");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", userId);

    try {
      const response = await fetch(`${BASE_URL}api/auth/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.resume && typeof data.resume === "string") {
        const fullUrl = data.resume.startsWith("http")
          ? data.resume
          : `${BASE_URL}${data.resume}`;

        setResumeUrl(fullUrl);
        setUploadMessage("Resume uploaded successfully!");

        if (setResumes) {
          setResumes(fullUrl);
        }
      } else {
        console.error("Error uploading resume:", data.message);
        setUploadMessage("Error uploading resume. Try again. (Only PDF files within 5MB are accepted)");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      setUploadMessage("Upload failed. Please try again. (Only PDF files within 5MB are accepted)");
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewResume = () => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <div className="resume-upload-overlay">
      <div className="resume-upload-container">
        <h1 className="resume-upload-title">Upload Resume</h1>
        <button className="resume-close-button" onClick={onClose}>
          ✖
        </button>

        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleResumeUpload}
          disabled={isUploading}
          className="filestyle"
        />

        {resumeUrl && (
          <div className="resume-actions">
            <button className="resume-button view-btn" onClick={handleViewResume}>
              View Resume
            </button>
            <button
              className="resume-button edit-btn"
              onClick={() => document.querySelector("input[type='file']").click()}
            >
              Replace Resume
            </button>
          </div>
        )}

        <p className="upload-message">{uploadMessage}</p>
      </div>
    </div>
  );
};

export default UploadResume;