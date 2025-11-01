const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // استخراج التوكن من الهيدر: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "توكن غير موجود، الوصول مرفوض" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // نضيف بيانات المستخدم للطلب
    next(); // السماح بالوصول للراوتر
  } catch (err) {
    console.error("❌ توكن غير صالح:", err);
    return res.status(403).json({ error: "توكن غير صالح أو منتهي" });
  }
};

module.exports = verifyToken;
