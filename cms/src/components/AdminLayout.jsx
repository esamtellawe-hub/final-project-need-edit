import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// --- (1) تم تصحيح الاستيراد (مفصول تماماً) ---
import { HiMenuAlt2, HiOutlineLogout } from "react-icons/hi"; // (الأيقونات من الحزمة القديمة)
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineArchiveBox,
} from "react-icons/hi2"; // (الأيقونات من الحزمة الجديدة)
// --- (نهاية التصحيح) ---

// قائمة الروابط
const navItems = [
  { text: "الرئيسية", icon: <HiOutlineHome className="w-6 h-6" />, path: "/" },
  {
    text: "إدارة المستخدمين",
    icon: <HiOutlineUsers className="w-6 h-6" />,
    path: "/users",
  },
  {
    text: "إدارة المنتجات",
    icon: <HiOutlineArchiveBox className="w-6 h-6" />,
    path: "/items",
  },
];

// (2) مكون السايد بار
const SidebarContent = ({ onLinkClick }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    onLinkClick();
    logout();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-20 border-b">
        <h1 className="text-2xl font-bold text-indigo-600">لوحة التحكم</h1>
      </div>
      <nav className="flex-1 mt-6">
        {navItems.map((item) => (
          <NavLink
            key={item.text}
            to={item.path}
            end
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 ${
                isActive ? "bg-gray-100 text-indigo-600 font-bold" : ""
              }`
            }
          >
            {item.icon}
            <span className="mx-3">{item.text}</span>
          </NavLink>
        ))}
      </nav>
      {/* زر تسجيل الخروج في الأسفل */}
      <div className="border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-6 py-4 text-red-600 hover:bg-red-50"
        >
          {/* (الآن HiOutlineLogout معرفة) */}
          <HiOutlineLogout className="w-6 h-6" />
          <span className="mx-3">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

// (3) المكون الرئيسي (Layout)
function AdminLayout() {
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLinkClick = () => {
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* السايد بار (للشاشات الكبيرة 'md' وما فوق) */}
      <div className="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-white shadow-lg hidden md:block">
        <SidebarContent onLinkClick={handleLinkClick} />
      </div>

      {/* السايد بار (للموبايل - يظهر كـ Modal) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* الخلفية المعتمة */}
          <div
            className="fixed inset-0 bg-black opacity-30"
            onClick={() => setIsMobileOpen(false)}
          ></div>
          {/* المحتوى */}
          <div className="relative z-50 w-64 overflow-y-auto bg-white shadow-lg">
            <SidebarContent onLinkClick={handleLinkClick} />
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <div className="flex flex-col flex-1 overflow-y-auto md:pl-64">
        {/* النافبار العلوي */}
        <header className="flex items-center justify-between h-20 bg-white border-b sticky top-0 z-20">
          {/* زر الهامبرغر (يظهر على الموبايل فقط) */}
          <button
            className="px-6 md:hidden"
            onClick={() => setIsMobileOpen(true)}
          >
            <HiMenuAlt2 className="w-6 h-6" />
          </button>

          {/* اسم المستخدم (يأخذ المساحة المتبقية) */}
          <div className="flex-1 px-6">
            <h2 className="text-xl font-semibold text-gray-800">
              أهلاً بك، {user?.name || "Admin"}
            </h2>
          </div>
        </header>

        {/* منطقة المحتوى */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
