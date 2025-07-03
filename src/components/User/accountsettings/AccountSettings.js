import React, { useEffect, useState } from "react";
import "./AccountSettings.css";
import { useStateContext } from "../../../context/StateContext";

const AccountSettings = ({ onClose }) => {
  const { user, setUser } = useStateContext();
  const [isEditing, setIsEditing] = useState(false);
  const BASE_URL = process.env.REACT_APP_API_URL;
  const [editedUser, setEditedUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    highestQualification: "",
    specialization: "",
    experienceLevel: "Fresher",
    totalYearsOfExperience: "",
    dateOfBirth: "",
    skills: "",
    aadhaarNumber: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await fetch(`${BASE_URL}api/auth/user/${userId}`);
        const data = await response.json();

        if (response.ok) {
          const updatedUserData = {
            ...user,
            ...data,
          };

          setEditedUser({
            ...updatedUserData,
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
            skills: data.skills?.join(", ") || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    fetchUserData();
  }, [isEditing]);

  const handleSave = async () => {
    // Check required fields first
    if (!editedUser.fullName || !editedUser.email || !editedUser.phone || !editedUser.highestQualification || !editedUser.specialization || !editedUser.dateOfBirth || !editedUser.aadhaarNumber) {
      alert("Please fill all required fields!");
      return;
    }

    // DOB validation
    const dobDate = new Date(editedUser.dateOfBirth);
    const today = new Date();

    if (dobDate > today) {
      alert("Date of Birth cannot be a future date.");
      return;
    }

    const ageDifMs = today - dobDate;
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    if (age < 18) {
      alert("User must be at least 18 years old.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}api/auth/update-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editedUser,
          userId: user.userId,
          dateOfBirth: editedUser.dateOfBirth ? new Date(editedUser.dateOfBirth).toISOString().split("T")[0] : null,
          skills: editedUser.skills.split(",").map((skill) => skill.trim()),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = {
          ...user,
          ...data.user,
          skills: data.user.skills,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setEditedUser({
          ...updatedUser,
          skills: updatedUser.skills.join(", "),
        });
        setIsEditing(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
  };

  // Calculate max date allowed = today's date - 18 years
  const getMaxDOB = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    // Format date as yyyy-mm-dd for input max attribute
    return today.toISOString().split("T")[0];
  };

  const maxDOB = getMaxDOB();

  return (
    <div className="account-settings-overlay">
      <div className="account-settings-container">
        <div>
          <h1 className="account-settings-title">Account Settings</h1>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <br />
        <div className="form-content">
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              {isEditing ? <input type="text" value={editedUser.fullName} onChange={(e) => setEditedUser({ ...editedUser, fullName: e.target.value })} /> : <div className="form-value">{user?.fullName || "No Name"}</div>}
            </div>

            <div className="form-group">
              <label>Email</label>
              {isEditing ? <input type="email" value={editedUser.email} onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })} /> : <div className="form-value">{user?.email || "No Email"}</div>}
            </div>

            <div className="form-group">
              <label>Phone</label>
              {isEditing ? <input type="tel" value={editedUser.phone} onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })} /> : <div className="form-value">{user?.phone || "No Phone"}</div>}
            </div>

            <div className="form-group">
              <label>Highest Qualification</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedUser.highestQualification}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      highestQualification: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="form-value">{user?.highestQualification || "Not Provided"}</div>
              )}
            </div>

            <div className="form-group">
              <label>Specialization</label>
              {isEditing ? <input type="text" value={editedUser.specialization} onChange={(e) => setEditedUser({ ...editedUser, specialization: e.target.value })} /> : <div className="form-value">{user?.specialization || "Not Provided"}</div>}
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              {isEditing ? (
                <select
                  value={editedUser.experienceLevel}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      experienceLevel: e.target.value,
                    })
                  }
                >
                  <option value="Fresher">Fresher</option>
                  <option value="Experienced">Experienced</option>
                </select>
              ) : (
                <div className="form-value">{user?.experienceLevel || "Not Provided"}</div>
              )}
            </div>

            <div className="form-group">
              <label>Total Experience (Years)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedUser.totalYearsOfExperience}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      totalYearsOfExperience: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="form-value">{user?.totalYearsOfExperience || "Not Provided"}</div>
              )}
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedUser.dateOfBirth}
                  max={maxDOB} // Prevent selecting date less than 18 years ago or in future
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              ) : (
                <div className="form-value">
                  {user?.dateOfBirth
                    ? (() => {
                        const date = new Date(user.dateOfBirth);
                        const day = String(date.getDate()).padStart(2, "0");
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const year = date.getFullYear();
                        return `${day}-${month}-${year}`;
                      })()
                    : "Not Provided"}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Skills</label>
              {isEditing ? <input type="text" value={editedUser.skills} onChange={(e) => setEditedUser({ ...editedUser, skills: e.target.value })} /> : <div className="form-value">{user?.skills?.join(", ") || "Not Provided"}</div>}
            </div>

            <div className="form-group">
              <label>Aadhaar Number</label>
              {isEditing ? <input type="text" value={editedUser.aadhaarNumber} onChange={(e) => setEditedUser({ ...editedUser, aadhaarNumber: e.target.value })} /> : <div className="form-value">{user?.aadhaarNumber || "Not Provided"}</div>}
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
