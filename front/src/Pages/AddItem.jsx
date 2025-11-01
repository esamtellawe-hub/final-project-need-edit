import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const AddItem = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [itemData, setItemData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    cover: null,
    preview: null,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemData((prev) => ({
        ...prev,
        cover: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", itemData.title);
    formData.append("description", itemData.description);
    formData.append("price", itemData.price);
    formData.append("user_id", user.id); // ربط المنتج بالمستخدم
    if (itemData.cover) formData.append("cover", itemData.cover);

    try {
      const res = await axios.post("http://localhost:5050/api/items", formData);
      setMessage(t("addItem.success"));
      setItemData({
        title: "",
        description: "",
        price: "",
        category: "",
        cover: null,
        preview: null,
      });
    } catch (err) {
      console.error("❌ فشل الإضافة:", err);
      setMessage(t("addItem.error"));
    }
  };

  return (
    <section className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow mt-10">
      <h2 className="text-xl font-bold mb-4 text-[#dc3545]">
        {t("addItem.title")}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <p className="text-center text-sm text-green-600">{message}</p>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("addItem.name")}
          </label>
          <input
            type="text"
            name="title"
            value={itemData.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("addItem.description")}
          </label>
          <textarea
            name="description"
            value={itemData.description}
            onChange={handleChange}
            rows="3"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("addItem.price")}
          </label>
          <input
            type="number"
            name="price"
            value={itemData.price}
            onChange={handleChange}
            required
            min={1}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("addItem.image")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          {itemData.preview && (
            <img
              src={itemData.preview}
              alt="Preview"
              className="mt-3 w-32 h-32 object-cover rounded"
            />
          )}
        </div>

        <div className="text-end">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            {t("addItem.submit")}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AddItem;
