import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // <-- 1. استيراد
import App from "./App.jsx";
import "./index.css"; // (يمكنك حذف App.css و index.css لاحقاً)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {" "}
      {/* <-- 2. إضافة الراوتر */}
      <AuthProvider>
        {" "}
        {/* <-- 3. إضافة مخزن الدخول */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
