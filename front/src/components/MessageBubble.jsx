import React from "react";
import { formatDistanceToNow } from "date-fns";
// 💡 1. استيراد اللغات المطلوبة
import { ar, enUS } from "date-fns/locale";
// 💡 2. استيراد أداة الترجمة
import { useTranslation } from "react-i18next";

const MessageBubble = ({ text, isMine, timestamp }) => {
  // 💡 3. استدعاء الهوك
  const { t, i18n } = useTranslation();

  // 💡 4. تحديد اللغة الحالية لـ date-fns
  const currentLocale = i18n.language === "ar" ? ar : enUS;

  let formattedTime = "";
  if (timestamp) {
    try {
      formattedTime = formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        // 💡 5. استخدام اللغة الديناميكية
        locale: currentLocale,
      });
    } catch (e) {
      // 💡 6. ترجمة رسالة الخطأ (اختياري لكن جيد)
      console.error(t("messageBubble.invalidTimestamp"), e);
      formattedTime = t("messageBubble.timeError");
    }
  }

  return (
    <div
      className={`flex flex-col max-w-[75%] w-fit ${
        isMine ? "self-end" : "self-start"
      }`}
    >
      <div
        className={`px-3 py-2 rounded-lg shadow-sm ${
          isMine
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-200 text-black rounded-bl-none"
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{text}</p>
      </div>
      <p
        className={`text-xs mt-1 px-1 ${
          isMine ? "text-gray-400 self-end" : "text-gray-400 self-start"
        }`}
      >
        {formattedTime}
      </p>
       {" "}
    </div>
  );
};

export default MessageBubble;
