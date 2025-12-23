require("dotenv").config(); // 👈 لازم يكون أول سطر
const express = require("express");
const http = require("http"); // ضروري للسوكت
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const db = require("./config/db"); // تأكد من المسار
const dotenv = require("dotenv");
// Routes
const messageRoutes = require("./routes/messages");
const contactRoutes = require("./routes/contact"); // ✅ تمت الإضافة: استدعاء ملف الكونتاكت
const itemRoutes = require("./routes/items");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const favoriteRoutes = require("./routes/favorites"); // استدعاء ملف المفضلات
const app = express();
const server = http.createServer(app); // ربط express بـ http server

// إعداد Socket.io مع CORS (مهم جداً عشان الفرونت إند يشبك)
const io = socketIo(server, {
  cors: {
    origin: "*", // أو رابط الفرونت إند "http://localhost:3000"
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // لصور المنتجات

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/contact", contactRoutes); // ✅ تمت الإضافة: تفعيل رابط الكونتاكت
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/favorites", favoriteRoutes); // ✅ تمت الإضافة: تفعيل رابط المفضلات
// تشغيل منطق السوكت
require("./socket")(io);

// تشغيل السيرفر
const PORT = process.env.PORT || 5050;

db.sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });
