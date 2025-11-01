// utils/language.js
export const setLanguage = (lang, setLangState) => {
  localStorage.setItem("preferredLang", lang);
  setLangState(lang);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
};
