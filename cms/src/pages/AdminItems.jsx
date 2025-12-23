import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
// استيراد الأيقونات
import {
  Trash2,
  Edit,
  X,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ImageIcon,
  Image as IconImage, // أيقونة لتمييز الغلاف
} from "lucide-react";

// ==========================================
// 1. مكون نافذة تعديل المنتج (Edit Modal)
// ==========================================
const EditItemModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
  });

  // --- إدارة صورة الغلاف ---
  const [deleteCover, setDeleteCover] = useState(false); // هل نحذف الغلاف الحالي؟
  const [newCoverFile, setNewCoverFile] = useState(null); // ملف الغلاف الجديد

  // --- إدارة صور المعرض ---
  const [imagesToDelete, setImagesToDelete] = useState([]); // IDs الصور المراد حذفها
  const [newFiles, setNewFiles] = useState([]); // ملفات المعرض الجديدة

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // معالجة اختيار صورة الغلاف (ملف واحد)
  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewCoverFile(e.target.files[0]);
      // إذا اختار غلاف جديد، نلغي تفعيل "حذف الغلاف" لأن الاستبدال يتضمن الحذف تلقائياً في الباك إند
      setDeleteCover(false);
    }
  };

  // معالجة اختيار صور المعرض (ملفات متعددة)
  const handleGalleryChange = (e) => {
    setNewFiles(Array.from(e.target.files));
  };

  // تحديد صور المعرض للحذف
  const toggleDeleteGalleryImage = (imageId) => {
    if (imagesToDelete.includes(imageId)) {
      setImagesToDelete(imagesToDelete.filter((id) => id !== imageId));
    } else {
      setImagesToDelete([...imagesToDelete, imageId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();

    // 1. البيانات النصية
    data.append("title", formData.title);
    data.append("description", formData.description);

    // 2. منطق صورة الغلاف
    // نرسل flag للباك إند يخبره بحذف الغلاف القديم إذا تم تحديده
    data.append("deleteCover", deleteCover);

    if (newCoverFile) {
      data.append("coverImage", newCoverFile); // الاسم 'coverImage' مهم للباك إند
    }

    // 3. منطق صور المعرض
    data.append("imagesToDelete", JSON.stringify(imagesToDelete));

    if (newFiles.length > 0) {
      newFiles.forEach((file) => {
        data.append("newImages", file); // الاسم 'newImages' مهم للباك إند
      });
    }

    onSave(item.id, data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Edit size={20} className="text-indigo-600" />
            تعديل المنتج
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="editForm" onSubmit={handleSubmit} className="space-y-6">
            {/* الحقول النصية */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان المنتج
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الوصف
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* --- قسم صورة الغلاف --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <IconImage size={18} className="text-indigo-500" />
                صورة الغلاف (Cover Image)
              </label>

              {item.cover_image && !deleteCover && !newCoverFile ? (
                // الحالة 1: يوجد غلاف حالي
                <div className="relative w-full sm:w-1/2 aspect-video rounded-xl overflow-hidden border-2 border-indigo-100 group shadow-sm">
                  <img
                    src={`http://localhost:5050/uploads/${item.cover_image}`}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                  {/* زر الحذف */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setDeleteCover(true)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg"
                    >
                      <Trash2 size={18} />
                      حذف الغلاف
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md">
                    الغلاف الحالي
                  </div>
                </div>
              ) : (
                // الحالة 2: لا يوجد غلاف، أو تم حذفه، أو جاري استبداله
                <div className="relative w-full sm:w-1/2">
                  {deleteCover && !newCoverFile && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                      <Trash2 size={14} />
                      تم تحديد الغلاف الحالي للحذف.
                      <button
                        type="button"
                        onClick={() => setDeleteCover(false)}
                        className="underline font-bold mr-auto"
                      >
                        تراجع
                      </button>
                    </div>
                  )}

                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div
                      className={`flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed rounded-xl transition-colors ${
                        newCoverFile
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      {newCoverFile ? (
                        <div className="text-green-600 flex flex-col items-center animate-fadeIn">
                          <CheckCircle size={32} className="mb-2" />
                          <span className="text-sm font-bold text-gray-800">
                            {newCoverFile.name}
                          </span>
                          <span className="text-xs mt-1">
                            سيتم تعيين هذه الصورة كغلاف جديد
                          </span>
                        </div>
                      ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                          <UploadCloud size={32} className="mb-2" />
                          <span className="text-sm font-medium">
                            اضغط لرفع غلاف جديد
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* --- قسم صور المعرض (Gallery) --- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                صور المعرض (Gallery)
                <span className="text-xs font-normal text-gray-500 mr-2">
                  (اضغط على الصورة لتحديدها للحذف)
                </span>
              </label>

              {/* عرض الصور الحالية */}
              {item.images && item.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {item.images.map((img) => {
                    const isSelectedForDelete = imagesToDelete.includes(img.id);
                    return (
                      <div
                        key={img.id}
                        onClick={() => toggleDeleteGalleryImage(img.id)}
                        className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square ${
                          isSelectedForDelete
                            ? "border-red-500 opacity-60 scale-95"
                            : "border-gray-100 hover:border-indigo-300"
                        }`}
                      >
                        <img
                          src={`http://localhost:5050/uploads/${img.image_path}`}
                          alt="gallery item"
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay Icon */}
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                            isSelectedForDelete
                              ? "bg-red-500/20 opacity-100"
                              : "bg-black/40 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          <Trash2
                            className={
                              isSelectedForDelete
                                ? "text-red-600 fill-white"
                                : "text-white"
                            }
                            size={24}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-sm mb-4">
                  لا توجد صور إضافية في المعرض
                </div>
              )}

              {/* رفع صور إضافية */}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center px-4 py-4 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors text-indigo-600">
                  <div className="flex items-center gap-2">
                    <UploadCloud size={20} />
                    <span className="font-medium text-sm">
                      إضافة صور للمعرض
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-400 mt-1">
                    {newFiles.length > 0
                      ? `تم اختيار ${newFiles.length} ملفات`
                      : "يمكنك اختيار صور متعددة"}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="editForm"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95"
          >
            حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. المكون الرئيسي (AdminItems)
// ==========================================
function AdminItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api } = useAuth();

  // حالة نافذة التعديل (Form Modal)
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });

  // حالة النافذة المنبثقة العامة (Alert/Confirm Modal)
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "confirm", // 'confirm', 'success', 'error', 'delete'
    title: "",
    message: "",
    onConfirm: null,
  });

  // --- دوال التحكم في الـ Popup ---
  const closePopup = () => setPopup((prev) => ({ ...prev, isOpen: false }));

  const showSuccess = (msg) => {
    setPopup({
      isOpen: true,
      type: "success",
      title: "تم بنجاح",
      message: msg,
      onConfirm: null,
    });
  };

  const showError = (msg) => {
    setPopup({
      isOpen: true,
      type: "error",
      title: "خطأ",
      message: msg,
      onConfirm: null,
    });
  };

  // --- دوال الـ API ---
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

  useEffect(() => {
    fetchItems();
  }, []);

  // زر الحذف (يفتح البوب اب)
  const handleDeleteClick = (itemId) => {
    setPopup({
      isOpen: true,
      type: "delete",
      title: "حذف المنتج",
      message:
        "هل أنت متأكد تماماً أنك تريد حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/items/${itemId}`);
          setItems((prev) => prev.filter((item) => item.id !== itemId));
          closePopup();
          setTimeout(() => showSuccess("تم حذف المنتج بنجاح"), 300);
        } catch (err) {
          closePopup();
          setTimeout(
            () => showError(err.response?.data?.error || err.message),
            300
          );
        }
      },
    });
  };

  // زر التعديل (يفتح نافذة التعديل)
  const handleEditClick = (item) => {
    setEditModal({ isOpen: true, item: item });
  };

  // عملية الحفظ القادمة من نافذة التعديل
  const handleSaveItem = async (itemId, formData) => {
    try {
      // إرسال البيانات للباك إند
      // ملاحظة: تأكد من أن الـ Header: 'Content-Type': 'multipart/form-data' يتم التعامل معه تلقائياً بواسطة Axios عند إرسال FormData
      const response = await api.put(`/admin/items/${itemId}`, formData);

      setEditModal({ isOpen: false, item: null }); // إغلاق نافذة التعديل
      fetchItems(); // تحديث الجدول لجلب البيانات والصور الجديدة
      showSuccess(response.data.message); // إظهار رسالة النجاح
    } catch (err) {
      setEditModal({ isOpen: false, item: null });
      setTimeout(
        () => showError(err.response?.data?.error || err.message),
        300
      );
    }
  };

  if (loading) return <p className="text-center p-8">جاري تحميل المنتجات...</p>;
  if (error) return <p className="text-red-600 text-center p-8">{error}</p>;

  return (
    <div className="min-h-screen">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">إدارة المنتجات</h1>

      {/* جدول المنتجات */}
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
                المالك
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      {item.cover_image ? (
                        <img
                          src={`http://localhost:5050/uploads/${item.cover_image}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-full h-full p-2 text-gray-400" />
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {item.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 max-w-[200px] truncate">
                    {item.description || "لا يوجد وصف"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                    {item.owner?.name || "غير معروف"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                    >
                      <Edit size={16} /> تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={16} /> حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========================================================= */}
      {/* 1. نافذة التعديل (Edit Modal) */}
      {/* ========================================================= */}
      {editModal.isOpen && editModal.item && (
        <EditItemModal
          item={editModal.item}
          onClose={() => setEditModal({ isOpen: false, item: null })}
          onSave={handleSaveItem}
        />
      )}

      {/* ========================================================= */}
      {/* 2. نافذة التنبيهات (General Popup) */}
      {/* ========================================================= */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
            {/* Header Icon */}
            <div
              className={`p-6 flex flex-col items-center text-center space-y-4 ${
                popup.type === "delete" || popup.type === "error"
                  ? "bg-red-50"
                  : popup.type === "success"
                  ? "bg-green-50"
                  : "bg-blue-50"
              }`}
            >
              {popup.type === "delete" && (
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                  <Trash2 size={32} />
                </div>
              )}
              {popup.type === "error" && (
                <div className="p-3 bg-red-100 rounded-full text-red-600">
                  <AlertCircle size={32} />
                </div>
              )}
              {popup.type === "success" && (
                <div className="p-3 bg-green-100 rounded-full text-green-600">
                  <CheckCircle size={32} />
                </div>
              )}
              {popup.type === "confirm" && (
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <AlertTriangle size={32} />
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">{popup.title}</h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 text-center mb-6">{popup.message}</p>

              {/* Buttons */}
              <div className="flex gap-3 justify-center">
                {popup.type === "confirm" || popup.type === "delete" ? (
                  <>
                    <button
                      onClick={closePopup}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={popup.onConfirm}
                      className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg active:scale-95 ${
                        popup.type === "delete"
                          ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                          : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                      }`}
                    >
                      {popup.type === "delete" ? "نعم، حذف" : "تأكيد"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closePopup}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 w-full"
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

export default AdminItems;
