import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api, user: adminUser } = useAuth(); // جلب الـ api والآدمن الحالي

  // 1. دالة لجلب كل المستخدمين
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response.data);
    } catch (err) {
      setError("فشل في جلب قائمة المستخدمين.");
    } finally {
      setLoading(false);
    }
  };

  // 2. دالة لتبديل صلاحية المستخدم
  const handleToggleAdmin = async (userId, currentRole) => {
    // تأكيد قبل التغيير
    const confirmChange = window.confirm(
      `هل أنت متأكد أنك تريد تغيير صلاحية هذا المستخدم من ${currentRole} إلى ${
        currentRole === "admin" ? "user" : "admin"
      }؟`
    );

    if (!confirmChange) return;

    try {
      // إرسال الطلب للباك إند
      const response = await api.put(`/admin/users/${userId}/toggle-admin`);

      // تحديث الحالة (State) في الفرونت إند فوراً
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, role: response.data.user.role } : u
        )
      );
      alert(response.data.message); // إظهار رسالة نجاح
    } catch (err) {
      alert(
        "فشل في تحديث الصلاحية: " + (err.response?.data?.error || err.message)
      );
    }
  };

  // 3. جلب المستخدمين عند تحميل الصفحة
  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>جاري تحميل المستخدمين...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        إدارة المستخدمين
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                الاسم
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                البريد
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                الصلاحية (Role)
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === "admin" ? (
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-green-800 bg-green-100 rounded-full">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex px-2 text-xs font-semibold leading-5 text-gray-800 bg-gray-100 rounded-full">
                      User
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  {/* لا نسمح للآدمن بتعديل نفسه */}
                  {user.id === adminUser.id ? (
                    <span className="text-gray-400">(أنت)</span>
                  ) : (
                    <button
                      onClick={() => handleToggleAdmin(user.id, user.role)}
                      className={`font-medium ${
                        user.role === "admin"
                          ? "text-red-600 hover:text-red-800"
                          : "text-indigo-600 hover:text-indigo-800"
                      }`}
                    >
                      {user.role === "admin" ? "إزالة كآدمن" : "ترقية لآدمن"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
