import React from "react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-screen bg-pink-100 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-[670px] p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* قسم معلومات التواصل */}

          <div
            className="col-span-1 bg-[#dc3545] border border-red-200 p-8 rounded-lg text-base text-white w-[310px] h-[340px]
  mx-auto
  transform
  translate-x-0
  md:translate-x-0
  md:translate-y-4
  ltr:md:-translate-x-1/2
  rtl:md:translate-x-1/2
"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              {t("contact.contactUs")}
            </h3>
            <p className="mb-3 text-white">
              <strong>🏠:</strong> {t("contact.address")}
            </p>
            <p className="mb-3 text-white">
              <strong>📧:</strong> {t("contact.email")}
            </p>
            <p className="mb-3 text-white">
              <strong>📱:</strong> {t("contact.phone")}
            </p>
            <p className="text-white">
              <strong>📠:</strong> {t("contact.fax")}
            </p>
          </div>

          {/* قسم النموذج */}
          <form className="col-span-2 space-y-5">
            <h2 className="text-3xl font-bold text-[#dc3545] mb-8">
              {t("contact.formTitle")}
            </h2>
            <input
              type="text"
              placeholder={t("contact.name")}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
            />
            <input
              type="email"
              placeholder={t("contact.emailField")}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
            />
            <textarea
              placeholder={t("contact.message")}
              className="w-full p-3 border rounded h-24 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
            ></textarea>
            <button className="bg-[#dc3545] text-white px-6 py-3 rounded hover:bg-red-600 transition">
              {t("contact.send")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
