import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Footer = () => {
  const { t } = useTranslation();
  const lang = i18n.language;
  const isRTL = lang === "ar";

  return (
    <footer
      className="bg-[#2a3953] text-white pt-10 pb-6"
      dir={isRTL ? "ltr" : "rtl"}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand & Contact Section */}
          <div
            className={`col-span-1 lg:col-span-2 ${
              isRTL ? "lg:text-justify" : "lg:text-justify"
            } text-justify`}
          >
            <h1 className="text-3xl text-[#dc3545] font-bold mb-4">
              {t("footer.brand")}
            </h1>
            <p className="mb-6 text-gray-300 text-sm leading-relaxed max-w-md mx-auto lg:mx-0"></p>

            <div className="space-y-4">
              <div
                className={`flex flex-col lg:flex-row items-center ${
                  isRTL ? "lg:justify-start" : "lg:justify-start"
                } justify-center gap-2`}
              >
                <strong className="text-gray-400 w-24">
                  {t("footer.phone")}:
                </strong>
                <a
                  href="tel:+962795723505"
                  className="text-white hover:text-[#dc3545] transition-colors font-medium dir-ltr"
                  dir="ltr"
                >
                  +962 795 723 505
                </a>
              </div>

              <div
                className={`flex flex-col lg:flex-row items-center ${
                  isRTL ? "lg:justify-start" : "lg:justify-start"
                } justify-center gap-2`}
              >
                <strong className="text-gray-400 w-24">
                  {t("footer.email")}:
                </strong>
                <a
                  href="mailto:esamtellawe@gmail.com"
                  className="text-white hover:text-[#dc3545] transition-colors font-medium"
                >
                  Exchango@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Spacer Column */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Useful Links Section */}
          {/* تم تعديل التنسيق هنا ليعكس الاتجاه المطلوب: يسار للعربية، يمين للإنجليزية */}
          <div
            className={`col-span-1 ${
              isRTL ? "lg:text-left" : "lg:text-right"
            } text-center`}
          >
            <h5 className="text-xl text-[#dc3545] font-semibold mb-6 relative inline-block">
              {t("footer.usefulLinks")}
              <span className="absolute bottom-[-8px] left-0 w-full h-0.5 bg-gray-600 rounded opacity-50"></span>
            </h5>

            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-[#dc3545] hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/Swap"
                  className="text-gray-300 hover:text-[#dc3545] hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  {t("nav.swap")}
                </Link>
              </li>
              <li>
                <Link
                  to="/Contact"
                  className="text-gray-300 hover:text-[#dc3545] hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <Link
                  to="/Aboutus"
                  className="text-gray-300 hover:text-[#dc3545] hover:translate-x-1 transition-all duration-300 inline-block"
                >
                  {t("nav.about")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 pt-6 mt-8 text-center text-sm text-gray-400 flex flex-col md:flex-row justify-center items-center gap-1">
          <span>
            © {new Date().getFullYear()}{" "}
            <strong>{t("footer.copyright")}</strong>
          </span>
          <span className="hidden md:inline mx-2">-</span>
          <span>
            <span className="text-[#dc3545] font-bold mx-1">
              {t("footer.owner")}
            </span>{" "}
            {t("footer.rights")}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
