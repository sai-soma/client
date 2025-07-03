import React, { useState, useEffect } from 'react';
import Topbar from '../components/User/topbar/Topbar';
import Sidebar from '../components/User/sidebar1/Sidebar1';
import { useLocation } from 'react-router-dom';

const UserPage = ({ initialActiveItem }) => {
  const [activeItem, setActiveItem] = useState(initialActiveItem || "dashboard");
  const location = useLocation();

  // Effect to handle direct navigation to specific routes
  useEffect(() => {
    const pathToItemMap = {
      '/jobs': 'fullTimeJobs',
      '/appliedJobs': 'appliedJobs',
      '/myWallet': 'myWallet',
      '/transactionHistory': 'transactionHistory'
    };

    const matchedPath = Object.keys(pathToItemMap).find(path => 
      location.pathname.startsWith(path)
    );

    if (matchedPath) {
      setActiveItem(pathToItemMap[matchedPath]);
    }
  }, [location.pathname]);

  return (
    <div className="user-page">
      <Topbar />
      <Sidebar 
        initialActiveItem={activeItem} 
        setParentActiveItem={setActiveItem} 
        currentPath={location.pathname}
      />
    </div>
  );
};

export default UserPage;