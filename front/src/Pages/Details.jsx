import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
// 💡 ملاحظة: لا نحتاج import للصورة طالما هي في مجلد public

const Details = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    axios(`http://localhost:5050/api/items/${id}`)
      .then((res) => {
        const fetchedItem = res.data.item;
        if (fetchedItem) {
          setItem(fetchedItem);
          setSelectedImage(fetchedItem.cover_image);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [id]);

  if (error)
    return (
      <p className="text-center text-red-600 mt-10">
        {t("details.errorLoading")}
      </p>
    );

  if (!item)
    return (
      <p className="text-center mt-10 text-lg font-semibold">
        {t("details.loading")}{" "}
      </p>
    );

  return (
    <div
      className="min-h-screen bg-gray-50 p-4 md:p-8"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      {" "}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
        {" "}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* --- 1. معرض الصور --- */}{" "}
          <div className="space-y-4">
            {/* الصورة الرئيسية الكبيرة */}{" "}
            <div className="bg-gray-100 rounded-lg overflow-hidden border aspect-square">
              {" "}
              <img
                src={`http://localhost:5050/uploads/${selectedImage}`}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-300"
              />{" "}
            </div>
            {/* شريط الصور المصغرة */}{" "}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* الصورة الرئيسية كصورة مصغرة */}{" "}
              <img
                src={`http://localhost:5050/uploads/${item.cover_image}`}
                alt={t("details.coverThumbnailAlt")}
                className={`h-20 w-20 object-cover rounded-md cursor-pointer border-2 transition-all ${
                  selectedImage === item.cover_image
                    ? "border-purple-600"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => setSelectedImage(item.cover_image)}
              />
              {/* باقي الصور المصغرة */}{" "}
              {item.images?.map((img) => (
                <img
                  key={img.id}
                  src={`http://localhost:5050/uploads/${img.image_path}`}
                  alt={t("details.extraImageAlt")}
                  className={`h-20 w-20 object-cover rounded-md cursor-pointer border-2 transition-all ${
                    selectedImage === img.image_path
                      ? "border-purple-600"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedImage(img.image_path)}
                />
              ))}{" "}
            </div>{" "}
          </div>
          {/* --- 2. التفاصيل --- */}{" "}
          <div className="space-y-6">
            {" "}
            <h1 className="text-4xl font-extrabold text-gray-800">
              {item.title}{" "}
            </h1>{" "}
            <p className="text-3xl font-bold text-purple-600">
              💵 {t("details.estimatedValue")}: {item.price}{" "}
              {t("details.currency")} {/* 💡 التعديل هنا */}
            </p>
            {/* الوصف */}{" "}
            <div>
              {" "}
              <h3 className="text-xl font-semibold mb-2 text-gray-700">
                {t("details.descriptionTitle")}{" "}
              </h3>{" "}
              <p className="text-gray-600 leading-relaxed">
                {item.description}{" "}
              </p>{" "}
            </div>
            {/* معلومات المالك */}{" "}
            <div className="bg-gray-50 p-4 rounded-lg border">
              {" "}
              <h3 className="text-xl font-semibold mb-3 text-gray-700">
                {t("details.ownerInfo")}{" "}
              </h3>{" "}
              <div className="flex items-center gap-3">
                {" "}
                <img
                  src={
                    item.owner.photo
                      ? `http://localhost:5050/uploads/${item.owner.photo}`
                      : "/images/profile.jpeg" // 💡 تم التصحيح هنا
                  }
                  alt={item.owner.name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-200"
                />{" "}
                <div>
                  {" "}
                  <p className="font-bold text-gray-900">
                    {item.owner.name}{" "}
                  </p>{" "}
                  <p className="text-sm text-gray-500">
                    📍 {item.owner.location || t("details.locationUnknown")}{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>
            {/* تفاصيل الغرض */}{" "}
            <div>
              {" "}
              <h3 className="text-xl font-semibold mb-3 text-gray-700">
                {t("details.itemInfo")}{" "}
              </h3>{" "}
              <ul className="space-y-3">
                {/* رقم الهاتف */}{" "}
                <li className="flex items-center gap-3">
                  <span className="text-xl">📞</span>{" "}
                  <span className="font-semibold">{t("details.phone")}:</span>{" "}
                  <span className="text-gray-700" dir="ltr">
                    {" "}
                    {item.owner.phone || t("details.notProvided")}{" "}
                  </span>{" "}
                </li>{" "}
                <li className="flex items-center gap-3">
                  <span className="text-xl">📦</span>{" "}
                  <span className="font-semibold">
                    {t("details.quantity")}:
                  </span>{" "}
                  <span className="text-gray-700">1 {t("details.pieces")}</span>{" "}
                </li>{" "}
                <li className="flex items-center gap-3">
                  <span className="text-xl">🔁</span>{" "}
                  <span className="font-semibold">{t("details.swap")}:</span>{" "}
                  <span className="text-green-600 font-medium">
                    {t("details.swapOpen")}{" "}
                  </span>
                </li>{" "}
                <li className="flex items-center gap-3">
                  <span className="text-xl">💰</span>{" "}
                  <span className="font-semibold">{t("details.sell")}:</span>{" "}
                  <span className="text-green-600 font-medium">
                    {t("details.sellAvailable")}{" "}
                  </span>{" "}
                </li>{" "}
              </ul>{" "}
            </div>
            {/* الأزرار */}{" "}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              {" "}
              <button
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 font-semibold text-lg flex items-center justify-center gap-2 shadow-md"
                onClick={() =>
                  navigate(`/chat/${item.owner.id}?itemId=${item.id}`)
                }
              >
                <span>💬</span> {t("details.message")}{" "}
              </button>{" "}
              <a
                href={`tel:${item.owner.phone}`}
                className={`flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold text-lg flex items-center justify-center gap-2 shadow-md ${
                  !item.owner.phone ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={(e) => !item.owner.phone && e.preventDefault()}
              >
                <span>📞</span> {t("details.callOwner")}{" "}
              </a>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

export default Details;
