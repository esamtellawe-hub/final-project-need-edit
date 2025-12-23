// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";
// import { useAuth } from "../context/AuthContext";

// import {
//   MessageCircle,
//   Phone,
//   MapPin,
//   Share2,
//   CheckCircle2,
//   Heart,
//   Tag,
// } from "lucide-react";

// const Details = () => {
//   const { id } = useParams();
//   const { t, i18n } = useTranslation();
//   const navigate = useNavigate();
//   const { user, token } = useAuth();

//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(false);
//   const [selectedImage, setSelectedImage] = useState(null);
//   const [isFavorite, setIsFavorite] = useState(false);

//   const isRTL = i18n.language === "ar";

//   useEffect(() => {
//     window.scrollTo(0, 0);
//     setLoading(true);

//     // طباعة عشان تشوف في الكونسول (F12) شو عم بصير
//     console.log("Fetching details for ID:", id);

//     // 1. جلب تفاصيل المنتج
//     axios
//       .get(`http://localhost:5050/api/items/${id}`)
//       .then((res) => {
//         console.log("Data from server:", res.data); // تأكد شو راجع هنا

//         // التصحيح: بنحاول نجيب item، لو ما لقيناه بناخذ res.data كاملة (احتياطاً)
//         const fetchedItem = res.data.item || res.data;

//         // تأكدنا إن في بيانات للمنتج ولصاحب المنتج
//         if (fetchedItem && fetchedItem.title) {
//           setItem(fetchedItem);
//           setSelectedImage(fetchedItem.cover_image);
//         } else {
//           console.error("Item not found in response");
//           setError(true);
//         }
//       })
//       .catch((err) => {
//         console.error("Error fetching item:", err);
//         setError(true);
//       })
//       .finally(() => setLoading(false));

//     // 2. التحقق من المفضلة (فقط إذا المستخدم مسجل)
//     if (user && token) {
//       axios
//         .get("http://localhost:5050/api/favorites", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         .then((res) => {
//           if (Array.isArray(res.data)) {
//             const isFav = res.data.some((favItem) => favItem.id == id);
//             setIsFavorite(isFav);
//           }
//         })
//         .catch((err) => console.error("Error checking favorites:", err));
//     }
//   }, [id, user, token]);

//   // دالة الكبس على القلب
//   const toggleFavorite = async (e) => {
//     e.stopPropagation();

//     if (!user) {
//       navigate("/Login");
//       return;
//     }

//     const oldState = isFavorite;
//     setIsFavorite(!isFavorite); // تغيير فوري للشكل (UX)

//     try {
//       const res = await axios.post(
//         "http://localhost:5050/api/favorites/toggle",
//         { itemId: id },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setIsFavorite(res.data.isFavorite);
//     } catch (err) {
//       console.error("Failed to toggle favorite:", err);
//       setIsFavorite(oldState); // تراجع عند الخطأ
//     }
//   };

//   // شاشة التحميل
//   if (loading)
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
//       </div>
//     );

//   // شاشة الخطأ (إذا المنتج مش موجود)
//   if (error || !item)
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-gray-50">
//         <div className="text-red-500 text-6xl mb-4">⚠️</div>
//         <h2 className="text-2xl font-bold text-gray-800">
//           {t("details.errorLoading") || "عذراً، المنتج غير موجود أو تم حذفه"}
//         </h2>
//         <p className="text-gray-500 mt-2">ID: {id}</p>
//         <button
//           onClick={() => navigate("/")}
//           className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//         >
//           {t("common.goBack") || "العودة للرئيسية"}
//         </button>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-[#F8F9FA] pb-8" dir={isRTL ? "ltr" : "rtl"}>
//       {/* Header Navigation */}
//       <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
//         <button
//           onClick={() => navigate("/")}
//           className="hover:text-purple-600 transition"
//         >
//           {t("nav.home")}
//         </button>
//         <span>/</span>
//         <span className="font-medium text-gray-900 truncate max-w-[200px]">
//           {item.title}
//         </span>
//       </div>

//       <div className="max-w-7xl mx-auto px-4">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
//           {/* --- الجهة اليسرى: الصور --- */}
//           <div className="lg:col-span-7 top-4 h-fit z-10">
//             <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
//               {/* الصورة الكبيرة */}
//               <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
//                 <img
//                   src={`http://localhost:5050/uploads/${selectedImage}`}
//                   alt={item.title}
//                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                   onError={(e) =>
//                     (e.target.src =
//                       "https://via.placeholder.com/400x300?text=No+Image")
//                   }
//                 />
//               </div>

