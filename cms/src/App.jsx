import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminItems from "./pages/AdminItems"; // <-- 1. تم إضافة هذا السطر

// "حارس" لحماية الصفحات الداخلية
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    // إذا لم يكن مسجلاً، أعده لصفحة اللوجن
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {" "}
      <Route
        path="/login"
        element={token ? <Navigate to="/" replace /> : <LoginPage />}
      />{" "}
      <Route
        path="/*" // أي مسار آخر (الداشبورد، المستخدمين، إلخ)
        element={
          <ProtectedRoute>
            <AdminLayout />{" "}
          </ProtectedRoute>
        }
      >
        {/* المسارات داخل لوحة التحكم */}
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="items" element={<AdminItems />} />{" "}
        {/* <-- 2. تم تعديل هذا السطر */}{" "}
      </Route>{" "}
    </Routes>
  );
}

export default App;
