import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext.jsx"; // 💡 1. استيراد الهوك الجديد

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  // 💡 2. جلب الإشعارات والدالة من Context
  const { notifications, removeNotification } = useSocket();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // 💡 تأكد من استخدام 127.0.0.1 إذا كان localhost لا يعمل
        const res = await axios.get(
          `http://127.0.0.1:5050/api/messages/user/${user.id}`
        );
        const msgs = Array.isArray(res.data.messages) ? res.data.messages : [];

        // تجميع الرسائل حسب المستخدم الآخر
        const grouped = {};
        msgs.forEach((msg) => {
          const otherUser =
            msg.sender_id.toString() === user.id.toString()
              ? msg.receiver
              : msg.sender;
          const otherId = otherUser?.id;

          if (!otherId) return;

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

        // تحويل الكائن المجمّع إلى مصفوفة للعرض
        const result = Object.values(grouped).map((data) => ({
          userId: data.userId,
          name: data.name,
          photo: data.photo,
          lastMessage: data.messages[0], // الأحدث هو [0]
        }));

        setConversations(result);
      } catch (err) {
        console.error("❌ Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchMessages();
    }
    // 💡 الاعتماديات: أضف user (لأن fetchMessages تعتمد عليه)
  }, [user]);

  // 💡 3. دالة جديدة للنقر على المحادثة
  const handleConversationClick = (conv) => {
    // إزالة الإشعار من الحالة العامة
    removeNotification(conv.userId);
    // الانتقال إلى صفحة الشات
    navigate(`/chat/${conv.userId}`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📨 محادثاتك</h2>

      {loading ? (
        <p className="text-gray-500">جاري تحميل المحادثات...</p>
      ) : conversations.length === 0 ? (
        <p className="text-gray-500">لا توجد محادثات بعد.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {conversations.map((conv) => {
            // 💡 4. التحقق إذا كانت هذه المحادثة تحتوي على إشعار
            const hasNewMessage = notifications.includes(
              conv.userId.toString()
            );

            return (
              <div
                key={conv.userId}
                // 💡 استخدام الدالة الجديدة عند النقر
                onClick={() => handleConversationClick(conv)}
                className="relative p-3 border rounded-lg cursor-pointer hover:bg-gray-100 flex items-center gap-3 transition-colors"
              >
                {/* 💡 5. عرض النقطة الحمراء (الإشعار) */}
                {hasNewMessage && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}

                <img
                  src={
                    conv.photo
                      ? `http://127.0.0.1:5050/uploads/${conv.photo}`
                      : "/images/profile.jpeg"
                  }
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold truncate">{conv.name}</p>
                  {/* 💡 6. تمييز الرسالة الجديدة */}
                  <p
                    className={`text-sm text-gray-600 truncate ${
                      hasNewMessage ? "font-bold text-black" : ""
                    }`}
                  >
                    {conv.lastMessage?.text || "..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;
