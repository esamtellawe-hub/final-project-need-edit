import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./i18n";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <StrictMode>
      <BrowserRouter>
        <SocketProvider>
          <App />
        </SocketProvider>
      </BrowserRouter>
    </StrictMode>
  </AuthProvider>
);
