import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const [phoneError, setPhoneError] = useState("");
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get("phone");

    const jordanPhoneRegex = /^07[7-9][0-9]{7}$/;
    if (!jordanPhoneRegex.test(phone)) {
      setPhoneError(
        "رقم الهاتف غير صالح. الرجاء إدخال رقم أردني مثل 07XXXXXXXX"
      );
      return;
    }

    setPhoneError("");
    formData.append("role", "user");

    try {
      const res = await axios.post(
        "http://localhost:5050/api/users/register",
        formData
      );
      if (res.status === 201) {
        alert("تم التسجيل بنجاح");
        navigate("/Login");
      }
    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.error || "فشل التسجيل");
    }
  };

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-white px-4 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="w-full max-w-md bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-[#dc3545]">
            {t("signup.title")}
          </h1>
          <p className="mt-2 text-gray-500">{t("signup.subtitle")}</p>
        </div>

        <form
          className="mt-5 space-y-6"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          <InputField
            name="name"
            type="text"
            label={t("signup.name")}
            isRTL={isRTL}
            required
          />
          <InputField
            name="email"
            type="email"
            label={t("signup.email")}
            isRTL={isRTL}
            required
          />
          <InputField
            name="password"
            type="password"
            label={t("signup.password")}
            isRTL={isRTL}
            required
          />
          <InputField
            name="phone"
            type="text"
            label={t("signup.phone")}
            isRTL={isRTL}
            required
            error={phoneError}
          />
          <InputField
            name="location"
            type="text"
            label={t("signup.location")}
            isRTL={isRTL}
            required
          />

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              {t("signup.photo")}
            </label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-[#dc3545] px-3 py-4 text-white hover:bg-red-600 focus:outline-none"
          >
            {t("signup.button")}
          </button>

          <p className="text-center text-sm text-gray-500">
            {t("signup.haveAccount")}{" "}
            <a
              href="/Login"
              className="font-semibold text-[#dc3545] hover:underline focus:text-gray-800 focus:outline-none"
            >
              {t("signup.login")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

function InputField({ name, type, label, isRTL, error, ...rest }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        id={name}
        placeholder={label}
        className={`peer mt-1 w-full border-b-2 px-0 py-1 placeholder:text-transparent focus:outline-none ${
          error ? "border-red-500" : "border-gray-300"
        } ${isRTL ? "text-right" : "text-left"}`}
        autoComplete="off"
        {...rest}
      />
      <label
        htmlFor={name}
        className={`pointer-events-none absolute top-0 ${
          isRTL ? "right-0 origin-right" : "left-0 origin-left"
        } -translate-y-1/2 transform text-sm text-gray-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm peer-focus:text-gray-800`}
      >
        {label}
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
