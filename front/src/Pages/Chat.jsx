import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  X,
  Check,
  Clock,
  AlertTriangle,
} from "lucide-react";

// --- كومبوننت نافذة تأكيد الحذف (الجديد) ---
const DeleteModal = ({ isOpen, onClose, onConfirm, isRTL }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform scale-100 transition-all border border-gray-100"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500">
            <Trash2 size={28} />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {isRTL ? "حذف الرسالة؟" : "Delete Message?"}
          </h3>

          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {isRTL
              ? "هل أنت متأكد من أنك تريد حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء."
              : "Are you sure you want to delete this message? This action cannot be undone."}
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-200"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-lg shadow-red-500/30 transition-all duration-200"
            >
              {isRTL ? "نعم، احذف" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- كومبوننت الإعلان المصغر ---
const ItemContextCard = ({ item }) => {
  const { t } = useTranslation();
  if (!item) return null;

  return (
    <div className="px-4 py-3 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-10 shadow-sm flex items-center gap-4 transition-all hover:bg-gray-50">
      <img
        src={`http://localhost:5050/uploads/${item.cover_image}`}
        alt={item.title}
        className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
        onError={(e) =>
          (e.target.src = "https://via.placeholder.com/150?text=No+Img")
        }
      />
      <div className="flex-1">
        <p className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">
          {item.title}
        </p>
        <p className="text-xs md:text-sm text-[#dc3545] font-medium">
          {t("chat.estimatedValue")}: {item.price} {t("chat.currency", "JOD")}
        </p>
      </div>
    </div>
  );
};

// --- كومبوننت فقاعة الرسالة ---
const ChatBubble = ({ msg, isMine, onEdit, onDeleteRequest, isRTL }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const isEditable = () => {
    if (!isMine) return false;
    const diff = new Date() - new Date(msg.created_at);
    return diff < 2 * 60 * 1000; // 2 minutes
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex w-full mb-4 ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[75%] md:max-w-[60%] group ${
          isMine
            ? "bg-[#2a3953] text-white rounded-l-2xl rounded-tr-2xl rounded-br-none"
            : "bg-white text-gray-800 border border-gray-200 rounded-r-2xl rounded-tl-2xl rounded-bl-none shadow-sm"
        } p-3 transition-all duration-200`}
      >
        <p className="text-sm md:text-base leading-relaxed break-words whitespace-pre-wrap">
          {msg.text}
        </p>

        <div
          className={`flex items-center gap-1 text-[10px] mt-1 ${
            isMine ? "text-gray-300 justify-end" : "text-gray-400 justify-start"
          }`}
        >
          {msg.is_edited && <span>(edited)</span>}
          <span>{formatTime(msg.created_at)}</span>
        </div>

        {isMine && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-black/20 text-white/80"
            >
              <MoreVertical size={14} />
            </button>

            {showMenu && (
              <div
                ref={menuRef}
                className={`absolute top-6 bg-white text-gray-800 rounded-lg shadow-lg py-1 w-28 z-20 overflow-hidden text-sm ${
                  isRTL ? "left-0" : "right-0"
                }`}
              >
                {isEditable() ? (
                  <button
                    onClick={() => {
                      onEdit(msg);
                      setShowMenu(false);
                    }}
                    className="w-full text-start px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit2 size={12} className="text-blue-600" />
                    <span>{isRTL ? "تعديل" : "Edit"}</span>
                  </button>
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-400 italic text-center">
                    {isRTL ? "انتهى الوقت" : "Time expired"}
                  </div>
                )}
                <button
                  onClick={() => {
                    onDeleteRequest(msg.id); // 🔥 تغيير هنا: طلب الحذف وليس الحذف المباشر
                    setShowMenu(false);
                  }}
                  className="w-full text-start px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 size={12} />
                  <span>{isRTL ? "حذف" : "Delete"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- الكومبوننت الرئيسي ---
const Chat = () => {
  const { t, i18n } = useTranslation();
  const { receiverId } = useParams();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get("itemId");
  const isRTL = i18n.language === "ar";

  const { socket, removeNotification } = useSocket();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);

  // 🔥 حالة جديدة للتحكم في نافذة الحذف
  const [messageToDelete, setMessageToDelete] = useState(null);

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, editingMsgId]);

  // 1. Fetch History & Item
  useEffect(() => {
    if (!user?.id || !receiverId) {
      setLoading(false);
      return;
    }
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5050/api/messages/conversation/${user.id}/${receiverId}`
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
            `http://localhost:5050/api/items/${itemId}`
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

  // 2. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      if (
        (newMsg.sender_id.toString() === receiverId &&
          newMsg.receiver_id.toString() === user.id.toString()) ||
        (newMsg.sender_id.toString() === user.id.toString() &&
          newMsg.receiver_id.toString() === receiverId)
      ) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      }
    };

    const handleMessageUpdated = (updatedMsg) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === updatedMsg.id
            ? { ...msg, text: updatedMsg.text, is_edited: true }
            : msg
        )
      );
    };

    const handleMessageDeleted = (deletedId) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
    };

    socket.on("receiveMessage", handleNewMessage);
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("receiveMessage", handleNewMessage);
      socket.off("messageUpdated", handleMessageUpdated);
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [socket, receiverId, user?.id]);

  useEffect(() => {
    if (removeNotification && receiverId) {
      removeNotification(receiverId);
    }
  }, [receiverId, removeNotification]);

  const handleSendMessage = () => {
    if (!text.trim() || !user?.id || !receiverId) return;

    if (editingMsgId) {
      socket.emit("editMessage", {
        id: editingMsgId,
        text: text,
        receiver_id: receiverId,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMsgId ? { ...msg, text, is_edited: true } : msg
        )
      );

      setEditingMsgId(null);
      setText("");
    } else {
      const msg = { sender_id: user.id, receiver_id: receiverId, text };
      socket.emit("sendMessage", msg);
      setText("");
    }
  };

  const handleEditClick = (msg) => {
    setEditingMsgId(msg.id);
    setText(msg.text);
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setText("");
  };

  // 🔥 1. عند الضغط على أيقونة الحذف في الرسالة
  const handleDeleteRequest = (msgId) => {
    setMessageToDelete(msgId); // نفتح المودال بحفظ الآيدي
  };

  // 🔥 2. عند تأكيد الحذف من المودال
  const confirmDelete = () => {
    if (messageToDelete) {
      socket.emit("deleteMessage", {
        id: messageToDelete,
        receiver_id: receiverId,
      });
      setMessages((prev) => prev.filter((m) => m.id !== messageToDelete));
      setMessageToDelete(null); // إغلاق المودال
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#dc3545]"></div>
      </div>
    );
  }

  return (
    <>
      <div
        className="max-w-2xl mx-auto h-[calc(100vh-80px)] mt-4 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 font-sans"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <ItemContextCard item={item} />

        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f2f5]"
          style={{
            backgroundImage:
              'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
            opacity: 0.95,
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-80">
              <div className="bg-white p-4 rounded-full shadow-sm mb-3">
                <Clock size={32} className="text-[#2a3953]" />
              </div>
              <p className="font-medium">
                {item
                  ? t("chat.startConversationWithItem", { title: item.title })
                  : t("chat.startConversation")}
              </p>
              <p className="text-xs text-gray-400 mt-1">Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                msg={msg}
                isMine={msg.sender_id.toString() === user?.id.toString()}
                onEdit={handleEditClick}
                // نمرر دالة الطلب بدلاً من الحذف المباشر
                onDeleteRequest={handleDeleteRequest}
                isRTL={isRTL}
              />
            ))
          )}
        </div>

        <div className="p-3 bg-white border-t border-gray-100 flex items-end gap-2 relative">
          {editingMsgId && (
            <div className="absolute -top-10 left-0 right-0 bg-gray-100 px-4 py-2 flex justify-between items-center text-sm border-b border-gray-200">
              <span className="flex items-center gap-2 text-blue-600 font-medium">
                <Edit2 size={14} />{" "}
                {t("chat.editingMessage", "Editing message...")}
              </span>
              <button
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-gray-100 text-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2a3953] focus:bg-white transition-all resize-none max-h-32 min-h-[50px] shadow-inner"
            placeholder={t("chat.placeholder", "Type a message...")}
            rows={1}
          />

          <button
            onClick={handleSendMessage}
            disabled={!text.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform transform active:scale-95 ${
              text.trim()
                ? editingMsgId
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-[#2a3953] hover:bg-[#1f2b41] text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {editingMsgId ? (
              <Check size={20} />
            ) : (
              <Send size={20} className={isRTL ? "rotate-180" : ""} />
            )}
          </button>
        </div>
      </div>

      {/* 🔥 استدعاء نافذة الحذف الجديدة خارج حاوية الشات الرئيسية */}
      <DeleteModal
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={confirmDelete}
        isRTL={isRTL}
      />
    </>
  );
};

export default Chat;
