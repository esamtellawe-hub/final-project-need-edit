import React from "react";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#dc3545] mb-6 text-center">
        {t("about.title")}
      </h1>

      <p className="text-gray-700 text-lg mb-8 text-center">
        {t("about.intro")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-[#dc3545] mb-2">
            {t("about.visionTitle")}
          </h2>
          <p className="text-gray-600">{t("about.visionText")}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-[#dc3545] mb-2">
            {t("about.missionTitle")}
          </h2>
          <p className="text-gray-600">{t("about.missionText")}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-[#dc3545] mb-2">
            {t("about.teamTitle")}
          </h2>
          <p className="text-gray-600">{t("about.teamText")}</p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
