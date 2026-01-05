import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
  const { user, token } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingError, setFetchingError] = useState("");

  // States for Image Previews
  const [coverPreview, setCoverPreview] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // --- 1. تعريف مخطط التحقق (Validation Schema) ---
  const validationSchema = yup.object().shape({
    title: yup
      .string()
      .required(t("validation.titleRequired"))
      .min(3, t("validation.titleMin")),
    description: yup
      .string()
      .required(t("validation.descRequired"))
      .min(10, t("validation.descMin")),
    price: yup
      .number()
      .typeError(t("validation.priceNumeric"))
      .required(t("validation.priceRequired"))
      .positive(t("validation.pricePositive")),
    category_id: yup.string().required(t("validation.categoryRequired")),
    // ملاحظة: التحقق من الصور يتم يدوياً أو عبر test مخصص إذا لزم الأمر
  });

  // --- 2. إعداد الـ Form ---
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category_id: "",
    },
  });

  // --- 3. جلب البيانات ---
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // جلب الفئات
        const catRes = await axios.get("http://localhost:5050/api/categories");
        setCategories(catRes.data);

        // جلب تفاصيل المنتج
        const itemRes = await axios.get(
          `http://localhost:5050/api/items/${id}`
        );

        if (!itemRes.data || !itemRes.data.item) {
          setFetchingError(t("errors.itemNotFound"));
          return;
        }

        const data = itemRes.data.item;

        // التحقق من الصلاحية
        if (data.user_id !== user.id) {
          setFetchingError(t("errors.unauthorized"));
        } else {
          // ملء النموذج بالبيانات
          reset({
            title: data.title,
            description: data.description,
            price: data.price,
            category_id: data.category_id || "",
          });

          // إعداد المعاينة
          if (data.cover_image) {
            setCoverPreview(
              `http://localhost:5050/uploads/${data.cover_image}`
            );
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setFetchingError(t("errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, reset, t]);

  // --- 4. معالجة الصور ---
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("cover", file); // تسجيل الملف في الـ Form
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(files);
    setValue("gallery", files);
  };

  // --- 5. دالة الإرسال (Submit) ---
  const onSubmit = async (formData) => {
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category_id", formData.category_id);
    data.append("user_id", user.id);

    // إضافة الصور إذا وجدت
    if (formData.cover instanceof File) {
      data.append("cover", formData.cover);
    }

    if (formData.gallery && formData.gallery.length > 0) {
      formData.gallery.forEach((file) => data.append("gallery", file));
    }

    try {
      await axios.put(`http://localhost:5050/api/items/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      // نجاح -> توجيه
      navigate(`/profile`);
    } catch (err) {
      console.error("❌ Error updating item:", err);
      alert(t("errors.updateFailed"));
    }
  };

  // --- 6. واجهة المستخدم ---
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#dc3545]"></div>
      </div>
    );

  if (fetchingError)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="text-[#dc3545] text-5xl mb-4">⚠️</div>
        <p className="text-xl font-bold text-gray-700">{fetchingError}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-6 py-2 bg-[#dc3545] text-white rounded-lg hover:bg-[#c82333]"
        >
          {t("common.back")}
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
          <p className="mt-2 text-sm text-gray-600">{t("edit.subtitle")}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#dc3545]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* 1. Title Input */}
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
                  {...register("title")}
                  className={`block w-full rounded-lg border ${
                    errors.title
                      ? "border-red-500 ring-red-200"
                      : "border-gray-300 focus:ring-[#dc3545] focus:border-[#dc3545]"
                  } py-3 ${
                    isRTL ? "pr-10" : "pl-10"
                  } transition-shadow focus:ring-4 focus:ring-opacity-20`}
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-[#dc3545]">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Grid: Price & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2. Price Input */}
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
                    step="0.01"
                    {...register("price")}
                    className={`block w-full rounded-lg border ${
                      errors.price
                        ? "border-red-500 ring-red-200"
                        : "border-gray-300 focus:border-[#dc3545]"
                    } py-3 ${
                      isRTL ? "pr-10" : "pl-10"
                    } focus:ring-4 focus:ring-[#dc3545]/20 transition`}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-[#dc3545]">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* 3. Category Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("edit.category")}
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
                    {...register("category_id")}
                    className={`block w-full rounded-lg border ${
                      errors.category_id
                        ? "border-red-500 ring-red-200"
                        : "border-gray-300 focus:border-[#dc3545]"
                    } py-3 ${
                      isRTL ? "pr-10" : "pl-10"
                    } focus:ring-4 focus:ring-[#dc3545]/20 transition appearance-none bg-white`}
                  >
                    <option value="">{t("edit.selectCategory")}</option>
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
                {errors.category_id && (
                  <p className="mt-1 text-sm text-[#dc3545]">
                    {errors.category_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* 4. Description Textarea */}
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
                  rows="4"
                  {...register("description")}
                  className={`block w-full rounded-lg border ${
                    errors.description
                      ? "border-red-500 ring-red-200"
                      : "border-gray-300 focus:border-[#dc3545]"
                  } py-3 ${
                    isRTL ? "pr-10" : "pl-10"
                  } focus:ring-4 focus:ring-[#dc3545]/20 transition`}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-[#dc3545]">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* 5. Images Section */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="text-[#dc3545]" /> {t("edit.imagesTitle")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cover Image Upload */}
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
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                          <span className="text-white text-sm font-medium flex items-center gap-2">
                            <UploadCloud size={18} /> {t("edit.changeImage")}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleCoverChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition hover:border-[#dc3545]">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              {t("edit.uploadCover")}
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

                {/* Gallery Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("edit.gallery")}
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition hover:border-[#dc3545]">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Layers className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 text-center">
                        <span className="font-semibold">
                          {t("edit.uploadGallery")}
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
                  {galleryFiles.length > 0 && (
                    <p className="mt-2 text-sm text-green-600 text-center font-medium">
                      ✅{" "}
                      {t("edit.imagesSelected", { count: galleryFiles.length })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#dc3545] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#c82333] focus:ring-4 focus:ring-red-200 transition flex items-center justify-center gap-2 shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} />
                    {t("edit.save")}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl font-bold border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-[#dc3545] transition flex items-center justify-center gap-2"
              >
                <X size={20} />
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItem;
