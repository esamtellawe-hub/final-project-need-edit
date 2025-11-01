// src/context/AuthContext.jsx

import React, { createContext, useState, useContext } from "react";
import axios from "axios";

// 1. إعداد الرابط الأساسي للـ API
const api = axios.create({
  baseURL: "http://localhost:5050/api",
});

// 2. قراءة التوكن وبيانات المستخدم من localStorage فوراً
const storedToken = localStorage.getItem("adminToken");
let storedUser = null;
try {
  storedUser = JSON.parse(localStorage.getItem("adminUser"));
} catch (e) {
  console.error("Failed to parse user from localStorage", e);
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
}

if (storedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
}

// 3. (هذا هو السطر الذي كان ناقصاً)
// إنشاء الـ Context
const AuthContext = createContext(null);

// 4. إنشاء "المزود" (Provider)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(storedUser);
  const [token, setToken] = useState(storedToken);
  const [loading, setLoading] = useState(false);

  // دالة تسجيل الدخول
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/users/login", { email, password });

      if (response.data.user.role !== "admin") {
        throw new Error("أنت لست آدمن");
      }

      const userData = response.data.user;

      setToken(response.data.token);
      setUser(userData);
      localStorage.setItem("adminToken", response.data.token);
      localStorage.setItem("adminUser", JSON.stringify(userData));

      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      setLoading(false);
      return true;
    } catch (err) {
      console.error("فشل تسجيل الدخول:", err);
      setLoading(false);
      throw err;
    }
  };

  // دالة تسجيل الخروج
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    // الآن 'AuthContext' معرف
    <AuthContext.Provider value={{ user, token, login, logout, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. إنشاء "Hook" مخصص لسهولة الاستخدام
export const useAuth = () => {
  return useContext(AuthContext); // 'AuthContext' معرف هنا أيضاً
};
