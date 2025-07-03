import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MakeAdmins.css';

const MakeAdmins = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('admin'); // 'superadmin', 'admin', or 'user'
    const BASE_URL = process.env.REACT_APP_API_URL;

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10
  });

  // Fetch users from the backend
  useEffect(() => {
axios.get(`${BASE_URL}api/auth/all-users`)
      .then(res => {
        const fetchedUsers = Array.isArray(res.data.users) ? res.data.users : [];
        setUsers(fetchedUsers);
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setUsers([]);
      });
  }, []);

  // Toggle admin access (prevent change for superadmin)
  const toggleAdmin = async (userId, currentRole) => {
    if (currentRole === 'superadmin') {
      alert("Super Admin role cannot be changed.");
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMessage = `Are you sure you want to ${newRole === 'admin' ? 'make this user an Admin' : 'remove Admin access'}?`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    try {
      await axios.put(`${BASE_URL}api/auth/toggle-role/${userId}`, { role: newRole });

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      alert(`User is now set as ${newRole}`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      if (error.response?.status === 403) {
        alert(error.response.data.message);
      } else {
        alert('Failed to update user role');
      }
    }
  };

  // Filter users based on search input and active tab
  const filteredUsers = users.filter(user => {
    const searchQuery = searchTerm.toLowerCase();
    const matchesSearch = (
      user.userId?.toLowerCase().includes(searchQuery) ||
      user.phone?.includes(searchQuery) ||
      user.fullName?.toLowerCase().includes(searchQuery) ||
      user.email?.toLowerCase().includes(searchQuery)
    );
    
    const matchesRole = 
      (activeTab === 'superadmin' && user.role === 'superadmin') ||
      (activeTab === 'admin' && user.role === 'admin') ||
      (activeTab === 'user' && user.role === 'user');
    
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const indexLast = pagination.currentPage * pagination.itemsPerPage;
  const indexFirst = indexLast - pagination.itemsPerPage;
  const currentUsers = filteredUsers.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredUsers.length / pagination.itemsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    setPagination({ ...pagination, currentPage: pageNumber });
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
    <div className="make-admins-container">
      <h2 className="make-admins-title">Manage User Roles</h2>
      
      {/* Tabs */}
      <div className="role-tabs">
        <button
          className={`tab-button ${activeTab === 'superadmin' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('superadmin');
            setPagination({ ...pagination, currentPage: 1 });
          }}
        >
          Super Admins
        </button>
        <button
          className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('admin');
            setPagination({ ...pagination, currentPage: 1 });
          }}
        >
          Admins
        </button>
        <button
          className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('user');
            setPagination({ ...pagination, currentPage: 1 });
          }}
        >
          Users
        </button>
      </div>

      {/* Search Section */}
      <div className="filters-section">
        <input
          type="text"
          className="make-admins-search"
          placeholder={`Search ${activeTab}s by ID, name, email or phone`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPagination({ ...pagination, currentPage: 1 });
          }}
        />
        <div className="items-per-page-selector">
          <span>Items per page: </span>
          <select
            value={pagination.itemsPerPage}
            onChange={(e) => setPagination({
              ...pagination,
              itemsPerPage: Number(e.target.value),
              currentPage: 1
            })}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <table className="make-admins-table">
        <thead>
          <tr>
            <th>SNO</th>
            <th>User Details</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => {
              const isSuperAdmin = user.role === 'superadmin';
              const globalIndex = indexFirst + index;

              return (
                <tr key={user._id}>
                  <td>{globalIndex + 1}</td>
                  <td className="user-details-cell">
                    <strong>ID:</strong> {user.userId || 'N/A'}<br />
                    <strong>Name:</strong> {user.fullName || 'N/A'}<br />
                    <strong>Email:</strong> {user.email || 'N/A'}<br />
                    <strong>Phone:</strong> {user.phone || 'N/A'}
                  </td>
                  <td>
                    {isSuperAdmin ? (
                      <span className="super-admin-label">Super Admin</span>
                    ) : user.role === 'admin' ? (
                      <span className="admin-label">Admin</span>
                    ) : (
                      <span className="user-label">User</span>
                    )}
                  </td>
                  <td>
                    {isSuperAdmin ? (
                      <button className="make-admin-button locked-button" disabled>
                        Super Admin (Locked)
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleAdmin(user._id, user.role)}
                        className={`make-admin-button ${user.role === 'admin' ? 'remove-button' : 'make-button'}`}
                      >
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="no-users-found">
                No {activeTab}s found{searchTerm ? ` matching "${searchTerm}"` : ''}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {filteredUsers.length > pagination.itemsPerPage && (
        <div className="pagination-wrapper">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={totalPages}
            paginate={paginate}
          />
        </div>
      )}
    </div>
  );
};

export default MakeAdmins;