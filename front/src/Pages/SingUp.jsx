import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

export default function Signup() {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();

  // حالات إضافية للتحكم بالواجهة
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // 1. مخطط التحقق (Validation Schema)
  // 1. مخطط التحقق (Validation Schema)
  const schema = yup.object().shape({
    name: yup
      .string()
      .required(t("validation.nameRequired"))
      .min(3, t("validation.nameMin")),
    email: yup
      .string()
      .required(t("validation.emailRequired"))
      .email(t("validation.emailInvalid")),
    password: yup
      .string()
      .required(t("validation.passwordRequired"))
      .min(8, t("validation.passwordMin"))
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        t("validation.passwordComplexity")
      ),
    phone: yup
      .string()
      .required(t("validation.phoneRequired"))
      .matches(/^07[789]\d{7}$/, t("validation.phoneInvalid")),
    location: yup.string().required(t("validation.locationRequired")),

    // فاليديشن الصورة
    photo: yup
      .mixed()
      .test("fileSize", t("validation.fileSizeError"), (value) => {
        if (!value || value.length === 0) return true;
        return value[0].size <= 5000000; // 5MB limit
      }),
  });

  // 2. إعداد الفورم
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // معالجة اختيار الصورة للعرض المباشر
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. الإرسال للسيرفر
  const onSubmit = async (data) => {
    setServerError("");

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phone", data.phone);
    formData.append("location", data.location);
    formData.append("role", "user");

    if (data.photo && data.photo[0]) {
      formData.append("photo", data.photo[0]);
    }

    try {
      const res = await axios.post(
        "http://localhost:5050/api/users/register",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.status === 201) {
        navigate("/Login");
      }
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.error || t("حدث خطأ أثناء التسجيل، حاول مرة أخرى")
      );
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-12"
      dir={isRTL ? "rtl" : "ltr"} // ✅ ضبط الاتجاه تلقائياً
    >
      <div className="w-full max-w-md bg-white px-8 pt-10 pb-8 shadow-2xl ring-1 ring-gray-900/5 sm:rounded-2xl border-t-4 border-[#dc3545]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#dc3545]">
            {t("signup.title")}
          </h1>
          <p className="mt-2 text-gray-500">{t("signup.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Input */}
          <div className="relative group">
            <input
              type="text"
              id="name"
              placeholder=" "
              className={`peer w-full border-b-2 bg-transparent py-2 px-1 text-gray-900 placeholder-transparent focus:border-[#dc3545] focus:outline-none transition-colors ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              {...register("name")}
            />
            <label
              htmlFor="name"
              className={`absolute right-0 -top-3.5 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#dc3545] ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              {t("signup.name")}
            </label>
            {errors.name && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div className="relative group">
            <input
              type="email"
              id="email"
              placeholder=" "
              className={`peer w-full border-b-2 bg-transparent py-2 px-1 text-gray-900 placeholder-transparent focus:border-[#dc3545] focus:outline-none transition-colors ${
                errors.email ? "border-red-500" : "border-gray-300"
              } ltr:text-left rtl:text-right`} // تعديل لمحاذاة الإيميل
              {...register("email")}
            />
            <label
              htmlFor="email"
              className={`absolute -top-3.5 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#dc3545] ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              {t("signup.email")}
            </label>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder=" "
                className={`peer w-full border-b-2 bg-transparent py-2 px-1 text-gray-900 placeholder-transparent focus:border-[#dc3545] focus:outline-none transition-colors ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                {...register("password")}
              />
              <label
                htmlFor="password"
                className={`absolute -top-3.5 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#dc3545] ${
                  isRTL ? "right-0" : "left-0"
                }`}
              >
                {t("signup.password")}
              </label>

              {/* أيقونة العين */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute bottom-2 text-gray-400 hover:text-[#dc3545] ${
                  isRTL ? "left-0" : "right-0"
                }`}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div className="relative group">
            <input
              type="text"
              id="phone"
              placeholder=" "
              className={`peer w-full border-b-2 bg-transparent py-2 px-1 text-gray-900 placeholder-transparent focus:border-[#dc3545] focus:outline-none transition-colors ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } ltr:text-left rtl:text-right`}
              {...register("phone")}
            />
            <label
              htmlFor="phone"
              className={`absolute -top-3.5 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#dc3545] ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              {t("signup.phone")}
            </label>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Location Input */}
          <div className="relative group">
            <input
              type="text"
              id="location"
              placeholder=" "
              className={`peer w-full border-b-2 bg-transparent py-2 px-1 text-gray-900 placeholder-transparent focus:border-[#dc3545] focus:outline-none transition-colors ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
              {...register("location")}
            />
            <label
              htmlFor="location"
              className={`absolute -top-3.5 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-[#dc3545] ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              {t("signup.location")}
            </label>
            {errors.location && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Photo Input (محسن) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("signup.photo")}
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#dc3545] hover:bg-red-50 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="mt-2 text-xs text-gray-500">
                  {t("اختر صورة شخصية")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("photo", {
                    onChange: handleImageChange,
                  })}
                />
              </label>

              {/* عرض الصورة المختارة */}
              {imagePreview && (
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#dc3545]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            {errors.photo && (
              <p className="mt-1 text-xs text-red-500 font-medium">
                {errors.photo.message}
              </p>
            )}
          </div>

          {/* Server Error Message */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">
              {serverError}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#dc3545] px-3 py-3 text-white font-bold hover:bg-[#c82333] shadow-lg shadow-red-200 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            )}
            {t("signup.button")}
          </button>

          <p className="text-center text-sm text-gray-500">
            {t("signup.haveAccount")}{" "}
            <a
              href="/Login"
              className="font-semibold text-[#dc3545] hover:underline transition-colors"
            >
              {t("signup.login")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
