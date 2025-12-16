import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Type,
  AlignLeft,
  DollarSign,
  Image as ImageIcon,
  UploadCloud,
  Save,
  X,
  Tag,
  Layers,
} from "lucide-react";

const EditItem = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverPreview, setCoverPreview] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "",
    cover: null,
    gallery: [],
  });

  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Theme Color Constant for easy reference within logic if needed
  const THEME_RED = "#dc3545";

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const catRes = await axios.get("http://localhost:5050/api/categories");
        setCategories(catRes.data);

        const itemRes = await axios.get(
          `http://localhost:5050/api/items/${id}`
        );

        if (!itemRes.data || !itemRes.data.item) {
          setError("المنتج غير موجود");
          return;
        }

        const data = itemRes.data.item;

        if (data.user_id !== user.id) {
          setError("ليس لديك صلاحية تعديل هذا المنتج");
        } else {
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
            category_id: data.category_id || "",
            cover: null,
            gallery: [],
          });

          if (data.cover_image) {
            setCoverPreview(
              `http://localhost:5050/uploads/${data.cover_image}`
            );
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("فشل تحميل البيانات. تأكد من تشغيل السيرفر.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, cover: file }));
      setCoverPreview(URL.createObjectURL(file));
      setFormErrors((prev) => ({ ...prev, cover: null }));
    }
  };

  const handleGalleryChange = (e) => {
    setFormData((prev) => ({ ...prev, gallery: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.title.trim()) errors.title = t("validation.required");
    if (!formData.description.trim())
      errors.description = t("validation.required");
    if (!formData.price || parseFloat(formData.price) <= 0)
      errors.price = t("validation.pricePositive");
    if (!formData.category_id) errors.category_id = "يرجى اختيار الفئة";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category_id", formData.category_id);
    data.append("user_id", user.id);

    if (formData.cover) data.append("cover", formData.cover);
    formData.gallery.forEach((file) => data.append("gallery", file));

    try {
      await axios.put(`http://localhost:5050/api/items/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/profile`);
    } catch (err) {
      console.error("❌ خطأ في التعديل:", err);
      setError("فشل تعديل المنتج");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {/* تم تغيير لون التحميل للأحمر */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc3545]"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="text-[#dc3545] text-5xl mb-4">⚠️</div>
        <p className="text-xl font-bold text-gray-700">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-[#dc3545] text-white rounded-lg hover:bg-[#c82333]"
        >
          العودة
        </button>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
      dir={isRTL ? "ltr" : "rtl"}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {t("edit.title")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            قم بتحديث تفاصيل منتجك لزيادة فرص البيع
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#dc3545]">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* 1. Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("edit.name")}
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "right-0 pr-3" : "left-0 pl-3"
                  } flex items-center pointer-events-none`}
                >
                  <Type className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  // تم استبدال ألوان التركيز (Focus) للأحمر
                  className={`block w-full rounded-lg border ${
                    formErrors.title
                      ? "border-red-500 ring-red-200"
                      : "border-gray-300 focus:ring-[#dc3545] focus:border-[#dc3545]"
                  } py-3 ${
                    isRTL ? "pr-10" : "pl-10"
                  } transition-shadow focus:ring-4 focus:ring-opacity-20`}
                />
              </div>
              {formErrors.title && (
                <p className="mt-1 text-sm text-[#dc3545]">
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* Grid: Price & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("edit.price")}
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${
                      isRTL ? "right-0 pr-3" : "left-0 pl-3"
                    } flex items-center pointer-events-none`}
                  >
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border ${
                      formErrors.price
                        ? "border-red-300"
                        : "border-gray-300 focus:border-[#dc3545]"
                    } py-3 ${
                      isRTL ? "pr-10" : "pl-10"
                    } focus:ring-4 focus:ring-[#dc3545]/20 transition`}
                  />
                </div>
                {formErrors.price && (
                  <p className="mt-1 text-sm text-[#dc3545]">
                    {formErrors.price}
                  </p>
                )}
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة (Category)
                </label>
                <div className="relative">
                  <div
                    className={`absolute inset-y-0 ${
                      isRTL ? "right-0 pr-3" : "left-0 pl-3"
                    } flex items-center pointer-events-none`}
                  >
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border ${
                      formErrors.category_id
                        ? "border-red-300"
                        : "border-gray-300 focus:border-[#dc3545]"
                    } py-3 ${
                      isRTL ? "pr-10" : "pl-10"
                    } focus:ring-4 focus:ring-[#dc3545]/20 transition appearance-none bg-white`}
                  >
                    <option value="">اختر الفئة...</option>
                    {categories.map((cat) => (
                      <option
                        key={cat.id || cat.category_id}
                        value={cat.id || cat.category_id}
                      >
                        {cat.name || cat.category_name}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.category_id && (
                  <p className="mt-1 text-sm text-[#dc3545]">
                    {formErrors.category_id}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("edit.description")}
              </label>
              <div className="relative">
                <div
                  className={`absolute top-3 ${
                    isRTL ? "right-3" : "left-3"
                  } pointer-events-none`}
                >
                  <AlignLeft className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border ${
                    formErrors.description
                      ? "border-red-300"
                      : "border-gray-300 focus:border-[#dc3545]"
                  } py-3 ${
                    isRTL ? "pr-10" : "pl-10"
                  } focus:ring-4 focus:ring-[#dc3545]/20 transition`}
                />
              </div>
              {formErrors.description && (
                <p className="mt-1 text-sm text-[#dc3545]">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Images Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                {/* الأيقونة باللون الأحمر */}
                <ImageIcon className="text-[#dc3545]" /> صور المنتج
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image Preview & Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("edit.cover")}
                  </label>

                  <div className="flex flex-col items-center justify-center w-full">
                    {coverPreview ? (
                      <div className="relative w-full h-48 mb-3 rounded-lg overflow-hidden shadow-md group border border-gray-200">
                        <img
                          src={coverPreview}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                          <span className="text-white text-sm font-medium flex items-center gap-2">
                            <UploadCloud size={18} /> تغيير الصورة
                          </span>
                        </div>
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept="image/*"
                          onChange={handleCoverChange}
                        />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition hover:border-[#dc3545]">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              اضغط لرفع صورة جديدة
                            </span>
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleCoverChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Additional Gallery Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("edit.gallery")} (إضافة المزيد)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition hover:border-[#dc3545]">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Layers className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 text-center">
                        <span className="font-semibold">
                          اضغط لاختيار صور متعددة
                        </span>
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                    />
                  </label>
                  {formData.gallery.length > 0 && (
                    <p className="mt-2 text-sm text-green-600 text-center font-medium">
                      ✅ تم اختيار {formData.gallery.length} صور جديدة
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                // الزر الرئيسي باللون الأحمر مع تأثيرات الظل والهوفر
                className="flex-1 bg-[#dc3545] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c82333] focus:ring-4 focus:ring-red-200 transition flex items-center justify-center gap-2 shadow-lg shadow-red-100"
              >
                <Save size={20} />
                {t("edit.save")}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#dc3545] transition flex items-center justify-center gap-2 "
              >
                <X size={20} />
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
