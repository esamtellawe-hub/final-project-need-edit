import React from "react";
import Graphic from "../../public/images/Graphic (1).svg";
import swaping from "../../public/images/swaping (2).png";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const Home = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth(); // عشان نعرف اذا مسجل دخول
  const navigate = useNavigate(); // عشان التنقل

  // 2. دالة الفحص عند الضغط
  const handleAddItemClick = () => {
    if (user) {
      navigate("/AddItem");
    } else {
      navigate("/Login");
    }
  };
  return (
    <div dir={i18n.language === "ar" ? "ltr" : "rtl"}>
      {/* القسم الأول */}
      <section className="flex flex-col xl:flex-row items-center justify-around py-10 px-4 xl:px-20">
        <div className="text-center xl:text-start mb-8 xl:mb-0 max-w-xl">
          <h1 className="text-[#dc3545] font-bold text-4xl xl:text-5xl">
            {t("home.title")}
          </h1>
          <p className="text-gray-700 text-lg mt-4">{t("home.description")}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center xl:justify-start">
            <button
              onClick={handleAddItemClick}
              className="bg-[#dc3545] text-white px-6 py-3 rounded-lg text-lg hover:bg-red-700 transition"
            >
              {t("home.listButton")}
            </button>

            <Link to="/Swap">
              <button className="border border-[#dc3545] text-[#dc3545] px-6 py-3 rounded-lg text-lg hover:bg-[#dc3545] transition hover:text-white">
                {t("home.swipeButton")}
              </button>
            </Link>
          </div>
        </div>
        <div className="text-center">
          {/* التعديل تم هنا */}
          <img
            src={Graphic}
            alt={t("home.graphicAlt")}
            className="max-w-sm w-full"
          />
        </div>
      </section>

      {/* القسم الثاني */}
      <section className="py-10 px-4 xl:px-20 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="text-center xl:text-start max-w-xl">
            <h2 className="text-[#dc3545] font-bold text-3xl mb-4">
              {t("home.badlineTitle")}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {t("home.badlineDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* القسم الثالث */}
      <section className="py-10 px-4 xl:px-20 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="text-center">
            <img
              src={swaping}
              alt={t("home.swapAlt")}
              className="max-w-lg w-full"
            />
          </div>
          <div className="text-center xl:text-start max-w-xl">
            <h3 className="text-[#dc3545] font-bold text-2xl mt-4">
              {t("home.swapTitle")}
            </h3>
            <p className="text-gray-700 text-lg mt-4 leading-relaxed">
              {t("home.swapDescription")}
            </p>

            <button
              onClick={handleAddItemClick}
              className="bg-[#dc3545] text-white px-6 py-3 rounded-lg text-lg mt-6 hover:bg-red-700 transition"
            >
              {t("home.swapButton")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
