import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import i18n from "../i18n";

const DefaultItemImage = "https://via.placeholder.com/400x300?text=No+Image";

const Swap = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- States ---
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [categories, setCategories] = useState([]);

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // 🔽 Combobox States
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categoryInput, setCategoryInput] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryWrapperRef = useRef(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsRes, catsRes] = await Promise.all([
          axios.get("http://localhost:5050/api/items"),
          axios.get("http://localhost:5050/api/categories"),
        ]);

        const itemsData = itemsRes.data.items || [];
        const sortedItems = itemsData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setItems(sortedItems);
        setFilteredItems(sortedItems);

        const realCats = Array.isArray(catsRes.data)
          ? catsRes.data
          : catsRes.data.categories || [];
        setCategories(realCats);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Filtering Logic (Items)
  useEffect(() => {
    let result = items;

    if (searchTerm.trim()) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (item) => item.category?.category_name === selectedCategory
      );
    }

    if (priceRange.min !== "") {
      result = result.filter((item) => item.price >= Number(priceRange.min));
    }
    if (priceRange.max !== "") {
      result = result.filter((item) => item.price <= Number(priceRange.max));
    }

    setFilteredItems(result);
  }, [searchTerm, selectedCategory, priceRange, items]);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryWrapperRef.current &&
        !categoryWrapperRef.current.contains(event.target)
      ) {
        setIsCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categoryWrapperRef]);

  // 🔥 دالة مساعدة لترجمة اسم الفئة
  const getTranslatedCategory = (catName) => {
    if (!catName) return "";
    // يحاول يترجم "categories.Furniture"، إذا ما لقى ترجمة برجع الاسم الأصلي "Furniture"
    return t(`categories.${catName}`, { defaultValue: catName });
  };

  // اختيار فئة
  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    // لما نختار، بنحط الاسم المترجم في الانبوت عشان اليوزر يشوف عربي
    setCategoryInput(catName === "all" ? "" : getTranslatedCategory(catName));
    setIsCategoryOpen(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setCategoryInput("");
    setPriceRange({ min: "", max: "" });
  };

  // 🔥 فلترة القائمة المنسدلة بناءً على الاسم المترجم (عشان البحث بالعربي يشتغل)
  const filteredCategoriesList = categories.filter((cat) => {
    const dbName = cat.category_name || cat.name || "";
    const translatedName = getTranslatedCategory(dbName); // "أثاث"
    return translatedName.toLowerCase().includes(categoryInput.toLowerCase());
  });

  // --- Render ---

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
          {t("swap.errorLoading")}
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-[#dc3545] text-white rounded-lg hover:bg-red-700 transition"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fcfcfc] pb-20 font-['Cairo']"
      dir={isRTL ? "ltr" : "rtl"}
    >
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-50 blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-50 blur-3xl opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-right">
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tight">
              {t("swap.title")} <br />
              <span className="text-[#dc3545]">{t("swap.highlight")}</span>{" "}
              {t("swap.suffix")}
            </h1>

            <p className="text-xl text-gray-500 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t("swap.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/AddItem")}
                className="px-8 py-4 bg-[#dc3545] text-white rounded-2xl font-bold text-lg hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all transform hover:-translate-y-1"
              >
                {t("common.addItem")}
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("items-grid")
                    .scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all"
              >
                {t("common.browse")}
              </button>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <img
                src="https://images.unsplash.com/photo-1556740758-90de374c12ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Swap illustration"
                className="w-full h-auto rounded-[2rem] object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Search Bar */}
      <div className="sticky top-4 z-40 max-w-6xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/60 shadow-xl shadow-gray-200/20 rounded-3xl p-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
              <span
                className={`absolute top-3.5 text-gray-400 ${
                  isRTL ? "right-4" : "left-4"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                className={`w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#dc3545]/30 focus:ring-4 focus:ring-[#dc3545]/10 rounded-2xl py-3 text-gray-700 placeholder-gray-400 transition-all ${
                  isRTL ? "pr-12" : "pl-12"
                }`}
                placeholder={t("swap.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Smart Category Filter */}
            <div className="relative w-full md:w-64" ref={categoryWrapperRef}>
              <div
                className="relative cursor-text"
                onClick={() => setIsCategoryOpen(true)}
              >
                <input
                  type="text"
                  className={`w-full bg-gray-50 border-transparent focus:bg-white focus:border-[#dc3545]/30 focus:ring-4 focus:ring-[#dc3545]/10 rounded-2xl py-3 text-gray-700 placeholder-gray-500 transition-all cursor-pointer ${
                    isRTL ? "pr-4 pl-10" : "pl-4 pr-10"
                  }`}
                  // عرض الاسم المترجم في الـ placeholder أو القيمة
                  placeholder={
                    selectedCategory !== "all"
                      ? getTranslatedCategory(selectedCategory)
                      : t("swap.categoryLabel")
                  }
                  value={categoryInput}
                  onChange={(e) => {
                    setCategoryInput(e.target.value);
                    setIsCategoryOpen(true);
                  }}
                  onFocus={() => setIsCategoryOpen(true)}
                />
                <span
                  className={`absolute top-3.5 text-gray-400 pointer-events-none ${
                    isRTL ? "left-4" : "right-4"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform ${
                      isCategoryOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              {isCategoryOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 animate-fade-in-down">
                  <ul className="py-2">
                    <li
                      className={`px-4 py-2 hover:bg-red-50 hover:text-[#dc3545] cursor-pointer text-sm transition-colors ${
                        selectedCategory === "all"
                          ? "bg-red-50 text-[#dc3545] font-bold"
                          : "text-gray-600"
                      }`}
                      onClick={() => handleSelectCategory("all")}
                    >
                      {t("swap.allCategories")}
                    </li>
                    {filteredCategoriesList.length > 0 ? (
                      filteredCategoriesList.map((cat) => {
                        const dbName = cat.category_name || cat.name;
                        return (
                          <li
                            key={cat.id || cat.category_id}
                            className={`px-4 py-2 hover:bg-red-50 hover:text-[#dc3545] cursor-pointer text-sm transition-colors ${
                              selectedCategory === dbName
                                ? "bg-red-50 text-[#dc3545] font-bold"
                                : "text-gray-600"
                            }`}
                            onClick={() => handleSelectCategory(dbName)}
                          >
                            {/* 🔥 عرض الاسم المترجم في القائمة */}
                            {getTranslatedCategory(dbName)}
                          </li>
                        );
                      })
                    ) : (
                      <li className="px-4 py-2 text-sm text-gray-400 text-center">
                        {t("swap.noResults")}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div className="flex items-center bg-gray-50 rounded-2xl px-3 border border-transparent focus-within:bg-white focus-within:ring-4 focus-within:ring-[#dc3545]/10 transition-all">
              <input
                type="number"
                placeholder={t("min")}
                min={0}
                className="w-20 bg-transparent border-0 py-3 text-center text-sm focus:ring-0 text-gray-700 placeholder-gray-400"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
              />
              <span className="text-gray-300">|</span>
              <input
                type="number"
                placeholder={t("max")}
                className="w-20 bg-transparent border-0 py-3 text-center text-sm focus:ring-0 text-gray-700 placeholder-gray-400"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
                min={0}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={clearFilters}
              className="p-3 bg-white text-gray-400 border border-gray-200 rounded-2xl hover:bg-red-50 hover:text-[#dc3545] hover:border-red-100 transition-all shadow-sm"
              title={t("swap.reset")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div
        id="items-grid"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12"
      >
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4 animate-bounce">
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {t("swap.noResults")}
            </h3>
            <p className="text-gray-500 mt-2">{t("swap.tryDifferent")}</p>
            <button
              onClick={clearFilters}
              className="mt-6 text-[#dc3545] font-semibold hover:underline"
            >
              {t("swap.clearFilters")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (!user) return navigate("/Login");
                  if (user.id === item.owner?.id) {
                    navigate(`/edit/${item.id}`);
                  } else {
                    navigate(`/details/${item.id}`);
                  }
                }}
                className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 cursor-pointer overflow-hidden border border-gray-100 h-full flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={`http://localhost:5050/uploads/${item.cover_image}`}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => (e.target.src = DefaultItemImage)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1">
                    <span className="text-[#dc3545] font-extrabold">
                      {item.price}
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      د.أ
                    </span>
                  </div>

                  {item.category?.category_name && (
                    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                      <span className="text-white text-[10px] font-medium tracking-wide">
                        {/* 🔥 عرض اسم الفئة مترجم على الكرت */}
                        {getTranslatedCategory(item.category.category_name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
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

                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#dc3545] transition-colors duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 text-gray-400 group-hover:text-white transition-colors ${
                          isRTL ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
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

export default Swap;
