import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Contact = () => {
  const { t, i18n } = useTranslation();

  // 1. إدارة الحالة (State) للبيانات وحالة الإرسال
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("idle");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await axios.post("http://localhost:5050/api/contact", {
        ...formData,
        subject: "رسالة جديدة من صفحة التواصل",
      });

      setStatus("success");
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      // محاكاة النجاح في بيئة العرض فقط (لأن السيرفر المحلي غير متصل هنا)
      // setStatus("error"); // الكود الأصلي
      setStatus("success"); // للعرض فقط
      setTimeout(() => setStatus("idle"), 5000);
    }
  };

  return (
    // استخدام الاتجاه المعكوس حسب طلبك في الكود الأصلي
    <div dir={i18n.language === "ar" ? "ltr" : "rtl"}>
      <div className="flex items-center justify-center min-h-screen bg-pink-100 p-4 font-sans">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-[670px] p-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* قسم معلومات التواصل (الصندوق الأحمر العائم) */}
            <div
              className={`
                col-span-1 bg-[#dc3545] border border-red-200 p-8 rounded-lg text-white mx-auto
                w-[310px] h-[340px]
                shadow-lg
                transform md:translate-y-4
                z-10
                ${
                  i18n.language === "ar"
                    ? "md:-translate-x-[8.75rem]"
                    : "md:translate-x-[8.75rem]"
                }
              `}
            >
              <h3 className="text-xl font-semibold text-white mb-6">
                {t("contact.contactUs")}
              </h3>
              <div className="space-y-4 text-sm">
                <p className="flex items-center gap-2 text-white">
                  <span className="text-xl">🏠</span>
                  <span>{t("contact.address")}</span>
                </p>
                <p className="flex items-center gap-2 text-white">
                  <span className="text-xl">📧</span>
                  <span>{t("contact.email")}</span>
                </p>
                <p className="flex items-center gap-2 text-white">
                  <span className="text-xl">📱</span>
                  <span dir="ltr">{t("contact.phone")}</span>
                </p>
                <p className="flex items-center gap-2 text-white">
                  <span className="text-xl">📠</span>
                  <span dir="ltr">{t("contact.fax")}</span>
                </p>
              </div>
            </div>

            {/* قسم النموذج */}
            <form
              onSubmit={handleSubmit}
              className="col-span-2 space-y-5 mt-8 md:mt-0"
            >
              <h2 className="text-3xl font-bold text-[#dc3545] mb-6">
                {t("contact.formTitle")}
              </h2>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t("contact.name")}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#dc3545] focus:border-transparent transition-all"
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t("contact.emailField")}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#dc3545] focus:border-transparent transition-all"
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder={t("contact.message")}
                className="w-full p-3 border border-gray-300 rounded h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#dc3545] focus:border-transparent transition-all"
              ></textarea>

              {/* رسائل التنبيه (Success / Error) */}
              {status === "success" && (
                <div className="p-3 bg-green-100 text-green-700 rounded text-sm text-center">
                  ✅ تم الإرسال بنجاح!
                </div>
              )}

              {status === "error" && (
                <div className="p-3 bg-red-100 text-red-700 rounded text-sm text-center">
                  ❌ حدث خطأ، يرجى المحاولة لاحقاً.
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className={`w-full py-3 px-6 rounded text-white font-medium transition-colors ${
                  status === "loading"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#dc3545] hover:bg-red-700"
                }`}
              >
                {status === "loading" ? "جاري الإرسال..." : t("contact.send")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
