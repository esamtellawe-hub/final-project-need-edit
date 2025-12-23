import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import i18n from "../i18n";

// ✅ تعريف الصورة الافتراضية
const DefaultPhoto = "/images/profile.jpeg";

const Profile = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";

  // ✅ استدعاء البيانات من الكونتكست
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [userData, setUserData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [myItems, setMyItems] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // 🗑️ State for Custom Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Validation Schema
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
          if (password && value !== password) {
            return false;
          }
          return true;
        }
      ),
  });

  // 2. Setup Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // 3. Fetch Data
  useEffect(() => {
    if (!token) {
      setFetchError("Please login first.");
      return;
    }

    if (!user?.id) return;

    const fetchProfileData = async () => {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

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
        setFetchError(
          t("profile.updateError") + " (Status: " + err.response?.status + ")"
        );
      }
    };

    fetchProfileData();
  }, [user, token, reset, t]);

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

  // 4. Update Profile Logic
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone || "");
    formData.append("location", data.location || "");

    if (data.password) {
      formData.append("password", data.password);
    }

    if (data.photo instanceof File) {
      formData.append("photo", data.photo);
    }

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
        alert(t("profile.updateSuccess") || "تم تحديث البيانات بنجاح");
      }
    } catch (err) {
      console.error("Update Error:", err);
      const backendError =
        err.response?.data?.error || t("profile.updateError");
      alert(backendError);
    }
  };

  // 5. Delete Logic (With Modal)

  // فتح النافذة
  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  // إغلاق النافذة
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // تنفيذ الحذف
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5050/api/items/${itemToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyItems((prev) => prev.filter((item) => item.id !== itemToDelete));
      closeDeleteModal();
      // يمكن إضافة توست (toast) هنا بدلاً من الـ alert
      // alert(t("تم حذف العنصر بنجاح"));
    } catch (err) {
      console.error("Delete Error:", err);
      alert(t("حدث خطأ أثناء الحذف"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/Login");
  };

  if (fetchError && !userData)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
          ⚠️ {fetchError}
        </p>
      </div>
    );

  if (!userData)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#dc3545]"></div>
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
              <div className="relative -mt-16 inline-block">
                <img
                  src={getProfileImageSrc()}
                  onError={(e) => (e.target.src = DefaultPhoto)}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
                />
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="absolute bottom-2 right-0 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors border border-gray-200 text-[#dc3545]"
                  title={t("profile.editTitle")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15H9v-2z"
                    />
                  </svg>
                </button>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mt-3">
                {userData.name}
              </h3>
              <p className="text-sm text-gray-500 mb-6">{userData.email}</p>

              <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl text-start">
                {/* User Info Details ... */}
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
                    {t("profile.memberSince")} 2024
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full py-2.5 px-4 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-semibold flex items-center justify-center gap-2"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
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
                        <p className="text-red-500 text-xs mt-1 font-medium">
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
                  📦 {t("profile.swapTitle")}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
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
                  className="mt-4 text-[#dc3545] font-semibold hover:underline"
                >
                  + أضف منتجك الأول
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

                      {/* زر الحذف العائم الذي يفتح النافذة */}
                      <button
                        onClick={() => handleDeleteClick(item.id)} // 👈👈 هنا التغيير
                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition opacity-0 group-hover:opacity-100 shadow-sm z-10"
                        title="حذف العنصر"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
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

      {/* 🔥🔥🔥 Custom Delete Modal 🔥🔥🔥 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100 animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              {/* أيقونة التحذير */}
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-[#dc3545]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t("تأكيد الحذف")} {/* أو "Confirm Deletion" */}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {t(
                  "هل أنت متأكد أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء."
                )}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {t("profile.cancel") || "إلغاء"}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-[#dc3545] text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-200 flex justify-center items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  {isDeleting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    t("حذف")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Profile;
