const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // 👇👇👇 طباعة كل الهيدرز عشان نشوف شو وصل للسيرفر
  console.log("🔹 1. Incoming Request Headers:", req.headers);

  const authHeader = req.headers.authorization || req.headers.Authorization;

  // 👇👇👇 هل وصل الهيدر؟
  console.log("🔹 2. Auth Header Found:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No Bearer token found in header");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("🔹 3. Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, "mySuperSecretKey123");
    req.user = decoded;
    console.log("✅ Token Verified Successfully for user:", decoded.id);
    next();
  } catch (err) {
    console.error("❌ Token Verification Failed:", err.message);
    return res.status(403).json({ error: "Invalid Token" });
  }
};

module.exports = verifyToken;
