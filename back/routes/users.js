const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

// 🔒 دالة مساعدة للتحقق من قوة كلمة المرور
// الشروط: 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، رمز خاص
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

// رسالة الخطأ الموحدة
const passwordErrorMessage =
  "كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف كبير (A-Z)، حرف صغير (a-z)، رقم (0-9)، ورمز خاص (@, $, !, الخ).";

// ✅ تسجيل مستخدم جديد
router.post("/register", upload.single("photo"), async (req, res) => {
  const { name, email, password, phone, location } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "الاسم والبريد وكلمة المرور مطلوبة" });
    }

    // 🔒 التحقق من قوة كلمة المرور عند التسجيل
    if (!validatePassword(password)) {
      return res.status(400).json({ error: passwordErrorMessage });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "البريد مستخدم مسبقًا" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location,
      photo,
    });

    res.status(201).json({ message: "تم التسجيل بنجاح", user: newUser });
  } catch (err) {
    console.error("❌ خطأ في التسجيل:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// ✅ تسجيل الدخول
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "يرجى إدخال البريد وكلمة المرور" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      name: user.name,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      message: "تم تسجيل الدخول",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
        phone: user.phone,
        location: user.location,
      },
    });
  } catch (err) {
    console.error("❌ خطأ في تسجيل الدخول:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// ✅ جلب بيانات مستخدم معين (GET)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    res.json({ user });
  } catch (err) {
    console.error("❌ خطأ في جلب بيانات المستخدم:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// ✅ تعديل بيانات المستخدم
router.put("/:id", upload.single("photo"), async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, location, password } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    let updateData = {
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      location: location || user.location,
      photo: photo || user.photo,
    };

    // 🔒 إذا تم إرسال كلمة مرور جديدة، نتحقق منها أولاً ثم نشفرها
    if (password && password.trim() !== "") {
      // التحقق من القوة
      if (!validatePassword(password)) {
        return res.status(400).json({ error: passwordErrorMessage });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    await user.update(updateData);

    // إرجاع البيانات بدون الباسورد
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({ message: "تم تحديث البيانات", user: userResponse });
  } catch (err) {
    console.error("❌ خطأ في تعديل البيانات:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

module.exports = router;
