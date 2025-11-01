import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-[#dc3545] mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-6">
        {t("notFound.message") || "الصفحة غير موجودة"}
      </p>
      <button
        onClick={() => navigate("/")}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        {t("notFound.back") || "العودة للصفحة الرئيسية"}
      </button>
    </div>
  );
};

export default NotFound;
