import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import i18n from "../i18n";

const DefaultItemImage = "https://via.placeholder.com/400x300?text=No+Image";

const Favorites = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // دالة لجلب المفضلة
  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5050/api/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // التحقق من صحة البيانات
      if (Array.isArray(res.data)) {
        setFavorites(res.data);
      } else if (res.data.favorites && Array.isArray(res.data.favorites)) {
        setFavorites(res.data.favorites);
      } else {
        setFavorites([]);
      }
    } catch (err) {
      console.error("❌ Error fetching favorites:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/Login");
    } else {
      fetchFavorites();
    }
  }, [user, navigate]);

  const getTranslatedCategory = (catName) => {
    if (!catName) return "";
    return t(`categories.${catName}`, { defaultValue: catName });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#dc3545]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("favorites.errorLoading") || "حدث خطأ في تحميل المفضلة"}
        </h2>
        <button
          onClick={fetchFavorites}
          className="mt-4 px-6 py-2 bg-[#dc3545] text-white rounded-lg hover:bg-red-700 transition"
        >
          {t("common.retry") || "إعادة المحاولة"}
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fcfcfc] pb-20 font-['Cairo']"
      dir={isRTL ? "ltr" : "rtl"}
    >
      {/* Header */}
      <div className="relative bg-white shadow-sm border-b border-gray-100 py-12 mb-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-[#dc3545] mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            {t("favorites.title") || "My Favorites"}
          </h1>
          <p className="text-gray-500 text-lg">
            {t("favorites.subtitle") || "Items you liked"}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!Array.isArray(favorites) || favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t("favorites.empty") || "No Favorites Yet"}
            </h3>
            <button
              onClick={() => navigate("/Swap")}
              className="mt-6 text-[#dc3545] font-semibold hover:underline"
            >
              {t("favorites.browse") || "Browse Items"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favorites.map((item) => (
              <div
                key={item.id || item.favorite_id}
                onClick={() => navigate(`/details/${item.id}`)}
                className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100 h-full flex flex-col"
              >
                {/* --- Image Section (التصميم الجديد) --- */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-t-[2rem]">
                  {/* الصورة مع تأثير الدوران والتكبير */}
                  <img
                    src={
                      item.cover_image
                        ? `http://localhost:5050/uploads/${item.cover_image}`
                        : DefaultItemImage
                    }
                    alt={item.title}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                    onError={(e) => (e.target.src = DefaultItemImage)}
                  />

                  {/* تدرج لوني سينمائي */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-80 transition-opacity duration-500"></div>

                  {/* أيقونة القلب الزجاجية */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/70 backdrop-blur-xl p-2.5 rounded-full shadow-sm border border-white/30 group-hover:scale-105 transition-transform">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-[#dc3545]"
                      >
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.691 2.25 5.357 4.435 3.15 7.502 3.15c1.784 0 3.583.993 4.498 2.864a5.513 5.513 0 004.498-2.864c3.067 0 5.252 2.207 5.252 5.541 0 3.483-2.438 6.669-4.744 8.817a25.18 25.18 0 01-4.244 3.17 15.247 15.247 0 01-.383.218l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    </div>
                  </div>

                  {/* شارة السعر الزجاجية */}
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white/80 backdrop-blur-xl pl-4 pr-3 py-2 rounded-2xl shadow-sm border border-white/40 flex items-baseline gap-1 group-hover:shadow-md transition-all">
                      <span className="text-[#dc3545] font-black text-xl tracking-tight leading-none">
                        {item.price}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        د.أ
                      </span>
                    </div>
                  </div>
                </div>

                {/* --- Info Section --- */}
                <div className="p-5 flex flex-col flex-1">
                  {item.category?.category_name && (
                    <span className="text-xs font-bold text-[#dc3545] mb-2 block uppercase tracking-wider">
                      {getTranslatedCategory(item.category.category_name)}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-gray-900 truncate mb-1 group-hover:text-[#dc3545] transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4 flex-1">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-white shadow-sm overflow-hidden">
                        {item.owner?.photo ? (
                          <img
                            src={`http://localhost:5050/uploads/${item.owner.photo}`}
                            className="w-full h-full object-cover"
                            alt="owner"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-50 text-xs">
                            {item.owner?.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[80px]">
                        {item.owner?.name || t("Unknown")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
