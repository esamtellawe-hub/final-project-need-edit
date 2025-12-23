import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import i18n from "../i18n"; // لم نعد بحاجة لهذا للتحقق من الاتجاه
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ❌ قمنا بإزالة الاعتماد على isRTL في التنسيق
  // const isRTL = i18n.language === "ar";

  const { login } = useAuth();

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError(t("login.empty"));
      return;
    }

    try {
      const res = await axios.post("http://localhost:5050/api/users/login", {
        email,
        password,
      });

      if (res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token);
        navigate("/Profile");
      } else {
        setError(t("login.invalid"));
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || t("login.loadError"));
    }
  };

  return (
    <div
      // ✅ إجبار الاتجاه ليكون LTR دائماً
      dir="ltr"
      className="flex items-center justify-center h-[500px] bg-white px-4 text-left"
    >
      <div className="w-full max-w-md bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10 border-t-4 border-[#dc3545]">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-[#dc3545]">
            {t("login.title")}
          </h1>
          <p className="mt-2 text-gray-500">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleLogin} noValidate className="mt-5 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              name="email"
              id="email"
              placeholder={t("login.email")}
              value={email}
              onChange={handleInputChange(setEmail)}
              // ✅ تثبيت النص لليسار (text-left)
              className="peer mt-1 w-full border-b-2 px-0 py-1 placeholder:text-transparent focus:outline-none transition-colors duration-200 border-gray-300 focus:border-[#dc3545] text-gray-900 text-left"
              autoComplete="off"
            />
            <label
              htmlFor="email"
              // ✅ تثبيت التموضع لليسار (left-0 origin-left)
              className={`pointer-events-none absolute top-0 -translate-y-1/2 transform text-sm transition-all duration-200 ease-in-out 
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm 
                left-0 origin-left
                ${
                  error
                    ? "text-[#dc3545]"
                    : "text-gray-500 peer-focus:text-[#dc3545]"
                }
              `}
            >
              {t("login.email")}
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              name="password"
              id="password"
              placeholder={t("login.password")}
              value={password}
              onChange={handleInputChange(setPassword)}
              // ✅ تثبيت النص لليسار (text-left)
              className="peer mt-1 w-full border-b-2 px-0 py-1 placeholder:text-transparent focus:outline-none transition-colors duration-200 border-gray-300 focus:border-[#dc3545] text-gray-900 text-left"
            />
            <label
              htmlFor="password"
              // ✅ تثبيت التموضع لليسار (left-0 origin-left)
              className={`pointer-events-none absolute top-0 -translate-y-1/2 transform text-sm transition-all duration-200 ease-in-out 
                peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm 
                left-0 origin-left
                ${
                  error
                    ? "text-[#dc3545]"
                    : "text-gray-500 peer-focus:text-[#dc3545]"
                }
              `}
            >
              {t("login.password")}
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-[#dc3545] px-3 py-4 text-white font-bold hover:bg-[#c82333] shadow-lg shadow-red-100 focus:outline-none focus:ring-4 focus:ring-red-200 transition-all"
          >
            {t("login.button")}
          </button>

          <p className="text-center text-sm text-gray-500">
            {t("login.noAccount")}{" "}
            <a
              href="/SignUp"
              className="font-semibold text-[#dc3545] hover:underline focus:text-[#c82333] focus:outline-none"
            >
              {t("login.signup")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
