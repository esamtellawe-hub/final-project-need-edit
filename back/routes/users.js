const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // <-- 1. إضافة المكتبة
const { User } = require("../models");

// ✅ تسجيل مستخدم جديد (آمن)
router.post("/register", upload.single("photo"), async (req, res) => {
  // 2. حذفنا 'role' من هنا (لا نسمح للمستخدم بتحديدها)
  const { name, email, password, phone, location } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ error: "الاسم والبريد وكلمة المرور مطلوبة" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "البريد مستخدم مسبقًا" });
    }

    // 3. تجزئة (Hashing) كلمة السر قبل حفظها
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // 4. حفظ كلمة السر المجزأة
      phone,
      location,
      photo,
      // 'role' سيتم تعيينه تلقائياً إلى 'user' (من الموديل)
    });

    res.status(201).json({ message: "تم التسجيل بنجاح", user: newUser });
  } catch (err) {
    console.error("❌ خطأ في التسجيل:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// ✅ تسجيل الدخول (آمن)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "يرجى إدخال البريد وكلمة المرور" });
    }

    // 5. البحث بالإيميل فقط
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // 6. مقارنة كلمة السر المدخلة بكلمة السر المجزأة في الداتا بيس
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
    }

    // 7. (الحل الذي كنا نبحث عنه)
    // إضافة 'role' و 'name' (اختياري) للتوكن
    const tokenPayload = {
      id: user.id,
      role: user.role,
      name: user.name, // مفيد لعرضه في النافبار
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 8. لا نرسل كل بيانات المستخدم، فقط ما يحتاجه الفرونت
    res.json({
      message: "تم تسجيل الدخول",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ خطأ في تسجيل الدخول:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// ✅ تعديل بيانات المستخدم
// (ملاحظة: هذا الكود يسمح للمستخدم بتعديل بياناته فقط إذا مرر الـ ID الخاص به)
// (سنحتاج لإضافة حارس 'verifyToken' هنا لاحقاً لتأمينها)
router.put("/:id", upload.single("photo"), async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, location } = req.body;
  const photo = req.file ? req.file.filename : null;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    // (ملاحظة: يجب إضافة لوجيك للتأكد أن المستخدم لا يعدل بروفايل شخص آخر)

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
      location: location || user.location,
      photo: photo || user.photo,
    });

    res.json({ message: "تم تحديث البيانات", user });
  } catch (err) {
    console.error("❌ خطأ في تعديل البيانات:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

module.exports = router;
