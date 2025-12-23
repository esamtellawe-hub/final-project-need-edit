import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // 1. إضافة حالة التحميل (تبدأ true عشان نمنع الموقع يفتح قبل التشييك)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // في حال كانت البيانات مضروبة، نظفها
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    // 2. بعد ما نخلص فحص (سواء لقينا يوزر أو لأ)، نوقف التحميل
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/Login"); // تأكد إنك مستورد useNavigate لو بدك تحول بعد الخروج
  };

  // 3. إذا لسا بنحمل (بنفحص التوكن)، لا تعرض الموقع ولا تنفذ الراوتس
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* ممكن تحط هنا سبينر أو لوجو الموقع */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    // مررنا loading كمان عشان لو حبيت تستخدمه برا
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
