import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import MessageBubble from "../components/MessageBubble";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
// 💡 1. استيراد أداة الترجمة
import { useTranslation } from "react-i18next";

// --- كومبوننت الإعلان المصغر (سياق المحادثة) ---
const ItemContextCard = ({ item }) => {
  // 💡 2. استدعاء الهوك هنا أيضاً
  const { t } = useTranslation();
  if (!item) return null;

  return (
    <div className="p-2 border-b bg-gray-50 flex items-center gap-3">
      <img
        src={`http://127.0.0.1:5050/uploads/${item.cover_image}`}
        alt={item.title}
        className="w-14 h-14 rounded-md object-cover"
      />
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{item.title}</p>
        {/* 💡 3. استبدال النصوص */}
        <p className="text-sm text-gray-600">
          {t("chat.estimatedValue")}: {item.price} {t("chat.currency")}
        </p>
      </div>
    </div>
  );
};

// --- كومبوننت الشات الرئيسي ---
const Chat = () => {
  // 💡 4. استدعاء الهوك الرئيسي
  const { t } = useTranslation();
  const { receiverId } = useParams();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");

  const { socket, removeNotification, newMessage } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const messagesEndRef = useRef(null);

  // ... (كل اللوجيك الخاص بـ Effects و sendMessage يبقى كما هو) ...
  // --- دالة ودEffect للـ Auto-scroll ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);

  // Effect 1: لجلب البيانات
  useEffect(() => {
    if (!user?.id || !receiverId) {
      setLoading(false);
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:5050/api/messages/conversation/${user.id}/${receiverId}`
        );
        if (!response.ok) throw new Error("Failed to fetch chat history");
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchItem = async () => {
      if (itemId) {
        try {
          const res = await axios.get(
            `http://127.0.0.1:5050/api/items/${itemId}`
          );
          setItem(res.data.item);
        } catch (err) {
          console.error("Failed to fetch item details:", err);
        }
      } else {
        setItem(null);
      }
    };
    fetchHistory();
    fetchItem();
  }, [user?.id, receiverId, itemId]);

  // Effect 2: يراقب الرسائل القادمة من Context
  useEffect(() => {
    if (
      newMessage &&
      user?.id &&
      ((newMessage.sender_id.toString() === user.id.toString() &&
        newMessage.receiver_id.toString() === receiverId.toString()) ||
        (newMessage.sender_id.toString() === receiverId.toString() &&
          newMessage.receiver_id.toString() === user.id.toString()))
    ) {
      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(
          (msg) => msg.id === newMessage.id
        );
        if (isDuplicate) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
    }
  }, [newMessage, receiverId, user?.id]);

  // Effect 3: لإزالة الإشعار
  useEffect(() => {
    if (removeNotification && receiverId) {
      removeNotification(receiverId);
    }
  }, [receiverId, removeNotification]);

  // دالة إرسال رسالة
  const sendMessage = () => {
    if (!text.trim() || !user?.id || !receiverId) return;
    const msg = { sender_id: user.id, receiver_id: receiverId, text };
    if (socket) {
      socket.emit("sendMessage", msg);
    }
    setText("");
  };

  // 💡 5. استبدال نص التحميل
  if (loading && messages.length === 0) {
    return <div className="p-4 text-center">{t("chat.loading")}</div>;
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col h-[calc(100vh-100px)] bg-white rounded-lg shadow-xl overflow-hidden">
      <ItemContextCard item={item} />

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 m-auto">
            {/* 💡 6. استبدال النصوص الديناميكية (مع تمرير متغير) */}
            {item
              ? t("chat.startConversationWithItem", { title: item.title })
              : t("chat.startConversation")}
          </p>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              text={msg.text}
              isMine={msg.sender_id.toString() === user?.id.toString()}
              timestamp={msg.created_at}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-3 p-3 border-t bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border-gray-300 px-4 py-2 rounded-full shadow-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          // 💡 7. استبدال نص Placeholder
          placeholder={t("chat.placeholder")}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim()}
          className="bg-blue-600 text-white w-10 h-10 rounded-full shadow-sm hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.105 3.105a.75.75 0 01.884-.043l13.25 8.5a.75.75 0 010 1.273l-13.25 8.5a.75.75 0 01-1.07-.636V3.778a.75.75 0 01.186-.527z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Chat;
