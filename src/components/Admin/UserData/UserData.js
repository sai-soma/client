import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./UserData.css";

const UserData = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("bankDetails");
  const [appSearchTerm, setAppSearchTerm] = useState("");
  const [resumeSearchTerm, setResumeSearchTerm] = useState("");
  const [currentAppPage, setCurrentAppPage] = useState(1);
  const [currentResumePage, setCurrentResumePage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1); // New state for user pagination
  const itemsPerPage = 10;
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (isProfileOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isProfileOpen]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}api/auth/all-users`)
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const fetchAllUserDetails = async () => {
    try {
      const userDetailsList = await Promise.all(
        users.map(async (user) => {
          try {
            const profileResponse = await axios.get(
              `${BASE_URL}api/auth/users/${user.userId}/profile`
            );
            return { ...user, ...profileResponse.data };
          } catch (error) {
            console.error(`Error fetching details for ${user.userId}:`, error);
            return {
              ...user,
              applications: [],
              addFriendsResume: [],
              bankDetails: [],
            };
          }
        })
      );
      return userDetailsList;
    } catch (error) {
      console.error("Error fetching full user details:", error);
      return [];
    }
  };

  const exportToExcel = async () => {
    const allUsers = await fetchAllUserDetails();

    const excelData = allUsers.map((user) => ({
      "User ID": user.userId || "N/A",
      "Full Name": user.fullName || "N/A",
      Email: user.email || "N/A",
      Phone: user.phone || "N/A",
      "Wallet Balance": user.walletBalance ?? "N/A",
      "Bank Details": user.bankDetails?.length
        ? user.bankDetails
            .map(
              (bank) =>
                `AccountHolderName: ${bank.accountHolderName}\n BankName: ${bank.bankName}\n AccountNumber: ${bank.accountNumber}\n IFSC: ${bank.ifscCode}\n BranchName: ${bank.branchName}\n UPI: ${bank.upiId}\n PhonePeNumber: ${bank.phonepeNumber}`
            )
            .join("\n\n")
        : "None",
      Applications: user.applications?.length
        ? user.applications
            .map(
              (app) =>
                `Name: ${app.name}\n Email: ${app.email}\n Mobile: ${app.mobile}\n YearofPassing: ${
                  app.yearOfPassing
                }\n Resume: ${BASE_URL}${app.resume}\n Status: ${app.status}\n JobID: ${app.jobId}\n Applied: ${new Date(
                  app.appliedAt
                ).toLocaleDateString()}`
            )
            .join("\n\n")
        : "None",
      "Resumes Uploaded": user.addFriendsResume?.length
        ? user.addFriendsResume
            .map(
              (resume) =>
                `FullName: ${resume.firstName} ${resume.surname}\n Email: ${resume.email}\n Phone: ${
                  resume.phone
                }\n Location: ${resume.location}\n AadharNumber: ${resume.aadharNumber}\n Resume: ${
                  resume.resumeFile
                }\n YearofPassing: ${resume.yearOfPassing}\n Specialization: ${
                  resume.specialization
                }\n Experience: ${
                  resume.experience
                }\n Created: ${new Date(resume.createdAt).toLocaleDateString()}`
            )
            .join("\n\n")
        : "None",
    }));

    const ws = XLSX.utils.json_to_sheet(excelData, {
      cellStyles: true,
    });

    const wsCols = Object.keys(excelData[0]).map(() => ({ wch: 30 }));
    ws["!cols"] = wsCols;

    Object.keys(ws).forEach((key) => {
      if (ws[key] && ws[key].t === "s") {
        ws[key].s = { alignment: { wrapText: true, vertical: "center" } };
      }
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users Data");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, "UserData.xlsx");
  };

  const handleViewProfile = async (userId) => {
    setSelectedUser(userId);
    setIsProfileOpen(true);
    setActiveTab("bankDetails");
    setAppSearchTerm("");
    setResumeSearchTerm("");
    setCurrentAppPage(1);
    setCurrentResumePage(1);
    try {
      const response = await axios.get(
        `${BASE_URL}api/auth/users/${userId}/profile`
      );
      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      setUserDetails(null);
    }, 400);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination for users
  const indexOfLastUser = currentUserPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Filter applications based on search term
  const filteredApplications = userDetails?.applications?.filter((app) => {
    const searchLower = appSearchTerm.toLowerCase();
    return (
      app.name?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.mobile?.toLowerCase().includes(searchLower) ||
      app.status?.toLowerCase().includes(searchLower) ||
      app.jobId?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Filter resumes based on search term
  const filteredResumes = userDetails?.addFriendsResume?.filter((resume) => {
    const searchLower = resumeSearchTerm.toLowerCase();
    return (
      `${resume.firstName} ${resume.surname}`.toLowerCase().includes(searchLower) ||
      resume.email?.toLowerCase().includes(searchLower) ||
      resume.phone?.toLowerCase().includes(searchLower) ||
      resume.location?.toLowerCase().includes(searchLower) ||
      resume.specialization?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Pagination for applications
  const indexOfLastApp = currentAppPage * itemsPerPage;
  const indexOfFirstApp = indexOfLastApp - itemsPerPage;
  const currentApps = filteredApplications.slice(indexOfFirstApp, indexOfLastApp);
  const totalAppPages = Math.ceil(filteredApplications.length / itemsPerPage);

  // Pagination for resumes
  const indexOfLastResume = currentResumePage * itemsPerPage;
  const indexOfFirstResume = indexOfLastResume - itemsPerPage;
  const currentResumes = filteredResumes.slice(indexOfFirstResume, indexOfLastResume);
  const totalResumePages = Math.ceil(filteredResumes.length / itemsPerPage);

  return (
    <div className="user-data-container">
      <div className="user-data-header">
        <h2 className="user-data-head">All Users Data</h2>
        <button onClick={exportToExcel} className="user-data-export-btn">
          📥 ExportToExcel
        </button>
      </div>

      <div className="user-data-search">
        <input
          type="text"
          placeholder="🔍 Search by User ID, Name, or Email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentUserPage(1); // Reset to first page when searching
          }}
        />
      </div>

      <div className="user-data-list">
        <table className="user-data-table1">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.userId}>
                  <td>{user.userId}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <button
                      onClick={() => handleViewProfile(user.userId)}
                      className="user-data-view-profile-btn"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="user-data-no-users">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination for users */}
        {filteredUsers.length > itemsPerPage && (
          <div className="pagination">
            <button
              onClick={() => setCurrentUserPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentUserPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentUserPage} of {totalUserPages}
            </span>
            <button
              onClick={() =>
                setCurrentUserPage((prev) => Math.min(prev + 1, totalUserPages))
              }
              disabled={currentUserPage === totalUserPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {isProfileOpen && (
        <div className="user-data-overlay active" onClick={closeProfile}></div>
      )}

      {selectedUser && userDetails && (
        <div className={`user-data-details ${isProfileOpen ? "active" : ""}`}>
          <button className="user-data-close-btn" onClick={closeProfile}>
            ❌
          </button>

          <div className="user-data-profile-title">
            <h2>{userDetails.fullName}'s Profile</h2>
          </div>

          <div className="user-data-tabs">
            <button
              className={`tab-button ${activeTab === "bankDetails" ? "active" : ""}`}
              onClick={() => setActiveTab("bankDetails")}
            >
              Bank Details
            </button>
            <button
              className={`tab-button ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              Applications
            </button>
            <button
              className={`tab-button ${activeTab === "resumes" ? "active" : ""}`}
              onClick={() => setActiveTab("resumes")}
            >
              Resumes Uploaded
            </button>
          </div>

          <div className="user-data-tab-content">
            {activeTab === "bankDetails" && (
              <div className="bank-details-section">
                <h3>Bank Details</h3>
                {userDetails.bankDetails?.length > 0 ? (
                  <table className="details-table">
                    <thead>
                      <tr>
                        <th>Account Holder</th>
                        <th>Bank Name</th>
                        <th>Account Number</th>
                        <th>IFSC Code</th>
                        <th>Branch</th>
                        <th>UPI ID</th>
                        <th>PhonePe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails.bankDetails.map((bank, index) => (
                        <tr key={index}>
                          <td>{bank.accountHolderName}</td>
                          <td>{bank.bankName}</td>
                          <td>{bank.accountNumber}</td>
                          <td>{bank.ifscCode}</td>
                          <td>{bank.branchName}</td>
                          <td>{bank.upiId}</td>
                          <td>{bank.phonepeNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No bank details found.</p>
                )}
              </div>
            )}

            {activeTab === "applications" && (
              <div className="applications-section">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="   Search applications..."
                    value={appSearchTerm}
                    onChange={(e) => {
                      setAppSearchTerm(e.target.value);
                      setCurrentAppPage(1);
                    }}
                  />
                </div>
                {filteredApplications.length > 0 ? (
                  <>
                    <table className="details-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Year of Passing</th>
                          <th>Resume</th>
                          <th>Status</th>
                          <th>Job ID</th>
                          <th>Applied At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentApps.map((app, index) => (
                          <tr key={index}>
                            <td>{app.name}</td>
                            <td>{app.email}</td>
                            <td>{app.mobile}</td>
                            <td>{app.yearOfPassing}</td>
                            <td>
                              <a href={`${BASE_URL}${app.resume}`} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </td>
                            <td>{app.status}</td>
                            <td>{app.jobId}</td>
                            <td>{new Date(app.appliedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination">
                      <button
                        onClick={() => setCurrentAppPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentAppPage === 1}
                      >
                        Previous
                      </button>
                      <span>
                        Page {currentAppPage} of {totalAppPages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentAppPage((prev) => Math.min(prev + 1, totalAppPages))
                        }
                        disabled={currentAppPage === totalAppPages}
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <p>No applications found.</p>
                )}
              </div>
            )}

            {activeTab === "resumes" && (
              <div className="resumes-section">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="   Search resumes..."
                    value={resumeSearchTerm}
                    onChange={(e) => {
                      setResumeSearchTerm(e.target.value);
                      setCurrentResumePage(1);
                    }}
                  />
                </div>
                {filteredResumes.length > 0 ? (
                  <>
                    <table className="details-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Location</th>
                          <th>Aadhar</th>
                          <th>Year of Passing</th>
                          <th>Qualification</th>
                          <th>Specialization</th>
                          <th>Experience</th>
                          <th>Resume</th>
                          <th>Shared At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentResumes.map((resume, index) => (
                          <tr key={index}>
                            <td>{`${resume.firstName} ${resume.surname}`}</td>
                            <td>{resume.email}</td>
                            <td>{resume.phone}</td>
                            <td>{resume.location}</td>
                            <td>{resume.aadharNumber}</td>
                            <td>{resume.yearOfPassing}</td>
                            <td>{resume.highestQualification}</td>
                            <td>{resume.specialization}</td>
                            <td>{resume.experience}</td>
                            <td>
                              <a
                                href={`${BASE_URL}${resume.resumeFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                              </a>
                            </td>
                            <td>{new Date(resume.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination">
                      <button
                        onClick={() =>
                          setCurrentResumePage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentResumePage === 1}
                      >
                        Previous
                      </button>
                      <span>
                        Page {currentResumePage} of {totalResumePages}
                      </span>
                      <button
                        onClick={() =>
                          setCurrentResumePage((prev) =>
                            Math.min(prev + 1, totalResumePages)
                          )
                        }
                        disabled={currentResumePage === totalResumePages}
                      >
                        Next
                      </button>
                    </div>
                  </>
                ) : (
                  <p>No resumes found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserData;