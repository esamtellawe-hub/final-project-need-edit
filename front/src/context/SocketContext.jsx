import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  // 💡 1. نحتاج 'user' هنا للتحقق من هوية المرسل
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState(null);

  // ... (Effect الخاص بالاتصال والانضمام يبقى كما هو) ...
  useEffect(() => {
    if (user) {
      const newSocket = io("http://127.0.0.1:5050");
      setSocket(newSocket);
      newSocket.emit("join", user.id);
      return () => newSocket.close();
    }
  }, [user]);

  // Effect للاستماع للرسائل (المستمع الوحيد)
  useEffect(() => {
    // 💡 نحتاج للتأكد من وجود 'user' قبل إضافة المستمع
    if (!socket || !user) return;

    const handleReceiveMessage = (message) => {
      // 💡 2. === (التعديل الأهم هنا) ===
      // التحقق إذا كانت الرسالة القادمة *ليست* مني
      const isNotMe = message.sender_id.toString() !== user.id.toString();

      if (isNotMe) {
        // أضف إشعاراً فقط إذا كان المرسل شخصاً آخر
        setNotifications((prev) => {
          if (!prev.includes(message.sender_id.toString())) {
            return [...prev, message.sender_id.toString()];
          }
          return prev;
        });
      }

      // 💡 3. تحديث آخر رسالة (لتراها صفحة الشات)
      // (هذا يجب أن يحدث دائماً، حتى لرسائلي، ليراها 'Chat.jsx')
      setNewMessage(message);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
    // 💡 4. إضافة 'user' إلى مصفوفة الاعتماديات
  }, [socket, user]);

  // ... (دالة removeNotification تبقى كما هي) ...
  const removeNotification = useCallback((senderId) => {
    setNotifications((prev) => prev.filter((id) => id !== senderId.toString()));
  }, []);

  const value = {
    socket,
    notifications,
    removeNotification,
    newMessage,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
