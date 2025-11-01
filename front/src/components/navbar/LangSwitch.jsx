import React from "react";
import i18n from "../../i18n";

const setGlobalLanguage = (lang) => {
  // تغيير اللغة في i18n
  i18n.changeLanguage(lang);

  // حفظ اللغة في localStorage
  localStorage.setItem("preferredLang", lang);

  // ضبط الاتجاه على مستوى HTML
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  // ريفرش خفيف (اختياري)
  window.location.reload(); // أو استخدم navigate(0) لو عندك React Router
};

const LangSwitch = () => {
  return (
    <div className="flex gap-2 items-center">
      <a
        href="#"
        className="text-[#dc3545] font-bold no-underline hover:underline"
        onClick={(e) => {
          e.preventDefault();
          setGlobalLanguage("en");
        }}
      >
        AR
      </a>

      <span className="text-[#dc3545]">|</span>

      <a
        href="#"
        className="text-[#dc3545] font-bold no-underline hover:underline"
        onClick={(e) => {
          e.preventDefault();
          setGlobalLanguage("ar");
        }}
      >
        EN
      </a>
    </div>
  );
};

export default LangSwitch;
