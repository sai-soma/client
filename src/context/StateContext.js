import { createContext, useContext, useEffect, useRef, useState } from "react";

// Create Context with default values
const StateContext = createContext({
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
});

// Provider Component
export const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const initialized = useRef(false); // Prevent double execution in Strict Mode
  const [activeItem, setActiveItem] = useState("dashboard");

  useEffect(() => {
    if (initialized.current) return; // Prevent duplicate runs in Strict Mode
    initialized.current = true;

    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user"); // Remove corrupted data
    }
  }, []);

  // Function to log in and store user
  const login = (userData, token) => {
    if (userData && typeof userData === "object") {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } else {
      console.error("Invalid user data", userData);
    }
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <StateContext.Provider value={{ user, setUser, login, logout, activeItem, setActiveItem }}>
      {children}
    </StateContext.Provider>
  );
};

// Custom hook to use context
export const useStateContext = () => {
  return useContext(StateContext);
};