import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// 💡 1. استيراد الهوك الخاص بالسوكيت
import { useSocket } from "../../context/SocketContext";

const IconsBar = () => {
  const { user } = useAuth();
  // 💡 2. جلب الإشعارات وحساب العدد
  const { notifications } = useSocket();
  const notificationCount = notifications?.length || 0;

  return (
    <div className="flex items-center">
      {user ? (
        <>
          {/* أيقونة البروفايل */}
          <Link to="/Profile" className="mr-3" title="الملف الشخصي">
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
          {/* زر تسجيل خروج (يمكن إضافته هنا لاحقاً) */}
        </>
      ) : (
        <Link to="/Login" className="mr-3" title="تسجيل الدخول">
          {/* ... (أيقونة الدخول) ... */}
        </Link>
      )}

      {/* 💡 3. تعديل رابط الرسائل */}
      <Link to="/messages" className="mr-3 relative" title="الرسائل">
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

        {/* 💡 4. إضافة الشارة (Badge) */}
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
            {notificationCount}
          </span>
        )}
      </Link>
    </div>
  );
};

export default IconsBar;