//               {/* أزرار التفاعل (القلب) */}
//               <div className="absolute top-4 right-4 flex gap-2">
//                 <button
//                   onClick={toggleFavorite}
//                   className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition backdrop-blur-sm group/heart cursor-pointer"
//                 >
//                   <Heart
//                     size={22}
//                     className={`transition-colors duration-300 ${
//                       isFavorite
//                         ? "fill-red-500 text-red-500"
//                         : "text-gray-600 group-hover/heart:text-red-500"
//                     }`}
//                   />
//                 </button>
//                 <button className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition backdrop-blur-sm">
//                   <Share2 size={22} className="text-gray-700" />
//                 </button>
//               </div>
//             </div>

//             {/* الصور المصغرة */}
//             {item.images && item.images.length > 0 && (
//               <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
//                 <div
//                   onClick={() => setSelectedImage(item.cover_image)}
//                   className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
//                     selectedImage === item.cover_image
//                       ? "border-purple-600 ring-2 ring-purple-100"
//                       : "border-transparent opacity-70 hover:opacity-100"
//                   }`}
//                 >
//                   <img
//                     src={`http://localhost:5050/uploads/${item.cover_image}`}
//                     className="w-full h-full object-cover"
//                     alt="thumbnail"
//                   />
//                 </div>
//                 {item.images.map((img) => (
//                   <div
//                     key={img.id}
//                     onClick={() => setSelectedImage(img.image_path)}
//                     className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
//                       selectedImage === img.image_path
//                         ? "border-purple-600 ring-2 ring-purple-100"
//                         : "border-transparent opacity-70 hover:opacity-100"
//                     }`}
//                   >
//                     <img
//                       src={`http://localhost:5050/uploads/${img.image_path}`}
//                       className="w-full h-full object-cover"
//                       alt="thumbnail"
//                     />
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* --- الجهة اليمنى: التفاصيل --- */}
//           <div className="lg:col-span-5 space-y-6">
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//               <h1 className="text-3xl font-bold text-gray-900 leading-tight">
//                 {item.title}
//               </h1>

//               <div className="mt-4 flex items-baseline gap-2">
//                 <span className="text-4xl font-extrabold text-purple-600">
//                   {item.price}
//                 </span>
//                 <span className="text-xl font-medium text-gray-500">
//                   {t("details.currency")}
//                 </span>
//               </div>

//               <div className="flex flex-wrap gap-2 mt-4">
//                 {item.category && (
//                   <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-purple-100">
//                     <Tag size={16} /> {item.category.category_name}
//                   </span>
//                 )}
//                 <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-green-100">
//                   <CheckCircle2 size={16} /> {t("details.sellAvailable")}
//                 </span>
//               </div>
//             </div>

//             {/* معلومات البائع */}
//             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-200 transition-colors">
//               <div className="flex items-center gap-4">
//                 <div className="relative">
//                   <img
//                     src={
//                       item.owner?.photo
//                         ? `http://localhost:5050/uploads/${item.owner.photo}`
//                         : "https://via.placeholder.com/150"
//                     }
//                     alt={item.owner?.name || "Owner"}
//                     className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
//                   />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-gray-900 text-lg">
//                     {item.owner?.name || t("details.unknownOwner")}
//                   </h3>
//                   <div className="flex items-center text-sm text-gray-500 gap-1">
//                     <MapPin size={14} />
//                     {item.owner?.location || t("details.locationUnknown")}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* الوصف */}
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//               <h3 className="text-lg font-bold text-gray-900 mb-3">
//                 {t("details.descriptionTitle")}
//               </h3>
//               <p className="text-gray-600 leading-relaxed whitespace-pre-line">
//                 {item.description}
//               </p>
//             </div>

//             {/* أزرار الإجراءات */}
//             <div className="flex gap-3 pt-2">
//               <button
//                 onClick={() =>
//                   navigate(`/chat/${item.owner.id}?itemId=${item.id}`)
//                 }
//                 className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 md:py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
//               >
//                 <MessageCircle size={20} />
//                 {t("details.message")}
//               </button>

//               <a
//                 href={`tel:${item.owner?.phone}`}
//                 className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold border-2 transition-all ${
//                   item.owner?.phone
//                     ? "border-green-600 text-green-600 hover:bg-green-50"
//                     : "border-gray-200 text-gray-400 cursor-not-allowed"
//                 }`}
//                 onClick={(e) => !item.owner?.phone && e.preventDefault()}
//               >
//                 <Phone size={20} />
//                 {t("details.callOwner")}
//               </a>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Details;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

import {
  MessageCircle,
  Phone,
  MapPin,
  Share2,
  CheckCircle2,
  Heart,
  Tag,
} from "lucide-react";

