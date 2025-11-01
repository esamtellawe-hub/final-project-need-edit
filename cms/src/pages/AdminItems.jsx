import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// --- (أ) مكون النافذة المنبثقة (Modal) - (تم تعديله بالكامل) ---
const EditModal = ({ item, onClose, onSave }) => {
  // حالات للبيانات النصية
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
  });

  // حالات للصور
  // (قائمة ID الصور التي سيتم حذفها)
  const [imagesToDelete, setImagesToDelete] = useState([]);
  // (قائمة الملفات الجديدة التي سيتم رفعها)
  const [newFiles, setNewFiles] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewFiles(e.target.files);
  };

  // دالة لإضافة/إزالة صورة من قائمة الحذف
  const toggleDeleteImage = (imageId) => {
    if (imagesToDelete.includes(imageId)) {
      setImagesToDelete(imagesToDelete.filter((id) => id !== imageId));
    } else {
      setImagesToDelete([...imagesToDelete, imageId]);
    }
  };

  // عند ضغط "حفظ"
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. إنشاء FormData لإرسال الملفات
    const data = new FormData();

    // 2. إضافة البيانات النصية
    data.append("title", formData.title);
    data.append("description", formData.description);

    // 3. إضافة قائمة الصور للحذف
    data.append("imagesToDelete", JSON.stringify(imagesToDelete));

    // 4. إضافة الملفات الجديدة
    if (newFiles) {
      for (let i = 0; i < newFiles.length; i++) {
        data.append("newImages", newFiles[i]); // (نفس الاسم في Multer)
      }
    }

    // 5. إرسال الـ FormData للـ onSave
    onSave(item.id, data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">تعديل المنتج</h2>

        <form onSubmit={handleSubmit}>
          {/* الحقول النصية */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              العنوان
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              الوصف
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>

          <hr className="my-4" />

          {/* تعديل الصور الحالية */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              الصور الحالية (اضغط لحذف)
            </label>
            <div className="grid grid-cols-4 gap-4">
              {item.images && item.images.length > 0 ? (
                item.images.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={`http://localhost:5050/uploads/${img.image_path}`}
                      alt="product"
                      className={`w-full h-24 object-cover rounded-md cursor-pointer ${
                        imagesToDelete.includes(img.id)
                          ? "opacity-30 border-4 border-red-500"
                          : ""
                      }`}
                      onClick={() => toggleDeleteImage(img.id)}
                    />
                    {imagesToDelete.includes(img.id) && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-red-700">
                        للحذف
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">لا توجد صور حالية</p>
              )}
            </div>
          </div>

          <hr className="my-4" />

          {/* إضافة صور جديدة */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              إضافة صور جديدة
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* الأزرار */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- (نهاية مكون النافذة) ---

// --- (ب) المكون الرئيسي للصفحة ---
function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // 1. دالة لجلب كل المنتجات
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/items");
      setItems(response.data);
    } catch (err) {
      setError("فشل في جلب قائمة المنتجات.");
    } finally {
      setLoading(false);
    }
  };

  // 2. دالة لحذف منتج
  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm(
      "هل أنت متأكد أنك تريد حذف هذا المنتج نهائياً؟"
    );
    if (!confirmDelete) return;
    try {
      await api.delete(`/admin/items/${itemId}`);
      setItems(items.filter((item) => item.id !== itemId));
      alert("تم حذف المنتج بنجاح");
    } catch (err) {
      alert("فشل حذف المنتج: " + (err.response?.data?.error || err.message));
    }
  };

  // 3. جلب المنتجات عند تحميل الصفحة
  useEffect(() => {
    fetchItems();
  }, []);

  // --- دوال فتح/إغلاق وحفظ النافذة ---
  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
  };

  // (تعديل: الآن يستقبل FormData)
  const handleSaveItem = async (itemId, formData) => {
    try {
      // إرسال FormData. (Axios سيضع 'multipart/form-data' تلقائياً)
      const response = await api.put(`/admin/items/${itemId}`, formData);

      alert(response.data.message);
      handleCloseModal();
      fetchItems(); // <-- (مهم جداً: إعادة جلب البيانات لتحديث الجدول)
    } catch (err) {
      alert("فشل تعديل المنتج: " + (err.response?.data?.error || err.message));
    }
  };

  // ... (كود عرض الجدول) ...
  if (loading) return <p>جاري تحميل المنتجات...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-gray-800">
        إدارة المنتجات (Items)
      </h1>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                المنتج
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                الوصف
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                المالك (المستخدم)
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                {/* (الجدول يبقى كما هو) */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {item.description?.substring(0, 50) || "لا يوجد وصف"}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {item.owner?.name || "مستخدم محذوف"}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    تعديل
                  </button>
                  <span className="mx-2 text-gray-300">|</span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="font-medium text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* عرض النافذة */}
      {isModalOpen && currentItem && (
        <EditModal
          item={currentItem}
          onClose={handleCloseModal}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

export default AdminItems;
