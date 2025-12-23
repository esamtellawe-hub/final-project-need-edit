const express = require("express");
const router = express.Router();
const fs = require("fs"); // مهم لحذف الملفات القديمة (اختياري)
const path = require("path");

// استيراد الموديلات
const { User, Item, ItemImage } = require("../models");

// استيراد أدوات الرفع والحماية
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/verifyToken");
const { isAdmin } = require("../middleware/adminMiddleware");

// ==========================================
// 📊 1. إحصائيات النظام (Dashboard Stats)
// ==========================================
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const usersCount = await User.count();
    const productsCount = await Item.count();
    const adminsCount = await User.count({ where: { role: "admin" } });

    res.json({
      usersCount,
      productsCount,
      adminsCount,
    });
  } catch (err) {
    console.error("❌ خطأ في جلب الإحصائيات:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// ==========================================
// 👥 2. إدارة المستخدمين (Users Management)
// ==========================================

/**
 * جلب قائمة جميع المستخدمين
 */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    res.json(users);
  } catch (err) {
    console.error("❌ خطأ في جلب المستخدمين:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/**
 * ترقية أو تخفيض صلاحية مستخدم
 */
router.put(
  "/users/:id/toggle-admin",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userToToggle = await User.findByPk(id);

      if (!userToToggle) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      if (userToToggle.id === req.user.id) {
        return res.status(400).json({ error: "لا يمكنك تغيير صلاحيات نفسك" });
      }

      const newRole = userToToggle.role === "admin" ? "user" : "admin";
      userToToggle.role = newRole;
      await userToToggle.save();

      res.json({
        message: `تم تحديث صلاحية ${userToToggle.name} إلى ${newRole}`,
        user: userToToggle,
      });
    } catch (err) {
      console.error("❌ خطأ في تغيير الصلاحية:", err);
      res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }
);

/**
 * حذف مستخدم
 */
router.delete("/users/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "لا يمكنك حذف حسابك الحالي" });
    }

    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    res.status(200).json({ message: "تم حذف المستخدم بنجاح" });
  } catch (err) {
    console.error("❌ خطأ في حذف المستخدم:", err);
    res.status(500).json({ error: "فشل في حذف المستخدم" });
  }
});

// ==========================================
// 📦 3. إدارة المنتجات (Items Management)
// ==========================================

/**
 * جلب جميع المنتجات
 */
router.get("/items", verifyToken, isAdmin, async (req, res) => {
  try {
    const items = await Item.findAll({
      // ✅ أضفت cover_image عشان تظهر في الجدول
      attributes: [
        "id",
        "title",
        "description",
        "created_at",
        "price",
        "cover_image",
      ],
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "email"],
        },
        {
          model: ItemImage,
          as: "images",
          attributes: ["id", "image_path"],
        },
      ],
    });
    res.json(items);
  } catch (err) {
    console.error("❌ خطأ في جلب المنتجات:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/**
 * حذف منتج
 */
router.delete("/items/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await ItemImage.destroy({ where: { item_id: id } });
    const deleted = await Item.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: "المنتج غير موجود" });
    }

    res.json({ message: "تم حذف المنتج وما يتعلق به من صور" });
  } catch (err) {
    console.error("❌ خطأ في حذف المنتج:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/**
 * ✏️ تعديل منتج (بيانات + صورة غلاف + صور معرض)
 * استخدام upload.fields لاستقبال عدة حقول ملفات
 */
router.put(
  "/items/:id",
  verifyToken,
  isAdmin,
  // ✅ التعديل الجوهري هنا:
  upload.fields([
    { name: "coverImage", maxCount: 1 }, // لاستقبال صورة الغلاف
    { name: "newImages", maxCount: 5 }, // لاستقبال صور المعرض
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, imagesToDelete, deleteCover } = req.body;

      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }

      // 1. تحديث النصوص
      if (title) item.title = title;
      if (description) item.description = description;

      // 2. منطق صورة الغلاف (Cover Image)
      // أ) إذا تم رفع صورة غلاف جديدة
      if (req.files && req.files["coverImage"]) {
        // (اختياري: حذف الصورة القديمة من المجلد)
        // if (item.cover_image) { try { fs.unlinkSync(path.join(__dirname, '../uploads', item.cover_image)); } catch(e){} }

        item.cover_image = req.files["coverImage"][0].filename;
      }
      // ب) إذا لم يتم رفع صورة، ولكن تم طلب الحذف
      else if (deleteCover === "true") {
        item.cover_image = null;
      }

      await item.save();

      // 3. حذف صور المعرض المحددة
      if (imagesToDelete) {
        const idsToDelete = JSON.parse(imagesToDelete);
        if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
          await ItemImage.destroy({
            where: {
              id: idsToDelete,
              item_id: id,
            },
          });
        }
      }

      // 4. إضافة صور المعرض الجديدة
      if (req.files && req.files["newImages"]) {
        const newImagesData = req.files["newImages"].map((file) => ({
          image_path: file.filename,
          item_id: id,
        }));
        await ItemImage.bulkCreate(newImagesData);
      }

      res.json({ message: "تم تحديث المنتج بنجاح" });
    } catch (err) {
      console.error("❌ خطأ في تعديل المنتج:", err);
      res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }
);

module.exports = router;
