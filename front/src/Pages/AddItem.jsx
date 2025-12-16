import { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  ImagePlus,
  X,
  UploadCloud,
  Tag,
  DollarSign,
  Type,
  FileText,
  AlertCircle,
} from "lucide-react";

const AddItem = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isRTL = i18n.language === "ar";

  // ثوابت التحقق
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_GALLERY_COUNT = 10;
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

  // الحالة (State) لتخزين البيانات
  const [itemData, setItemData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: "", // ✅ نستخدم معرف الفئة لربطها بجدول الفئات
    cover: null,
    coverPreview: null,
    gallery: [],
    galleryPreviews: [],
  });

  const [categories, setCategories] = useState([]); // لتخزين قائمة الفئات من الباك إند
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ جلب الفئات عند تحميل الصفحة
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // دالة مساعدة للتحقق من ملف واحد
  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t(
        "addItem.errors.invalidType",
        "Invalid file type. Only JPG, PNG, WEBP allowed."
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return t(
        "addItem.errors.tooLarge",
        "File is too large. Max 5MB allowed."
      );
    }
    return null;
  };

  // التعامل مع تغيير الحقول النصية
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // التعامل مع صورة الغلاف
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setErrors((prev) => ({ ...prev, cover: error }));
        return;
      }
      setErrors((prev) => ({ ...prev, cover: null }));
      setItemData((prev) => ({
        ...prev,
        cover: file,
        coverPreview: URL.createObjectURL(file),
      }));
    }
  };

  // التعامل مع صور المعرض
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    let newErrors = null;

    if (itemData.gallery.length + files.length > MAX_GALLERY_COUNT) {
      newErrors = t(
        "addItem.errors.maxGallery",
        `Max ${MAX_GALLERY_COUNT} images.`
      );
    } else {
      const invalidFiles = files.filter((file) => validateFile(file) !== null);
      if (invalidFiles.length > 0) {
        newErrors = t("addItem.errors.someInvalid", "Some files are invalid.");
      }
    }

    if (newErrors) {
      setErrors((prev) => ({ ...prev, gallery: newErrors }));
      return;
    }

    setErrors((prev) => ({ ...prev, gallery: null }));
    const newPreviews = files.map((file) => URL.createObjectURL(file));

    setItemData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, ...files],
      galleryPreviews: [...prev.galleryPreviews, ...newPreviews],
    }));
  };

  // حذف صورة من المعرض
  const removeGalleryImage = (index) => {
    setItemData((prev) => {
      const newGallery = prev.gallery.filter((_, i) => i !== index);
      const newPreviews = prev.galleryPreviews.filter((_, i) => i !== index);
      return { ...prev, gallery: newGallery, galleryPreviews: newPreviews };
    });
  };

  // التحقق قبل الإرسال
  const validateForm = () => {
    const newErrors = {};

    if (!itemData.title.trim())
      newErrors.title = t("addItem.errors.required", "This field is required");
    if (!itemData.price || itemData.price <= 0)
      newErrors.price = t(
        "addItem.errors.invalidPrice",
        "Price must be greater than 0"
      );
    if (!itemData.category_id)
      // ✅ التحقق من category_id
      newErrors.category_id = t(
        "addItem.errors.required",
        "Please select a category"
      );
    if (!itemData.description.trim())
      newErrors.description = t(
        "addItem.errors.required",
        "Description is required"
      );
    if (itemData.description.length < 10)
      newErrors.description = t(
        "addItem.errors.shortDesc",
        "Description is too short"
      );
    if (!itemData.cover)
      newErrors.cover = t(
        "addItem.errors.requiredCover",
        "Cover image is required"
      );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // الإرسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("title", itemData.title);
    formData.append("description", itemData.description);
    formData.append("price", itemData.price);
    formData.append("category_id", itemData.category_id); // ✅ إرسال category_id
    formData.append("user_id", user.id);

    if (itemData.cover) {
      formData.append("cover", itemData.cover);
    }

    // ✅ إرسال الصور باسم 'gallery_images' ليطابق الباك إند
    itemData.gallery.forEach((file) => {
      formData.append("gallery_images", file);
    });

    try {
      await axios.post("http://localhost:5050/api/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({
        type: "success",
        text: t("addItem.success", "Item added successfully!"),
      });

      // إعادة تعيين النموذج
      setItemData({
        title: "",
        description: "",
        price: "",
        category_id: "",
        cover: null,
        coverPreview: null,
        gallery: [],
        galleryPreviews: [],
      });
      setErrors({});
    } catch (err) {
      console.error("❌ Add Item Error:", err);
      // عرض رسالة الخطأ القادمة من الباك إند إن وجدت
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        t("addItem.error", "Failed to add item.");
      setMessage({
        type: "error",
        text: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#dc3545] p-6 text-white text-center">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
            <UploadCloud size={32} />
            {t("addItem.title", "Add New Item")}
          </h2>
          <p className="text-red-100 mt-2">
            {t("addItem.subtitle", "Share your items with the community")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8" noValidate>
          {message && (
            <div
              className={`p-4 rounded-lg text-center font-medium ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <Type size={16} className="text-[#dc3545]" />{" "}
                  {t("addItem.name", "Item Name")}
                </label>
                <input
                  type="text"
                  name="title"
                  value={itemData.title}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition bg-gray-50 focus:bg-white ${
                    errors.title
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-[#dc3545]"
                  }`}
                  placeholder={t(
                    "addItem.namePlaceholder",
                    "e.g., iPhone 13 Pro"
                  )}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.title}
                  </p>
                )}
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <DollarSign size={16} className="text-[#dc3545]" />{" "}
                    {t("addItem.price", "Price")}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={itemData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition bg-gray-50 focus:bg-white ${
                      errors.price
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-[#dc3545]"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.price}
                    </p>
                  )}
                </div>

                {/* ✅ قسم الفئات الديناميكي - تم التعديل هنا ليطابق المخطط */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Tag size={16} className="text-[#dc3545]" />{" "}
                    {t("addItem.category", "Category")}
                  </label>
                  <select
                    name="category_id"
                    value={itemData.category_id}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition bg-gray-50 focus:bg-white ${
                      errors.category_id
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-[#dc3545]"
                    }`}
                  >
                    <option value="">{t("addItem.select", "Select...")}</option>

                    {/* ✅ عرض الفئات القادمة من الـ API بالأسماء الصحيحة */}
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                          {/* عرض الاسم المترجم إن وجد، أو الاسم القادم من الداتا */}
                          {t(
                            `categories.${cat.category_name}`,
                            cat.category_name
                          )}
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading categories...</option>
                    )}
                  </select>
                  {errors.category_id && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.category_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <FileText size={16} className="text-[#dc3545]" />{" "}
                  {t("addItem.description", "Description")}
                </label>
                <textarea
                  name="description"
                  value={itemData.description}
                  onChange={handleChange}
                  rows="5"
                  className={`w-full border rounded-lg px-4 py-3 focus:ring-2 outline-none transition resize-none bg-gray-50 focus:bg-white ${
                    errors.description
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-[#dc3545]"
                  }`}
                  placeholder={t(
                    "addItem.descPlaceholder",
                    "Describe your item..."
                  )}
                ></textarea>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-6">
              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("addItem.coverImage", "Cover Image")}{" "}
                  <span className="text-red-500 text-xs">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                    errors.cover
                      ? "border-red-500 bg-red-50"
                      : itemData.coverPreview
                      ? "border-[#dc3545] bg-red-50"
                      : "border-gray-300 hover:border-[#dc3545]"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {itemData.coverPreview ? (
                    <div className="relative h-48 w-full">
                      <img
                        src={itemData.coverPreview}
                        alt="Cover"
                        className="w-full h-full object-contain rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white opacity-0 hover:opacity-100 transition duration-300 rounded-lg">
                        {t("addItem.clickToChange", "Click to change")}
                      </div>
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center text-gray-500">
                      <ImagePlus
                        size={48}
                        className={`mb-2 ${
                          errors.cover ? "text-red-400" : "text-gray-400"
                        }`}
                      />
                      <p className="text-sm font-medium">
                        {t("addItem.clickToUpload", "Click to upload")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t("addItem.imageHint", "PNG, JPG up to 5MB")}
                      </p>
                    </div>
                  )}
                </div>
                {errors.cover && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1 justify-center">
                    <AlertCircle size={12} /> {errors.cover}
                  </p>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("addItem.galleryImages", "Gallery Images")}{" "}
                  <span className="text-gray-400 text-xs">
                    ({t("addItem.max", "Max")} {MAX_GALLERY_COUNT})
                  </span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-4 text-center hover:bg-gray-50 transition mb-4 ${
                    errors.gallery
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-[#dc3545]"
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <ImagePlus size={20} />
                    <span className="text-sm">
                      {t("addItem.addGallery", "Add Gallery Images")}
                    </span>
                  </div>
                </div>
                {errors.gallery && (
                  <p className="text-red-500 text-xs mt-1 mb-2 flex items-center gap-1 justify-center">
                    <AlertCircle size={12} /> {errors.gallery}
                  </p>
                )}

                {itemData.galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {itemData.galleryPreviews.map((src, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={src}
                          alt={`Gallery ${index}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100 z-20"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transform transition hover:-translate-y-1 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#dc3545] hover:bg-red-700 hover:shadow-xl"
              }`}
            >
              {loading
                ? t("addItem.processing", "Processing...")
                : t("addItem.submit", "Add Item Now")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AddItem;
