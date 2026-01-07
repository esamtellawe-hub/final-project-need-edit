require("dotenv").config(); 
const express = require("express");
const http = require("http");  
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");  
const dotenv = require("dotenv");
// Routes
const messageRoutes = require("./routes/messages");
const contactRoutes = require("./routes/contact"); 
const itemRoutes = require("./routes/items");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const favoriteRoutes = require("./routes/favorites");
const app = express();
const server = http.createServer(app); 

// إعداد Socket.io مع CORS (مهم جداً عشان الفرونت إند يشبك)
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/contact", contactRoutes); 
app.use("/api/items", itemRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/favorites", favoriteRoutes);  
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
