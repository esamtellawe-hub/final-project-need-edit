import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Swap = () => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchItems = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await axios.get("http://localhost:5050/api/items");
      const sorted = res.data.items.sort((a, b) => a.price - b.price);
      setItems(sorted);
    } catch (err) {
      console.error("❌ خطأ في جلب المنتجات:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">{t("swap.loading")}</p>;
  }

  if (error) {
    return (
      <p className="text-center text-red-600 mt-10">{t("swap.errorLoading")}</p>
    );
  }

  return (
    <div className="bg-white min-h-screen p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (!user) return navigate("/Login");
              if (user.id === item.owner?.id) {
                navigate(`/edit/${item.id}`);
              } else {
                navigate(`/details/${item.id}`);
              }
            }}
            className="block cursor-pointer"
          >
            <div className="bg-white rounded-lg shadow-md p-4 transition hover:shadow-lg">
              <img
                src={`http://localhost:5050/uploads/${item.cover_image}`}
                alt={item.title}
                className="h-40 w-full object-cover mb-4 rounded transition-transform duration-300 hover:-translate-y-2"
              />
              <h2 className="text-base font-semibold text-gray-800 truncate">
                {item.title}
              </h2>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="text-lg font-bold text-[#dc3545]">
                {item.price} د.أ
              </p>
              <div className="text-sm text-gray-500 mt-1">
                {t("swap.by")}: {item.owner?.name}
              </div>
              <button className="mt-3 w-full bg-[#dc3545] hover:bg-red-700 text-white py-2 rounded text-sm">
                {user ? t("swap.swapButton") : t("swap.loginToSwap")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Swap;
