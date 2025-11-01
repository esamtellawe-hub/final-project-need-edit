import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const EditItem = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    cover: null,
    gallery: [],
  });
  const [error, setError] = useState("");

  useEffect(() => {
    axios(`http://localhost:5050/api/items/${id}`)
      .then((res) => {
        const data = res.data.item;
        if (data.user_id !== user.id) {
          setError("ليس لديك صلاحية تعديل هذا المنتج");
        } else {
          setItem(data);
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price,
            cover: null,
            gallery: [],
          });
        }
      })
      .catch(() => setError("فشل تحميل المنتج"));
  }, [id, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverChange = (e) => {
    setFormData((prev) => ({ ...prev, cover: e.target.files[0] }));
  };

  const handleGalleryChange = (e) => {
    setFormData((prev) => ({ ...prev, gallery: Array.from(e.target.files) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("user_id", user.id);
    if (formData.cover) data.append("cover", formData.cover);
    formData.gallery.forEach((file) => data.append("gallery", file));

    try {
      const res = await axios.put(
        `http://localhost:5050/api/items/${id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      navigate(`/details/${id}`);
    } catch (err) {
      console.error("❌ خطأ في التعديل:", err);
      setError("فشل تعديل المنتج");
    }
  };

  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (!item) return <p className="text-center mt-10">{t("details.loading")}</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 text-[#dc3545]">
        {t("edit.title")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">{t("edit.name")}</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            {t("edit.description")}
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("edit.price")}</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("edit.cover")}</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} />
        </div>
        <div>
          <label className="block mb-1 font-medium">{t("edit.gallery")}</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryChange}
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          {t("edit.save")}
        </button>
      </form>
    </div>
  );
};

export default EditItem;
