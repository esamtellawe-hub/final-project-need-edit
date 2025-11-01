import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// أيقونات مؤقتة
const Icon = ({ path }) => (
  <svg
    className="w-8 h-8"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={path}
    />
  </svg>
);
const ICONS = {
  users:
    "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  items:
    "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  admin:
    "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
};

// كرت الإحصائيات
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="flex items-center p-6 bg-white rounded-lg shadow-lg">
    <div
      className={`flex items-center justify-center w-16 h-16 rounded-full ${colorClass} text-white`}
    >
      {icon}
    </div>
    <div className="ml-4">
      <h3 className="text-lg font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/admin/stats");
        setStats(response.data);
      } catch (err) {
        setError("فشل في جلب الإحصائيات.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-lg text-gray-600">جاري تحميل الإحصائيات...</span>
      </div>
    );
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return null;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">ملخص الإحصائيات</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.usersCount}
          icon={<Icon path={ICONS.users} />}
          colorClass="bg-blue-500"
        />
        <StatCard
          title="إجمالي المنتجات (Items)"
          value={stats.productsCount}
          icon={<Icon path={ICONS.items} />}
          colorClass="bg-green-500"
        />
        <StatCard
          title="عدد الآدمنز"
          value={stats.adminsCount}
          icon={<Icon path={ICONS.admin} />}
          colorClass="bg-red-500"
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
