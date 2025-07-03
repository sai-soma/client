import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "@fontsource/poppins";
import { ContextProvider } from "./context/StateContext"; // Import ContextProvider

// import '@fontsource/poppins/400.css';  // Regular weight
// import '@fontsource/poppins/600.css';  // Bold weight

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ContextProvider>
    <Router>
      <App />
    </Router>
  </ContextProvider>
);