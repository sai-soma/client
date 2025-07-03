import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  BsPeopleFill, 
  BsBriefcaseFill, 
  BsFileEarmarkTextFill,
  BsCheckCircleFill,
  BsHourglassSplit
} from "react-icons/bs";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [joinedCandidates, setJoinedCandidates] = useState(0);
  const [inProgressCandidates, setInProgressCandidates] = useState(0);
  const [totalResumes, setTotalResumes] = useState(0);
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchTotalUsers();
    fetchTotalJobs();
    fetchJoinedCandidates();
    fetchInProgressCandidates();
    fetchTotalResumes();
  }, []);

  const fetchTotalUsers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}api/auth/all-users`);
    const users = response.data.users;
    const userCount = users.filter(user => user.role === "user").length;
    setTotalUsers(userCount);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

  const fetchTotalJobs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/jobs/all`);
      setTotalJobs(response.data.jobs.length);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchJoinedCandidates = async () => {
    try {
      const response = await axios.get("${BASE_URL}api/applications/joined-count");
      setJoinedCandidates(response.data.joinedCount);
    } catch (error) {
      console.error("Error fetching joined candidates:", error);
    }
  };

  const fetchInProgressCandidates = async () => {
    try {
      const response = await axios.get("${BASE_URL}api/applications/in-progress-count");
      setInProgressCandidates(response.data.inProgressCount);
    } catch (error) {
      console.error("Error fetching in-progress candidates:", error);
    }
  };

  const fetchTotalResumes = async () => {
    try {
      const response = await axios.get("${BASE_URL}api/applications/resumes/count");
      setTotalResumes(response.data);
    } catch (error) {
      console.error("Error fetching total resumes:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="admin-dashboard-title">Dashboard Overview</h1>
      
      <div className="admin-dashboard-widgets">
        <div className="admin-dashboard-widget user-widget">
          <div className="widget-icon-container">
            <BsPeopleFill className="admin-dashboard-widget-icon" />
          </div>
          <div className="admin-dashboard-widget-info">
            <h3>Total Users</h3>
            <p>{totalUsers}</p>
          </div>
        </div>
        
        <div className="admin-dashboard-widget jobs-widget">
          <div className="widget-icon-container">
            <BsBriefcaseFill className="admin-dashboard-widget-icon" />
          </div>
          <div className="admin-dashboard-widget-info">
            <h3>Job Postings</h3>
            <p>{totalJobs}</p>
          </div>
        </div>
        
        <div className="admin-dashboard-widget resumes-widget">
          <div className="widget-icon-container">
            <BsFileEarmarkTextFill className="admin-dashboard-widget-icon" />
          </div>
          <div className="admin-dashboard-widget-info">
            <h3>Resumes Received</h3>
            <p>{totalResumes}</p>
          </div>
        </div>
        
        <div className="admin-dashboard-widget placed-widget">
          <div className="widget-icon-container">
            <BsCheckCircleFill className="admin-dashboard-widget-icon" />
          </div>
          <div className="admin-dashboard-widget-info">
            <h3>Candidates Placed</h3>
            <p>{joinedCandidates}</p>
          </div>
        </div>
        
        <div className="admin-dashboard-widget progress-widget">
          <div className="widget-icon-container">
            <BsHourglassSplit className="admin-dashboard-widget-icon" />
          </div>
          <div className="admin-dashboard-widget-info">
            <h3>Candidates In Progress</h3>
            <p>{inProgressCandidates}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;