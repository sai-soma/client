import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useStateContext } from "./StateContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useStateContext();
  const BASE_URL = process.env.REACT_APP_API_URL;

  // Fetch notifications
  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.userId || !user?.createdAt) return;

    try {
      const response = await axios.get(`${BASE_URL}api/notifications?userId=${user.userId}`);

      const allNotifications = response.data.notifications || [];

      // Convert user.createdAt to Date object
      const userCreatedAt = new Date(user.createdAt);

      // Filter: only show notifications created after user signup
      const filtered = allNotifications.filter((n) => {
        return new Date(n.createdAt) > userCreatedAt;
      });

      // Deduplicate (just in case)
      const seen = new Set();
      const uniqueNotifications = filtered.filter((n) => {
        if (seen.has(n._id)) return false;
        seen.add(n._id);
        return true;
      });

      // Sort by latest first
      uniqueNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(uniqueNotifications);

      const unread = uniqueNotifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${BASE_URL}api/notifications/${notificationId}/read`);

      // Update local state
      setNotifications((prevNotifications) => prevNotifications.map((notification) => (notification._id === notificationId ? { ...notification, isRead: true } : notification)));

      // Update unread count
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.userId) return;

    try {
      await axios.put(`${BASE_URL}api/notifications/read-all?userId=${user.userId}`);

      // Update local state
      setNotifications((prevNotifications) => prevNotifications.map((notification) => ({ ...notification, isRead: true })));

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Add a notification manually (for real-time updates)
  const addNotification = (notification) => {
    // Specify the notification type
    const notificationType = notification.type || "general";

    // Add the new notification to the top of the list
    setNotifications((prev) => [
      {
        ...notification,
        type: notificationType,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setUnreadCount((prev) => prev + 1);
  };

  // Fetch notifications when user changes or component mounts
  useEffect(() => {
    if (user?.userId) {
      fetchNotifications();

      // Set up polling interval (every 30 seconds)
      const interval = setInterval(fetchNotifications, 30000);

      // Clean up on unmount
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

  // Filter notifications by type if needed
  const getJobStatusNotifications = () => {
    return notifications.filter((n) => n.type === "application_status");
  };

  const getNewJobNotifications = () => {
    return notifications.filter((n) => n.type === "new_job");
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        addNotification,
        getJobStatusNotifications,
        getNewJobNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
