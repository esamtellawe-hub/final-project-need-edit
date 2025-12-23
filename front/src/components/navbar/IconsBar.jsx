import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

const IconsBar = () => {
  const { user } = useAuth();
  const { notifications } = useSocket();
  const notificationCount = notifications?.length || 0;
  const navigate = useNavigate();

  // دالة للتعامل مع النقر على المفضلة
  const handleFavoritesClick = (e) => {
    if (!user) {
      e.preventDefault(); // منع الانتقال الافتراضي
      navigate("/Login"); // التوجيه لصفحة الدخول
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* 1. أيقونة القلب (Favorites) - جديدة 🔥 */}
      <Link
        to="/Favorites"
        onClick={handleFavoritesClick}
        className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#dc3545]"
        title={user ? "المفضلة" : "سجل الدخول للمفضلة"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </Link>

      {/* 2. أيقونة الرسائل */}
      <Link
        to="/messages"
        className="mr-3 relative p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#dc3545]"
        title="الرسائل"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
          />
        </svg>

        {/* Badge */}
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-[#dc3545] text-white text-[10px] font-bold rounded-full flex items-center justify-center transform translate-x-1/4 -translate-y-1/4 border border-white">
            {notificationCount}
          </span>
        )}
      </Link>

      {/* 3. أيقونة البروفايل / تسجيل الدخول */}
      {user ? (
        <Link
          to="/Profile"
          className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#dc3545]"
          title="الملف الشخصي"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </Link>
      ) : (
        <Link
          to="/Login"
          className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-700 hover:text-[#dc3545]"
          title="تسجيل الدخول"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </Link>
      )}
    </div>
  );
};

export default IconsBar;
