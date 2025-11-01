import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { login } = useAuth();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5050/api/users/login", {
        email,
        password,
      });

      if (res.data?.user) {
        login(res.data.user); // بدل localStorage مباشرة
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
      className={`flex items-center justify-center h-[500px] bg-white px-4 ${
        isRTL ? "text-right" : "text-left"
      }`}
    >
      <div className="w-full max-w-md bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:rounded-xl sm:px-10">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-[#dc3545]">
            {t("login.title")}
          </h1>
          <p className="mt-2 text-gray-500">{t("login.subtitle")}</p>
        </div>
        <form onSubmit={handleLogin} className="mt-5 space-y-6">
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <div className="relative">
            <input
              required
              type="email"
              name="email"
              id="email"
              placeholder={t("login.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 placeholder:text-transparent focus:border-gray-500 focus:outline-none ${
                isRTL ? "text-right" : "text-left"
              }`}
              autoComplete="off"
            />
            <label
              htmlFor="email"
              className={`pointer-events-none absolute top-0 ${
                isRTL ? "right-0 origin-right" : "left-0 origin-left"
              } -translate-y-1/2 transform text-sm text-gray-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm peer-focus:text-gray-800`}
            >
              {t("login.email")}
            </label>
          </div>
          <div className="relative">
            <input
              required
              type="password"
              name="password"
              id="password"
              placeholder={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`peer mt-1 w-full border-b-2 border-gray-300 px-0 py-1 placeholder:text-transparent focus:border-gray-500 focus:outline-none ${
                isRTL ? "text-right" : "text-left"
              }`}
            />
            <label
              htmlFor="password"
              className={`pointer-events-none absolute top-0 ${
                isRTL ? "right-0 origin-right" : "left-0 origin-left"
              } -translate-y-1/2 transform text-sm text-gray-800 opacity-75 transition-all duration-100 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-focus:top-0 peer-focus:pl-0 peer-focus:text-sm peer-focus:text-gray-800`}
            >
              {t("login.password")}
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-[#dc3545] px-3 py-4 text-white hover:bg-red-600 focus:outline-none"
          >
            {t("login.button")}
          </button>
          <p className="text-center text-sm text-gray-500">
            {t("login.noAccount")}{" "}
            <a
              href="/SignUp"
              className="font-semibold text-[#dc3545] hover:underline focus:text-gray-800 focus:outline-none"
            >
              {t("login.signup")}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
