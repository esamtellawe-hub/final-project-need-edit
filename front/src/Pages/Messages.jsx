import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { formatDistanceToNow } from "date-fns";
// ✅ استيراد اللغتين للتاريخ
import { ar, enUS } from "date-fns/locale";
// ✅ استيراد هوك الترجمة
import { useTranslation } from "react-i18next";

const Messages = () => {
  const { t, i18n } = useTranslation(); // ✅ تفعيل الترجمة
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { notifications, removeNotification } = useSocket();

  // تحديد اتجاه الصفحة بناءً على اللغة
  const isRTL = i18n.language === "ar";

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `http://127.0.0.1:5050/api/messages/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const msgs = Array.isArray(res.data.messages) ? res.data.messages : [];

        // تجميع الرسائل
        const grouped = {};
        msgs.forEach((msg) => {
          const isSender = msg.sender_id.toString() === user.id.toString();
          const otherUser = isSender ? msg.receiver : msg.sender;

          if (!otherUser?.id) return;

          const otherId = otherUser.id;

          if (!grouped[otherId]) {
            grouped[otherId] = {
              userId: otherId,
              name: otherUser.name,
              photo: otherUser.photo,
              messages: [],
            };
          }
          grouped[otherId].messages.push(msg);
        });

        // تحويل وترتيب المحادثات حسب الأحدث
        const result = Object.values(grouped)
          .map((data) => ({
            userId: data.userId,
            name: data.name,
            photo: data.photo,
            lastMessage: data.messages[0],
          }))
          .sort(
            (a, b) =>
              new Date(b.lastMessage.createdAt) -
              new Date(a.lastMessage.createdAt)
          );

        setConversations(result);
      } catch (err) {
        console.error("❌ Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  const handleConversationClick = (conv) => {
    removeNotification(conv.userId);
    navigate(`/chat/${conv.userId}`);
  };

  // ✅ تنسيق الوقت ديناميكياً حسب اللغة المختارة
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: isRTL ? ar : enUS, // تبديل لغة التاريخ
      });
    } catch (e) {
      return e;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "ltr" : "rtl "} // ✅ اتجاه ديناميكي
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            📨 {t("messages.title")}
          </h2>
          <span className="bg-[#dc3545]/10 text-[#dc3545] text-sm font-bold px-4 py-1.5 rounded-full border border-[#dc3545]/20">
            {t("messages.conversationCount", { count: conversations.length })}
          </span>
        </div>

        {loading ? (
          // Skeleton Loading
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <div
                  className={`rounded-full bg-gray-200 h-14 w-14 ${
                    isRTL ? "ml-4" : "mr-4"
                  }`}
                ></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          // Empty State
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="text-gray-300 text-7xl mb-4">💬</div>
            <p className="text-gray-500 text-xl font-medium">
              {t("messages.emptyState.title")}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t("messages.emptyState.subtitle")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const hasNewMessage = notifications.includes(
                conv.userId.toString()
              );

              return (
                <div
                  key={conv.userId}
                  onClick={() => handleConversationClick(conv)}
                  className={`group relative p-4 bg-white rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 flex items-center gap-4
                    ${
                      hasNewMessage
                        ? isRTL
                          ? "border-r-4 border-r-[#dc3545] bg-red-50/10"
                          : "border-l-4 border-l-[#dc3545] bg-red-50/10"
                        : "border-gray-100 hover:border-red-100"
                    }
                  `}
                >
                  {/* Avatar Section */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        conv.photo
                          ? `http://127.0.0.1:5050/uploads/${conv.photo}`
                          : "/images/profile.jpeg"
                      }
                      alt={conv.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = "/images/profile.jpeg";
                      }}
                    />
                    {hasNewMessage && (
                      <span
                        className={`absolute bottom-1 ${
                          isRTL ? "right-1" : "left-1"
                        } w-4 h-4 bg-[#dc3545] border-2 border-white rounded-full animate-bounce shadow-md`}
                      ></span>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className={`text-lg truncate ${
                          hasNewMessage
                            ? "font-bold text-gray-900"
                            : "font-semibold text-gray-800"
                        }`}
                      >
                        {conv.name}
                      </h3>
                      <span
                        className={`text-xs ${
                          hasNewMessage
                            ? "text-[#dc3545] font-bold"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(conv.lastMessage?.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {conv.lastMessage?.sender_id.toString() ===
                        user.id.toString() && (
                        <span className="text-xs text-gray-400">
                          {t("messages.you")}
                        </span>
                      )}
                      <p
                        className={`text-sm truncate max-w-[80%] ${
                          hasNewMessage
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {conv.lastMessage?.text || t("messages.photo")}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Icon (Flip based on direction) */}
                  <div
                    className={`text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform ${
                      isRTL
                        ? "translate-x-2 group-hover:translate-x-0"
                        : "-translate-x-2 group-hover:translate-x-0"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 text-[#dc3545] ${
                        isRTL ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
