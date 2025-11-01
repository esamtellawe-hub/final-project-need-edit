const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const { sequelize } = require("./models");

const usersRoutes = require("./routes/users");
const itemsRoutes = require("./routes/items");
const messagesRoutes = require("./routes/messages");
const adminRoutes = require("./routes/adminRoutes"); // (موجود مسبقاً)
const upload = require("./middleware/upload");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // (السوكت ما زال للفرونت إند فقط حالياً)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ إعداد Socket.io
require("./socket")(io);

const PORT = process.env.PORT || 5050;

// ---------------------------------
// ✅ --- (هنا التعديل) --- ✅
// ---------------------------------
// 1. تعريف المصادر المسموح لها
const allowedOrigins = [
  "http://localhost:5173", // (الفرونت إند لليوزر)
  "http://localhost:5174", // (الفرونت إند للـ CMS)
];

// 2. إعداد CORS الديناميكي
app.use(
  cors({
    origin: function (origin, callback) {
      // السماح بالطلبات التي لا تحتوي على origin (مثل Postman)
      // أو الطلبات الموجودة في القائمة المسموحة
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.options("*", cors()); // السماح بالـ pre-flight requests

// (تم حذف كود app.use(res.header...) القديم لأنه مكرر وغير ضروري الآن)
// ---------------------------------
// ✅ --- (نهاية التعديل) --- ✅
// ---------------------------------

app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("🚀 Backend is running with Socket.io!");
});

// ✅ ربط الراوترات
app.use("/api/users", usersRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/admin", adminRoutes);

// ✅ تشغيل السيرفر بعد مزامنة قاعدة البيانات
sequelize
  .sync()
  .then(() => {
    console.log("📦 Database synced");
    server.listen(PORT, () => {
      console.log(`✅ Server + Socket.io listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Sync error:", err);
  });
