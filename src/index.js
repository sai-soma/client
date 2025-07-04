import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { HashRouter } from 'react-router-dom';
import "@fontsource/poppins";
import { ContextProvider } from "./context/StateContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ContextProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ContextProvider>
  </React.StrictMode>
);
