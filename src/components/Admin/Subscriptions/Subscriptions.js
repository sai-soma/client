import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Subscriptions.css";
import { FiSearch } from "react-icons/fi";

const Subscriptions = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const subscribersPerPage = 10;
  const BASE_URL = process.env.REACT_APP_API_URL;

  const fetchSubscribers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/subscribers`);
      setSubscribers(response.data);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    }
  };

  const deleteSubscriber = async (id) => {
    try {
      await axios.delete(`${BASE_URL}api/subscribers/${id}`);
      setSubscribers(subscribers.filter((sub) => sub._id !== id));
    } catch (error) {
      console.error("Error deleting subscriber:", error);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filteredSubscribers = subscribers.filter((subscriber) =>
    subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * subscribersPerPage;
  const indexOfFirst = indexOfLast - subscribersPerPage;
  const currentSubscribers = filteredSubscribers.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="admin-subscriptions-container">
      <div className="admin-subscriptions-heading">Subscribers List</div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <table className="admin-subscriptions-table">
        <thead>
          <tr>
            <th>List No.</th>
            <th>Email</th>
            <th>Subscription Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentSubscribers.length > 0 ? (
            currentSubscribers.map((subscriber, index) => (
              <tr key={subscriber._id}>
                <td>{indexOfFirst + index + 1}</td>
                <td>{subscriber.email}</td>
                <td>{new Date(subscriber.date).toLocaleString()}</td>
                <td>
                  <button onClick={() => deleteSubscriber(subscriber._id)} className="delete-btn">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No subscribers found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button
          className="page-btn"
          onClick={handlePrev}
          disabled={currentPage === 1}
        >
          &lt; Previous
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button
          className="page-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default Subscriptions;
