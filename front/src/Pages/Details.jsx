import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Phone,
  MapPin,
  Share2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  Package,
  Heart,
  Tag,
} from "lucide-react";

const Details = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    axios(`http://localhost:5050/api/items/${id}`)
      .then((res) => {
        const fetchedItem = res.data.item;
        if (fetchedItem) {
          setItem(fetchedItem);
          setSelectedImage(fetchedItem.cover_image);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    const storedFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (storedFavs.includes(id)) {
      setIsFavorite(true);
    }
  }, [id]);

  const toggleFavorite = (e) => {
    e.stopPropagation();
    const storedFavs = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavs;

    if (isFavorite) {
      newFavs = storedFavs.filter((favId) => favId !== id);
      setIsFavorite(false);
    } else {
      newFavs = [...storedFavs, id];
      setIsFavorite(true);
    }
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 w-full bg-gray-200 rounded animate-pulse mt-8"></div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800">
          {t("details.errorLoading")}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-purple-600 hover:underline"
        >
          {t("common.goBack")}
        </button>
      </div>
    );

  return (
    <div
      // 1. أزلنا pb-24 لأن الأزرار لم تعد ثابتة وتغطي المحتوى
      className="min-h-screen bg-[#F8F9FA] pb-8"
      dir={isRTL ? "ltr" : "rtl"}
    >
      {/* Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() => navigate("/")}
          className="hover:text-purple-600 transition"
        >
          {t("nav.home")}
        </button>
        <span>/</span>
        <span className="font-medium text-gray-900 truncate max-w-[200px]">
          {item.title}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* --- LEFT COLUMN: Images --- */}
          <div className="lg:col-span-7 top-4 h-fit z-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              {/* Main Image */}
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img
                  src={`http://localhost:5050/uploads/${selectedImage}`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Actions on Image */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition backdrop-blur-sm group/heart"
                >
                  <Heart
                    size={22}
                    className={`transition-colors duration-300 ${
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 group-hover/heart:text-red-500"
                    }`}
                  />
                </button>
                <button className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition backdrop-blur-sm">
                  <Share2 size={22} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {item.images && item.images.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                <div
                  onClick={() => setSelectedImage(item.cover_image)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedImage === item.cover_image
                      ? "border-purple-600 ring-2 ring-purple-100"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={`http://localhost:5050/uploads/${item.cover_image}`}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </div>
                {item.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_path)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage === img.image_path
                        ? "border-purple-600 ring-2 ring-purple-100"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={`http://localhost:5050/uploads/${img.image_path}`}
                      className="w-full h-full object-cover"
                      alt="thumbnail"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: Details --- */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title & Price Header */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  {item.title}
                </h1>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-purple-600">
                  {item.price}
                </span>
                <span className="text-xl font-medium text-gray-500">
                  {t("details.currency")}
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {item.category && (
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-purple-100">
                    <Tag size={16} /> {item.category.category_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-green-100">
                  <CheckCircle2 size={16} /> {t("details.sellAvailable")}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-blue-100">
                  <RefreshCw size={16} /> {t("details.swapOpen")}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-100">
                  <Package size={16} /> 1 {t("details.pieces")}
                </span>
              </div>
            </div>

            {/* Owner Card */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-200 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={
                      item.owner.photo
                        ? `http://localhost:5050/uploads/${item.owner.photo}`
                        : "/images/profile.jpeg"
                    }
                    alt={item.owner.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-1">
                    {item.owner.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <MapPin size={14} />
                    {item.owner.location || t("details.locationUnknown")}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-2 rounded-full text-gray-400">
                {isRTL ? <ArrowLeft size={20} /> : <ArrowRight size={20} />}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {t("details.descriptionTitle")}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* ✅✅ الأزرار الآن هنا كجزء من العمود، وليست ثابتة ✅✅ */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  navigate(`/chat/${item.owner.id}?itemId=${item.id}`)
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <MessageCircle size={20} className="md:w-6 md:h-6" />
                {t("details.message")}
              </button>

              <a
                href={`tel:${item.owner.phone}`}
                className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg border-2 transition-all active:scale-95 ${
                  item.owner.phone
                    ? "border-green-600 text-green-600 hover:bg-green-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={(e) => !item.owner.phone && e.preventDefault()}
              >
                <Phone size={20} className="md:w-6 md:h-6" />
                {t("details.callOwner")}
              </a>
            </div>
            {/* نهاية قسم الأزرار */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
