import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./ResumeList.css";

const ResumeList = () => {
  const [userResumes, setUserResumes] = useState([]);
  const [friendResumes, setFriendResumes] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
    const BASE_URL = process.env.REACT_APP_API_URL;

  // Pagination states for both sections
  const [userPagination, setUserPagination] = useState({
    currentPage: 1,
    itemsPerPage: 3,
  });
  const [friendPagination, setFriendPagination] = useState({
    currentPage: 1,
    itemsPerPage: 6
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, friendsRes] = await Promise.all([
          axios.get(`${BASE_URL}api/auth/all-users`),
          axios.get(`${BASE_URL}api/all-friends-resumes`),
        ]);

        const users = usersRes.data.users || [];
        const friends = friendsRes.data || [];

        const userResumesList = users.map((user) => ({
          name: user.fullName,
          resume: user.resumes,
          referredBy: user.userId,
        }));

        const friendResumesList = friends.map((friend) => ({
          name: `${friend.firstName} ${friend.surname}`,
          resume: friend.resumeFile,
          referredBy: friend.userId,
        }));

        setUserResumes(userResumesList);
        setFriendResumes(friendResumesList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const exportToExcel = (data, fileName) => {
    const formattedData = data.map((item) => ({
      Name: item.name,
      ResumeLink: `${BASE_URL}${item.resume
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")}`,
      ReferredBy: item.referredBy || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resumes");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const ResumeCard = ({ name, resume, referredBy }) => {
    if (!resume) {
      return null;
    }
    const normalizedPath = resume?.replace(/\\/g, "/").replace(/^\/+/, "");
    const fullUrl = resume ? `${BASE_URL}${normalizedPath}` : null;

    return (
      <div className="list-resume-card">
        <div className="card-content">
          <h3 className="list-resume-name">{name}</h3>
          {referredBy && (
            <p className="list-resume-referredby">Referred By: {referredBy}</p>
          )}
          {fullUrl ? (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="list-resume-button"
            >
              View Resume
            </a>
          ) : (
            <p className="list-resume-nofile">Resume not uploaded</p>
          )}
        </div>
      </div>
    );
  };

  // Filter resumes based on search
  const filteredUserResumes = userResumes.filter((user) =>
    (user.name || "").toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredFriendResumes = friendResumes.filter((friend) =>
    (friend.name || "").toLowerCase().includes(friendSearch.toLowerCase())
  );

  // Pagination logic for users
  const userIndexLast = userPagination.currentPage * userPagination.itemsPerPage;
  const userIndexFirst = userIndexLast - userPagination.itemsPerPage;
  const currentUserResumes = filteredUserResumes.slice(userIndexFirst, userIndexLast);
  const userTotalPages = Math.ceil(filteredUserResumes.length / userPagination.itemsPerPage);

  // Pagination logic for friends
  const friendIndexLast = friendPagination.currentPage * friendPagination.itemsPerPage;
  const friendIndexFirst = friendIndexLast - friendPagination.itemsPerPage;
  const currentFriendResumes = filteredFriendResumes.slice(friendIndexFirst, friendIndexLast);
  const friendTotalPages = Math.ceil(filteredFriendResumes.length / friendPagination.itemsPerPage);

  // Change page functions
  const paginateUsers = (pageNumber) => {
    setUserPagination({ ...userPagination, currentPage: pageNumber });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const paginateFriends = (pageNumber) => {
    setFriendPagination({ ...friendPagination, currentPage: pageNumber });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination component
  const Pagination = ({ currentPage, totalPages, paginate }) => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage, endPage;
    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container">
        <button
          onClick={() => paginate(1)}
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          «
        </button>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-arrow"
        >
          ‹
        </button>
        
        {startPage > 1 && (
          <>
            <button onClick={() => paginate(1)} className="pagination-number">
              1
            </button>
            {startPage > 2 && <span className="pagination-ellipsis">...</span>}
          </>
        )}
        
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-number ${currentPage === number ? "active" : ""}`}
          >
            {number}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
            <button onClick={() => paginate(totalPages)} className="pagination-number">
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-arrow"
        >
          ›
        </button>
        <button
          onClick={() => paginate(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="pagination-arrow"
        >
          »
        </button>
      </div>
    );
  };

  return (
    <div className="list-resume-container">
      <h1 className="list-resume-title">All Resumes</h1>

      {/* Users Section */}
      <div className="list-resume-section user-resumes">
        <div className="list-resume-section-header">
          <h2 className="list-resume-section-title">User Resumes</h2>
          <div className="search-export-container">
            <input
              type="text"
              placeholder="Search User Resumes..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPagination({ ...userPagination, currentPage: 1 });
              }}
              className="list-resume-search"
            />
            <button
              className="list-export-button"
              onClick={() => exportToExcel(filteredUserResumes, "User_Resumes")}
            >
              Export Users to Excel
            </button>
          </div>
        </div>
        
        <div className="list-resume-grid">
          {currentUserResumes.map((user, index) => (
            <ResumeCard
              key={index}
              name={user.name}
              resume={user.resume}
              referredBy={user.referredBy}
            />
          ))}
        </div>
        
        {filteredUserResumes.length > userPagination.itemsPerPage && (
          <div className="pagination-wrapper">
            <Pagination
              currentPage={userPagination.currentPage}
              totalPages={userTotalPages}
              paginate={paginateUsers}
            />
          </div>
        )}
      </div>

      {/* Friends Section */}
      <div className="list-resume-section friend-resumes">
        <div className="list-resume-section-header">
          <h2 className="list-resume-section-title">Friend Resumes</h2>
          <div className="search-export-container">
            <input
              type="text"
              placeholder="Search Friend Resumes..."
              value={friendSearch}
              onChange={(e) => {
                setFriendSearch(e.target.value);
                setFriendPagination({ ...friendPagination, currentPage: 1 });
              }}
              className="list-resume-search"
            />
            <button
              className="list-export-button"
              onClick={() => exportToExcel(filteredFriendResumes, "Friend_Resumes")}
            >
              Export Friends to Excel
            </button>
          </div>
        </div>
        
        <div className="list-resume-grid">
          {currentFriendResumes.map((friend, index) => (
            <ResumeCard
              key={index}
              name={friend.name}
              resume={friend.resume}
              referredBy={friend.referredBy}
            />
          ))}
        </div>
        
        {filteredFriendResumes.length > friendPagination.itemsPerPage && (
          <div className="pagination-wrapper">
            <Pagination
              currentPage={friendPagination.currentPage}
              totalPages={friendTotalPages}
              paginate={paginateFriends}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeList;