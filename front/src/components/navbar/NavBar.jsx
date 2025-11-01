import React from "react";
import LangSwitch from "./LangSwitch";
import Logo from "./Logo";
import IconsBar from "./IconsBar";
import NavMenu from "./NavMenu";

const Navbar = () => {
  return (
    <header className="sticky top-0 bg-white shadow z-50">
      {/* Topbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* يسار: اللغة */}
        <LangSwitch />

        {/* وسط: اللوجو */}
        <div className="flex-1 flex justify-center">
          <Logo />
        </div>

        {/* يمين: الأيقونات وزر القائمة */}
        <IconsBar />
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex-row-reverse">
        <NavMenu />
      </div>
    </header>
  );
};

export default Navbar;
