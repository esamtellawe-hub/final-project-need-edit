import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import DefaultPhoto from "../../public/images/profile.jpeg";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { t } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const [formData, setFormData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [myItems, setMyItems] = useState([]);

  useEffect(() => {
    if (!loggedUser) {
      setError(t("profile.noUser"));
      return;
    }
    setFormData(loggedUser);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/Login");
    } else {
      axios
        .get(`http://localhost:5050/api/items/user/${user.id}`)
        .then((res) => setMyItems(res.data.items))
        .catch((err) => {
          console.error("❌ خطأ في جلب منتجات المستخدم:", err);
        });
    }
  }, [user]);

  const handleEditProfile = () => setShowForm(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        photo: imageUrl,
        newPhoto: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("location", formData.location);
    if (formData.newPhoto) {
      data.append("photo", formData.newPhoto);
    }

    try {
      const res = await axios.put(
        `http://localhost:5050/api/users/${formData.id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setFormData(res.data.user);
        setShowForm(false);
      }
    } catch (err) {
      console.error("خطأ في التعديل:", err);
      setError("فشل تعديل البيانات");
    }
  };

  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;
  if (!formData)
    return <p className="text-center mt-10">{t("profile.loading")}</p>;
  return (
    <section className={`py-10 px-4 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* الملف الشخصي */}
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="relative inline-block mb-4">
            <img
              src={
                formData.photo?.startsWith("blob:")
                  ? formData.photo
                  : formData.photo
                  ? `http://localhost:5050/uploads/${formData.photo}`
                  : DefaultPhoto
              }
              onError={(e) => (e.target.src = DefaultPhoto)}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover mx-auto"
            />
            <button
              onClick={handleEditProfile}
              className="absolute top-0 right-0 bg-white p-2 rounded-full shadow hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#dc3545]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15H9v-2z"
                />
              </svg>
            </button>
          </div>

          <h3 className="text-xl font-semibold">{formData.name}</h3>
          <p className="text-sm text-gray-500">{t("profile.memberSince")}</p>

          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <h6 className="text-lg font-bold">120</h6>
              <p className="text-sm text-gray-500">{t("profile.followers")}</p>
            </div>
            <div className="text-center">
              <h6 className="text-lg font-bold">85</h6>
              <p className="text-sm text-gray-500">{t("profile.following")}</p>
            </div>
          </div>

          <ul className="mt-6 space-y-2 text-left mx-auto max-w-xs text-gray-700 text-sm">
            <li>
              {t("profile.email")}: {formData.email}
            </li>
            <li>
              {t("profile.phone")}: {formData.phone}
            </li>
            <li>
              {t("profile.location")}: {formData.location}
            </li>
            <li>{t("profile.rating")}: 4.5/5</li>
          </ul>

          <button
            onClick={() => {
              logout();
              navigate("/Login");
            }}
            className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            {t("profile.logout")}
          </button>
        </div>

        {/* المحتوى الجانبي */}
        <div className="lg:col-span-2 space-y-6">
          {showForm && (
            <div className="bg-gray-50 p-6 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-4 text-[#dc3545]">
                {t("profile.editTitle")}
              </h4>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Input
                  label={t("profile.name")}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <Input
                  label={t("profile.emailLabel")}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  label={t("profile.phoneLabel")}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Input
                  label={t("profile.locationLabel")}
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    {t("profile.photoLabel")}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
                  />
                </div>
                <div className="col-span-2 text-end mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                  >
                    {t("profile.save")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Swap Items */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4 text-blue-600">
              {t("profile.swapTitle")}
            </h4>
            <div
              id="swap-items"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {myItems.length === 0 ? (
                <p className="text-gray-500">{t("profile.noItems")}</p>
              ) : (
                myItems.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded p-3 shadow relative"
                  >
                    <img
                      src={`http://localhost:5050/uploads/${item.cover_image}`}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                    <h5 className="text-lg font-semibold">{item.title}</h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-[#dc3545] font-bold mt-1">
                      {item.price} د.أ
                    </p>

                    {/* زر تعديل المنتج */}
                    <button
                      onClick={() => navigate(`/edit/${item.id}`)}
                      className="absolute top-2 right-2 bg-white border border-[#dc3545] text-[#dc3545] px-2 py-1 rounded text-sm hover:bg-[#dc3545] hover:text-white transition"
                    >
                      {t("profile.editItem")}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Input = ({ label, name, value, onChange }) => (
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#dc3545]"
    />
  </div>
);

export default Profile;
