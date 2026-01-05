import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import i18n from "../i18n";

// أيقونات للتصميم الجديد
import {
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Edit,
  LogOut,
  Package,
  Plus,
} from "lucide-react";

const DefaultPhoto = "/images/profile.jpeg";

const Profile = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [userData, setUserData] = useState(null);
  const [myItems, setMyItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // 🔥 Popup State (General: Success/Error/Confirm)
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success", // 'success', 'error', 'delete'
    title: "",
    message: "",
    onConfirm: null, // Only for delete confirmation
  });

  const [isProcessing, setIsProcessing] = useState(false); // To show spinner on buttons

  // --- Popup Helpers ---
  const closePopup = () => setPopup((prev) => ({ ...prev, isOpen: false }));

  const showSuccess = (msg) => {
    setPopup({
      isOpen: true,
      type: "success",
      title: t("تم بنجاح"),
      message: msg,
      onConfirm: null,
    });
  };

  const showError = (msg) => {
    setPopup({
      isOpen: true,
      type: "error",
      title: t("خطأ"),
      message: msg,
      onConfirm: null,
    });
  };

  const showDeleteConfirm = (id) => {
    setPopup({
      isOpen: true,
      type: "delete",
      title: t("تأكيد الحذف"),
      message: t(
        "هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
      ),
      onConfirm: () => confirmDelete(id),
    });
  };

  // --- Validation ---
  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .required(t("validation.nameRequired"))
      .min(3, t("validation.nameMin")),
    email: yup
      .string()
      .required(t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    phone: yup
      .string()
      .matches(/^[0-9]+$/, t("validation.phoneNumeric"))
      .min(10, t("validation.phoneMin"))
      .nullable(),
    location: yup.string().nullable(),
    password: yup
      .string()
      .transform((curr, orig) => (orig === "" ? null : curr))
      .nullable()
      .test("password-strength", t("validation.passwordWeak"), (value) => {
        if (!value) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
      }),
    confirmPassword: yup
      .string()
      .transform((curr, orig) => (orig === "" ? null : curr))
      .nullable()
      .test(
        "passwords-match",
        t("validation.passwordMismatch"),
        function (value) {
          const { password } = this.parent;
          if (password && value !== password) return false;
          return true;
        }
      ),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // --- Fetch Data ---
  useEffect(() => {
    if (!token) return;
    if (!user?.id) return;

    const fetchProfileData = async () => {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        const userRes = await axios.get(
          `http://localhost:5050/api/users/${user.id}`,
          config
        );
        const fetchedUser = userRes.data.user || userRes.data;

        setUserData(fetchedUser);
        localStorage.setItem("user", JSON.stringify(fetchedUser));

        reset({
          name: fetchedUser.name,
          email: fetchedUser.email,
          phone: fetchedUser.phone,
          location: fetchedUser.location,
          password: "",
          confirmPassword: "",
        });

        const itemsRes = await axios.get(
          `http://localhost:5050/api/items/user/${user.id}`,
          config
        );
        setMyItems(itemsRes.data.items || []);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        if (
          err.response &&
          (err.response.status === 403 || err.response.status === 401)
        ) {
          logout();
          navigate("/Login");
        } else {
          setFetchError(
            t("profile.updateError") + " (Status: " + err.response?.status + ")"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, token, reset, t, logout, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setValue("photo", file);
    }
  };

  const getProfileImageSrc = () => {
    if (imagePreview) return imagePreview;
    if (userData?.photo)
      return `http://localhost:5050/uploads/${userData.photo}`;
    return DefaultPhoto;
  };

  // --- Update Profile ---
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone || "");
    formData.append("location", data.location || "");
    if (data.password) formData.append("password", data.password);
    if (data.photo instanceof File) formData.append("photo", data.photo);

    try {
      const res = await axios.put(
        `http://localhost:5050/api/users/${userData.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.user) {
        const updatedUser = res.data.user;
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowForm(false);
        setImagePreview(null);
        reset({ ...updatedUser, password: "", confirmPassword: "" });
        showSuccess(t("profile.updateSuccess") || "تم تحديث البيانات بنجاح");
      }
    } catch (err) {
      console.error("Update Error:", err);
      const backendError =
        err.response?.data?.error || t("profile.updateError");
      showError(backendError);
    }
  };

  // --- Delete Item ---
  const confirmDelete = async (id) => {
    setIsProcessing(true);
    try {
      await axios.delete(`http://localhost:5050/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyItems((prev) => prev.filter((item) => item.id !== id));
      closePopup();
      // تأخير بسيط لإظهار رسالة النجاح بعد إغلاق نافذة الحذف
      setTimeout(() => showSuccess(t("تم حذف العنصر بنجاح")), 300);
    } catch (err) {
      console.error("Delete Error:", err);
      closePopup();
      setTimeout(() => showError(t("حدث خطأ أثناء الحذف")), 300);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  // --- Loading / Error Views ---
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#dc3545]"></div>
      </div>
    );

  if (fetchError && !userData)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm flex items-center gap-2">
          <AlertCircle /> {fetchError}
        </p>
      </div>
    );

  return (
    <section
      className={`min-h-screen bg-gray-50 py-10 px-4 sm:px-6 ${
        isRTL ? "text-right" : "text-left"
      }`}
      dir={isRTL ? "ltr" : "rtl"}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* === Left Column: Profile Card === */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <div className="h-32 bg-gradient-to-r from-[#dc3545] to-red-400"></div>

            <div className="px-6 pb-6 text-center relative">
              <div className="relative -mt-16 inline-block group">
                <img
                  src={getProfileImageSrc()}
                  onError={(e) => (e.target.src = DefaultPhoto)}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white transition-transform group-hover:scale-105"
                />
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="absolute bottom-2 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors border border-gray-200 text-[#dc3545]"
                  title={t("profile.editTitle")}
                >
                  <Edit size={16} />
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mt-3">
                {userData.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">{userData.email}</p>

              <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl text-start">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white rounded-full text-[#dc3545] shadow-sm">
                    📞
                  </span>
                  <span className="font-medium">
                    {userData.phone || t("غير متوفر")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white rounded-full text-[#dc3545] shadow-sm">
                    📍
                  </span>
                  <span className="font-medium">
                    {userData.location || t("غير متوفر")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-white rounded-full text-[#dc3545] shadow-sm">
                    📅
                  </span>
                  <span className="font-medium">
                    {t("profile.memberSince")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full py-2.5 px-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                {t("profile.logout")}
              </button>
            </div>
          </div>
        </div>

        {/* === Right Column: Content === */}
        <div className="lg:col-span-8 space-y-8">
          {/* === Edit Form === */}
          {showForm && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-down">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h4 className="text-xl font-bold text-gray-800">
                  {t("profile.editTitle")}
                </h4>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "name", label: t("profile.name"), type: "text" },
                    {
                      name: "email",
                      label: t("profile.emailLabel"),
                      type: "email",
                    },
                    {
                      name: "phone",
                      label: t("profile.phoneLabel"),
                      type: "text",
                    },
                    {
                      name: "location",
                      label: t("profile.locationLabel"),
                      type: "text",
                    },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        {field.label}
                      </label>
                      <input
                        {...register(field.name)}
                        type={field.type}
                        className={`w-full border rounded-lg px-4 py-2.5 transition-shadow focus:outline-none focus:ring-4 focus:ring-red-50 ${
                          errors[field.name]
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 focus:border-[#dc3545]"
                        }`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors[field.name].message}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                  <h5 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🔒 {t("profile.changePasswordTitle")}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-600">
                        {t("profile.newPassword")}
                      </label>
                      <input
                        {...register("password")}
                        type="password"
                        placeholder="********"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#dc3545] focus:ring-4 focus:ring-red-50"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-600">
                        {t("profile.confirmPassword")}
                      </label>
                      <input
                        {...register("confirmPassword")}
                        type="password"
                        placeholder="********"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#dc3545] focus:ring-4 focus:ring-red-50"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    {t("profile.passwordRules")}
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    {t("profile.photoLabel")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#dc3545] file:text-white hover:file:bg-red-700 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    {t("profile.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#dc3545] text-white rounded-lg hover:bg-red-700 transition font-medium shadow-lg shadow-red-200 disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSubmitting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {t("profile.save")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* === My Items Section === */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h4 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Package className="text-[#dc3545]" />
                  {t("profile.swapTitle")}
                </h4>
                <span className="bg-red-50 text-[#dc3545] px-3 py-1 rounded-full text-sm font-bold border border-red-100">
                  {myItems.length}
                </span>
              </div>

              {/* زر إضافة منتج */}
              <button
                onClick={() => navigate("/AddItem")}
                className="flex items-center gap-2 px-4 py-2 bg-[#dc3545] text-white rounded-lg hover:bg-red-700 transition shadow-md hover:shadow-lg text-sm font-bold"
              >
                <Plus size={20} />
                {t("profile.addItem")}
              </button>
            </div>

            {myItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-500 font-medium">
                  {t("profile.noItems")}
                </p>
                <button
                  onClick={() => navigate("/AddItem")}
                  className="mt-4 text-[#dc3545] font-semibold hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <Plus size={16} /> أضف منتجك الأول
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {myItems.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`http://localhost:5050/uploads/${item.cover_image}`}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/300?text=No+Image")
                        }
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* زر الحذف العائم */}
                      <button
                        onClick={() => showDeleteConfirm(item.id)}
                        className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100 shadow-sm z-10"
                        title="حذف العنصر"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <h5 className="text-lg font-bold text-gray-800 truncate mb-1">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {item.description}
                      </p>

                      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                        <span className="text-[#dc3545] font-extrabold text-lg">
                          {item.price}{" "}
                          <span className="text-xs font-normal text-gray-500">
                            د.أ
                          </span>
                        </span>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/edit/${item.id}`)}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-[#dc3545] transition-colors"
                          >
                            <Edit size={16} />
                            {t("profile.editItem")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🚀🚀🚀 Unified Beautiful Popup (Alert & Confirm) 🚀🚀🚀 */}
      {/* ========================================================= */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-scaleIn">
            <div className="flex flex-col items-center text-center">
              {/* أيقونة متغيرة حسب النوع */}
              <div
                className={`p-4 rounded-full mb-4 ${
                  popup.type === "delete" || popup.type === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-green-50 text-green-600"
                }`}
              >
                {popup.type === "delete" ? (
                  <Trash2 size={32} />
                ) : popup.type === "error" ? (
                  <AlertCircle size={32} />
                ) : (
                  <CheckCircle size={32} />
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {popup.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {popup.message}
              </p>

              {/* أزرار التحكم */}
              <div className="flex gap-3 w-full">
                {popup.type === "delete" ? (
                  <>
                    <button
                      onClick={closePopup}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
                    >
                      {t("profile.cancel") || "إلغاء"}
                    </button>
                    <button
                      onClick={popup.onConfirm}
                      disabled={isProcessing}
                      className="flex-1 px-4 py-2.5 bg-[#dc3545] text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-200 flex justify-center items-center gap-2"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        t("حذف")
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closePopup}
                    className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition"
                  >
                    {t("common.ok") || "حسناً"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;
