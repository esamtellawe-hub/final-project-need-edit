import React from "react";
import { Link } from "react-router-dom";
import { Target, Users, Shield, Globe, Award, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <div
      dir={isRTL ? "ltr" : "rtl"}
      className="bg-gray-50 min-h-screen font-sans"
    >
      {/* 1. Hero Section */}
      <section className="relative bg-[#2a3953] text-white py-20 px-6 overflow-hidden">
        {/* خلفية زخرفية */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-[#dc3545] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up text-[#dc3545]">
            {t("about.title")}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* 2. Mission & Values */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className={`space-y-6 ${isRTL ? "text-left" : "text-right"}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-[#dc3545] rounded-full text-sm font-semibold">
              <Target size={18} /> {t("about.mission")}
            </div>
            <h2 className="text-3xl font-bold text-gray-800 leading-tight">
              {t("about.missionTitleStart")}{" "}
              <span className="text-[#dc3545]">
                {t("about.missionTitleEnd")}
              </span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {t("about.missionDesc")}
            </p>
            <div className="pt-4">
              <Link
                to="/Contact"
                className="inline-block bg-[#dc3545] text-white px-8 py-3 rounded-lg hover:bg-red-700 transition shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                {t("nav.contact")}
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* صورة تعبيرية مع تأثيرات */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Our Team"
                className="w-full h-auto object-cover"
              />
            </div>
            {/* إطار خلفي جمالي */}
            <div
              className={`absolute top-4 w-full h-full border-4 border-[#dc3545] rounded-2xl z-0 hidden md:block ${
                isRTL ? "-left-4" : "-right-4"
              }`}
            ></div>
          </div>
        </div>
      </section>

      {/* 3. Stats Section */}
      <section className="bg-[#dc3545] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="p-4 transform hover:scale-105 transition duration-300">
            <Users className="mx-auto mb-4 opacity-80" size={48} />
            <h3 className="text-4xl font-bold mb-2">+5000</h3>
            <p className="text-red-100 font-medium">{t("about.stat1")}</p>
          </div>
          <div className="p-4 transform hover:scale-105 transition duration-300 border-x-0 sm:border-x border-red-400/30">
            <TrendingUp className="mx-auto mb-4 opacity-80" size={48} />
            <h3 className="text-4xl font-bold mb-2">+1200</h3>
            <p className="text-red-100 font-medium">{t("about.stat2")}</p>
          </div>
          <div className="p-4 transform hover:scale-105 transition duration-300">
            <Award className="mx-auto mb-4 opacity-80" size={48} />
            <h3 className="text-4xl font-bold mb-2">+20</h3>
            <p className="text-red-100 font-medium">{t("about.stat3")}</p>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us (Cards) */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t("about.whyUs")}
          </h2>
          <div className="w-24 h-1 bg-[#dc3545] mx-auto rounded"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-blue-100 text-[#2a3953] rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-[#2a3953] group-hover:text-white transition-colors duration-300">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              {t("about.feature1")}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t("about.feature1Desc")}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-red-100 text-[#dc3545] rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-[#dc3545] group-hover:text-white transition-colors duration-300">
              <Target size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              {t("about.feature2")}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t("about.feature2Desc")}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 group">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 mx-auto group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <Globe size={32} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              {t("about.feature3")}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {t("about.feature3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Team Section (Updated to 2 Members) */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-12">
            {t("about.team")}
          </h2>
          <div className="flex flex-wrap justify-center gap-10">
            {/* Team Member 1 */}
            <div className="text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 transform group-hover:scale-110 transition duration-300">
                <img
                  src="/images/esam.jpeg"
                  alt="Esam Ahmed"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-lg text-[#2a3953]">
                {t("about.member1")}
              </h4>
              <p className="text-[#dc3545] text-sm">{t("about.role1")}</p>
            </div>
            {/* Team Member 2 */}
            <div className="text-center group">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 transform group-hover:scale-110 transition duration-300">
                <img
                  src="/images/profile.jpeg"
                  alt="Jana Ibrahim"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-lg text-[#2a3953]">
                {t("about.member2")}
              </h4>
              <p className="text-[#dc3545] text-sm">{t("about.role2")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
