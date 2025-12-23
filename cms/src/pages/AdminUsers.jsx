import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// قمنا بإضافة أيقونات جديدة للبوب اب
import {
  Trash2,
  UserCog,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api, user: adminUser } = useAuth();

  // --- 1. إعدادات الـ Popup (Modal) ---
  const [modal, setModal] = useState({
    isOpen: false,
    type: "confirm", // 'confirm' | 'success' | 'error'
    title: "",
    message: "",
    onConfirm: null, // الدالة التي ستنفذ عند الموافقة
  });

  // دالة مساعدة لغلق البوب اب
  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // دالة لإظهار بوب اب النجاح
  const showSuccess = (msg) => {
    setModal({
      isOpen: true,
      type: "success",
      title: "تمت العملية بنجاح",
      message: msg,
      onConfirm: null,
    });
  };

  // دالة لإظهار بوب اب الخطأ
  const showError = (msg) => {
    setModal({
      isOpen: true,
      type: "error",
      title: "حدث خطأ",
      message: msg,
      onConfirm: null,
    });
  };

  // --- نهاية إعدادات البوب اب ---

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

  // 2. تعديل دالة تبديل الصلاحية
  const handleToggleAdminClick = (userId, currentRole) => {
    // بدلاً من window.confirm، نفتح البوب اب
    setModal({
      isOpen: true,
      type: "confirm",
      title: "تغيير الصلاحية",
      message: `هل أنت متأكد أنك تريد تغيير صلاحية هذا المستخدم من ${currentRole} إلى ${
        currentRole === "admin" ? "user" : "admin"
      }؟`,
      onConfirm: async () => {
        // ننفذ اللوجيك هنا بعد الموافقة
        try {
          const response = await api.put(`/admin/users/${userId}/toggle-admin`);
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === userId ? { ...u, role: response.data.user.role } : u
            )
          );
          closeModal(); // نغلق بوب اب التأكيد
          setTimeout(() => showSuccess(response.data.message), 300); // نظهر بوب اب النجاح
        } catch (err) {
          closeModal();
          setTimeout(
            () => showError(err.response?.data?.error || err.message),
            300
          );
        }
      },
    });
  };

  // 3. تعديل دالة الحذف
  const handleDeleteUserClick = (userId) => {
    setModal({
      isOpen: true,
      type: "delete", // نوع خاص للحذف ليكون باللون الأحمر
      title: "حذف المستخدم",
      message:
        "هل أنت متأكد تماماً أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${userId}`);
          setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));

          closeModal();
          setTimeout(() => showSuccess("تم حذف المستخدم بنجاح."), 300);
        } catch (err) {
          closeModal();
          setTimeout(
            () => showError(err.response?.data?.error || err.message),
            300
          );
        }
      },
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return <p className="text-center p-8">جاري تحميل المستخدمين...</p>;
  if (error) return <p className="text-red-600 text-center p-8">{error}</p>;

  return (
    <div className="relative min-h-screen">
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
                الصلاحية
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
                  {user.id === adminUser.id ? (
                    <span className="text-gray-400 text-xs">
                      (حسابك الحالي)
                    </span>
                  ) : (
                    <div className="flex items-center gap-4">
                      {/* زر تغيير الصلاحية */}
                      <button
                        onClick={() =>
                          handleToggleAdminClick(user.id, user.role)
                        }
                        className={`font-medium transition-colors flex items-center gap-1 ${
                          user.role === "admin"
                            ? "text-orange-600 hover:text-orange-800"
                            : "text-blue-600 hover:text-blue-800"
                        }`}
                      >
                        <UserCog size={16} />
                        {user.role === "admin" ? "إزالة Admin" : "تعيين Admin"}
                      </button>

                      {/* زر الحذف */}
                      <button
                        onClick={() => handleDeleteUserClick(user.id)}
                        className="text-red-600 hover:text-red-900 font-medium transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================== MODAL COMPONENT (POPUP) ==================== */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            {/* Header Icon based on type */}
            <div
              className={`p-6 flex flex-col items-center text-center space-y-4 ${
                modal.type === "delete" || modal.type === "error"
                  ? "bg-red-50"
                  : modal.type === "success"
                  ? "bg-green-50"
                  : "bg-blue-50"
              }`}
            >
              {modal.type === "delete" && (
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                  <Trash2 size={32} />
                </div>
              )}
              {modal.type === "error" && (
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                  <AlertCircle size={32} />
                </div>
              )}
              {modal.type === "success" && (
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <CheckCircle size={32} />
                </div>
              )}
              {modal.type === "confirm" && (
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <AlertTriangle size={32} />
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">{modal.title}</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6">{modal.message}</p>

              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                {/* أزرار الحذف والتأكيد تظهر خيارين */}
                {modal.type === "confirm" || modal.type === "delete" ? (
                  <>
                    <button
                      onClick={closeModal}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={modal.onConfirm}
                      className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-transform active:scale-95 ${
                        modal.type === "delete"
                          ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                          : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                      }`}
                    >
                      {modal.type === "delete" ? "نعم، حذف" : "نعم، تأكيد"}
                    </button>
                  </>
                ) : (
                  /* أزرار النجاح والخطأ تظهر زر واحد فقط */
                  <button
                    onClick={closeModal}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all w-full"
                  >
                    حسناً
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