const Details = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const isRTL = i18n.language === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    // 1. جلب تفاصيل المنتج
    axios
      .get(`http://localhost:5050/api/items/${id}`)
      .then((res) => {
        // حماية: بنحاول نجيب item، لو ما لقيناه بناخذ الداتا كلها
        const fetchedItem = res.data.item || res.data;

        if (fetchedItem) {
          setItem(fetchedItem);
          setSelectedImage(fetchedItem.cover_image);
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching item:", err);
        setError(true);
      })
      .finally(() => setLoading(false));

    // 2. التحقق من المفضلة (رجعنا الكود بناءً على طلبك)
    // هذا الكود رح يشتغل بس إذا المستخدم مسجل دخول
    if (user && token) {
      axios
        .get("http://localhost:5050/api/favorites", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (Array.isArray(res.data)) {
            // فحص هل المنتج الحالي موجود في قائمة المفضلة
            const isFav = res.data.some((favItem) => favItem.id == id);
            setIsFavorite(isFav);
          }
        })
        .catch((err) => {
          // إذا السيرفر رجع Error 500، رح نطبع الخطأ في الكونسول بس ما رح نوقف الصفحة
          console.warn("Favorites check failed (Server Error 500):", err);
          // القلب رح يضل سكني (false) لحد ما تتصلح مشكلة السيرفر
        });
    }
  }, [id, user, token]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/Login");
      return;
    }

    // تغيير سريع للشكل (UX)
    const oldState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      const res = await axios.post(
        "http://localhost:5050/api/favorites/toggle",
        { itemId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // اعتماد رد السيرفر
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setIsFavorite(oldState); // تراجع عند الخطأ
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );

  if (error || !item)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("details.errorLoading") || "المنتج غير موجود"}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-purple-600 hover:underline"
        >
          {t("common.goBack")}
        </button>
      </div>
    );

  // تجهيز بيانات المالك (حماية من الكراش)
  const ownerName = item.owner?.name || t("details.unknownUser") || "User";
  const ownerLocation =
    item.owner?.location || t("details.locationUnknown") || "Unknown";
  const ownerPhone = item.owner?.phone || "";
  const ownerPhoto = item.owner?.photo
    ? `http://localhost:5050/uploads/${item.owner.photo}`
    : "https://via.placeholder.com/150";

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-8" dir={isRTL ? "ltr" : "rtl"}>
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate("/")} className="hover:text-purple-600">
          {t("nav.home")}
        </button>
        <span>/</span>
        <span className="font-medium text-gray-900 truncate max-w-[200px]">
          {item.title}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* --- Images --- */}
          <div className="lg:col-span-7 top-4 h-fit z-10">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img
                  src={`http://localhost:5050/uploads/${selectedImage}`}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/600x400?text=No+Image")
                  }
                />
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition backdrop-blur-sm group/heart cursor-pointer"
                >
                  <Heart
                    size={22}
                    className={`transition-colors duration-300 ${
                      isFavorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600 group-hover/heart:text-red-500"
                    }`}
                  />
                </button>
                <button className="bg-white/90 p-2.5 rounded-full shadow-lg hover:bg-white transition backdrop-blur-sm">
                  <Share2 size={22} className="text-gray-700" />
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            {item.images && item.images.length > 0 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                <div
                  onClick={() => setSelectedImage(item.cover_image)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedImage === item.cover_image
                      ? "border-purple-600 ring-2 ring-purple-100"
                      : "border-transparent opacity-70"
                  }`}
                >
                  <img
                    src={`http://localhost:5050/uploads/${item.cover_image}`}
                    className="w-full h-full object-cover"
                    alt="thumbnail"
                  />
                </div>
                {item.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img.image_path)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedImage === img.image_path
                        ? "border-purple-600 ring-2 ring-purple-100"
                        : "border-transparent opacity-70"
                    }`}
                  >
                    <img
                      src={`http://localhost:5050/uploads/${img.image_path}`}
                      className="w-full h-full object-cover"
                      alt="thumbnail"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- Details --- */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                {item.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-purple-600">
                  {item.price}
                </span>
                <span className="text-xl font-medium text-gray-500">
                  {t("details.currency")}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {item.category && (
                  <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-purple-100">
                    <Tag size={16} /> {item.category.category_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-green-100">
                  <CheckCircle2 size={16} /> {t("details.sellAvailable")}
                </span>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={ownerPhoto}
                    alt={ownerName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {ownerName}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 gap-1">
                    <MapPin size={14} />
                    {ownerLocation}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {t("details.descriptionTitle")}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  navigate(
                    `/chat/${item.owner?.id || item.user_id}?itemId=${item.id}`
                  )
                }
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 md:py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                {t("details.message")}
              </button>

              <a
                href={`tel:${ownerPhone}`}
                className={`flex-1 flex items-center justify-center gap-2 py-3 md:py-4 rounded-xl font-bold border-2 transition-all ${
                  ownerPhone
                    ? "border-green-600 text-green-600 hover:bg-green-50"
                    : "border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                onClick={(e) => !ownerPhone && e.preventDefault()}
              >
                <Phone size={20} />
                {t("details.callOwner")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
