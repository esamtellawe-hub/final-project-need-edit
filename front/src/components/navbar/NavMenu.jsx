import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const NavMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const lang = i18n.language;

  const linkClass = (isActive) =>
    `px-3 py-2 transition-colors ${
      isActive ? "text-red-600 font-bold" : "text-gray-800 hover:text-red-600"
    }`;

  return (
    <div className="w-full bg-white ">
      {/* زر الموبايل */}
      <div className="flex justify-between items-center px-4 py-3 xl:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-3xl text-gray-800"
        >
          ☰
        </button>
      </div>

      {/* قائمة الموبايل */}
      {isOpen && (
        <nav className="xl:hidden px-4 pb-4">
          <ul className="flex flex-col gap-3 items-start">
            <li>
              <NavLink to="/" className={({ isActive }) => linkClass(isActive)}>
                {t("nav.home")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/swap"
                className={({ isActive }) => linkClass(isActive)}
              >
                {t("nav.swap")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => linkClass(isActive)}
              >
                {t("nav.contact")}
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/aboutus"
                className={({ isActive }) => linkClass(isActive)}
              >
                {t("nav.about")}
              </NavLink>
            </li>
          </ul>
        </nav>
      )}

      {/* قائمة الديسكتوب */}
      <nav className="hidden xl:flex justify-center  py-4">
        <ul className="flex gap-6 items-center flex-row-reverse">
          <li>
            <NavLink to="/" className={({ isActive }) => linkClass(isActive)}>
              {t("nav.home")}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/swap"
              className={({ isActive }) => linkClass(isActive)}
            >
              {t("nav.swap")}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => linkClass(isActive)}
            >
              {t("nav.contact")}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/aboutus"
              className={({ isActive }) => linkClass(isActive)}
            >
              {t("nav.about")}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default NavMenu;
