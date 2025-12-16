import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import DefaultPhoto from "../../public/images/profile.jpeg";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const Profile = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [userData, setUserData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [myItems, setMyItems] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  // 1. تعريف مخطط التحقق (Validation Schema)
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

    // --- التحقق من كلمة المرور الجديدة ---
    password: yup
      .string()
      .transform((curr, orig) => (orig === "" ? null : curr))
      .nullable()
      .test("password-strength", t("validation.passwordWeak"), (value) => {
        if (!value) return true;
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value);
      }),

    // --- التحقق من تطابق كلمة المرور ---
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

  // 2. إعداد React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    if (!user) return;

    const fetchProfileData = async () => {
      try {
        const userRes = await axios.get(
          `http://localhost:5050/api/users/${user.id}`
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
          `http://localhost:5050/api/items/user/${user.id}`
        );
        setMyItems(itemsRes.data.items || []);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUserData(storedUser);
          reset(storedUser);
        } else {
          setFetchError(t("profile.updateError")); // استخدام الترجمة للخطأ
        }
      }
    };

    fetchProfileData();
  }, [user, reset, t]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setValue("photo", file);
    }
  };

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
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data?.user) {
        const updatedUser = res.data.user;
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setShowForm(false);
        setImagePreview(null);
        reset({ ...updatedUser, password: "", confirmPassword: "" });
      }
    } catch (err) {
      console.error("Update Error:", err);
      const backendError =
        err.response?.data?.error || t("profile.updateError");
      alert(backendError);
    }
  };

  if (fetchError && !userData)
    return <p className="text-center text-red-600 mt-10">{fetchError}</p>;
  if (!userData)
    return <p className="text-center mt-10">{t("profile.loading")}</p>;

  return (
    <section className={`py-10 px-4 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === Profile Card === */}
        <div className="bg-white p-6 rounded-lg shadow text-center h-fit">
          <div className="relative inline-block mb-4">
            <img
              src={
                imagePreview
                  ? imagePreview
                  : userData.photo
                  ? `http://localhost:5050/uploads/${userData.photo}`
                  : DefaultPhoto
              }
              onError={(e) => (e.target.src = DefaultPhoto)}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-gray-100"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#dc3545]"
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

          <h3 className="text-xl font-semibold">{userData.name}</h3>
          <p className="text-sm text-gray-500">{t("profile.memberSince")}</p>

          <ul
            className="mt-6 space-y-3 text-sm text-gray-700 mx-auto max-w-xs"
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <li className="flex justify-between border-b pb-2">
              <span className="font-semibold">{t("profile.email")}:</span>
              <span>{userData.email}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="font-semibold">{t("profile.phone")}:</span>
              <span>{userData.phone || "---"}</span>
            </li>
            <li className="flex justify-between border-b pb-2">
              <span className="font-semibold">{t("profile.location")}:</span>
              <span>{userData.location || "---"}</span>
            </li>
          </ul>

          <button
            onClick={() => {
              logout();
              navigate("/Login");
            }}
            className="mt-6 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition font-medium"
          >
            {t("profile.logout")}
          </button>
        </div>

        {/* === Side Content === */}
        <div className="lg:col-span-2 space-y-6">
          {/* === Edit Form === */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#dc3545]">
              <h4 className="text-lg font-semibold mb-6 text-gray-800 border-b pb-2">
                {t("profile.editTitle")}
              </h4>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Name */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.name")}
                  </label>
                  <input
                    {...register("name")}
                    type="text"
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-red-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.emailLabel")}
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-red-200"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.phoneLabel")}
                  </label>
                  <input
                    {...register("phone")}
                    type="text"
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-red-200"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.locationLabel")}
                  </label>
                  <input
                    {...register("location")}
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200"
                  />
                </div>

                {/* --- Password Section Divider --- */}
                <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                  <h5 className="text-sm font-bold text-gray-600 mb-3">
                    {t("profile.changePasswordTitle")}
                  </h5>
                </div>

                {/* New Password */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.newPassword")}
                  </label>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder={t("profile.newPasswordPlaceholder")}
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-red-200"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.confirmPassword")}
                  </label>
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder={t("profile.confirmPasswordPlaceholder")}
                    className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:ring-red-200"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <p
                    className="text-xs text-gray-500"
                    style={{ direction: isRTL ? "rtl" : "ltr" }}
                  >
                    {t("profile.passwordRules")}
                  </p>
                </div>

                {/* Photo Upload */}
                <div className="md:col-span-2 mt-2">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.photoLabel")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition disabled:bg-green-400"
                  >
                    {isSubmitting ? t("profile.loading") : t("profile.save")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* === My Items === */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
              <span
                className={`w-2 h-6 bg-blue-600 rounded-full ${
                  isRTL ? "ml-2" : "mr-2"
                }`}
              ></span>
              {t("profile.swapTitle")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myItems.length === 0 ? (
                <p className="text-gray-500 col-span-full text-center py-6">
                  {t("profile.noItems")}
                </p>
              ) : (
                myItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition relative group bg-white"
                  >
                    <div className="relative h-48">
                      <img
                        src={`http://localhost:5050/uploads/${item.cover_image}`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/150")
                        }
                      />
                    </div>
                    <div className="p-4">
                      <h5 className="text-md font-bold text-gray-800 truncate">
                        {item.title}
                      </h5>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[#dc3545] font-bold text-sm">
                          {item.price} د.أ
                        </span>
                        <button
                          onClick={() => navigate(`/edit/${item.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {t("profile.editItem")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
