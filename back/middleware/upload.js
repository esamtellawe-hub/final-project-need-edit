const multer = require("multer");
const path = require("path");

// إعداد التخزين
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // مجلد الصور
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// إنشاء الـ middleware
const upload = multer({ storage });

module.exports = upload;
