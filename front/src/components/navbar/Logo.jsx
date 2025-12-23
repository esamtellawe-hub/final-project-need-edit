import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Logo = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <Link to="/" className="no-underline">
        <h1 className="text-[#dc3545] font-bold m-0 text-4xl">
          {t("nav.brand")}
        </h1>
      </Link>
    </div>
  );
};

export default Logo;
