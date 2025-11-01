import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";

const Footer = () => {
  const { t } = useTranslation();
  const lang = i18n.language;
  const isRTL = lang === "ar";

  return (
    <footer className="bg-[#2a3953] text-white pt-6 pb-4 ">
      <div
        className={`max-w-7xl mx-auto px-4 flex justify-between flex-col md:flex-row ${
          isRTL ? "md:flex-row-reverse" : ""
        } gap-8`}
      >
        {/* About Section */}
        <div className="md:w-1/2 lg:w-1/3 ">
          <h1 className="text-2xl text-[#dc3545] font-bold mb-4">
            {t("footer.brand")}
          </h1>
          <div className="space-y-2">
            <p className={`${isRTL ? "text-right" : "text-left"}`}>
              <strong>{t("footer.phone")}:</strong>{" "}
              <a
                href="tel:+962795723505"
                className="text-[#dc3545] hover:underline"
              >
                +962 795 723 505
              </a>
            </p>
            <p className={`${isRTL ? "text-right" : "text-left"}`}>
              <strong>{t("footer.email")}:</strong>{" "}
              <a
                href="mailto:esamtellawe@gmail.com"
                className="text-[#dc3545] hover:underline"
              >
                esamtellawe@gmail.com
              </a>
            </p>
          </div>
        </div>

        {/* Useful Links */}
        <div className="md:w-1/2 lg:w-1/4">
          <h5 className="text-lg text-[#dc3545] font-semibold mb-3">
            {t("footer.usefulLinks")}
          </h5>
          <ul className={`space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
            <li>
              <Link to="/" className="hover:text-[#dc3545] transition-colors">
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link
                to="/Swap"
                className="hover:text-[#dc3545] transition-colors"
              >
                {t("nav.swap")}
              </Link>
            </li>
            <li>
              <Link
                to="/Contact"
                className="hover:text-[#dc3545] transition-colors"
              >
                {t("nav.contact")}
              </Link>
            </li>
            <li>
              <Link
                to="/Aboutus"
                className="hover:text-[#dc3545] transition-colors"
              >
                {t("nav.about")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-6 border-t border-white/30 pt-4 text-sm">
        <p>
          © <strong>{t("footer.copyright")}</strong>{" "}
          <span className="text-[#dc3545] font-semibold">
            {t("footer.owner")}
          </span>{" "}
          — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
