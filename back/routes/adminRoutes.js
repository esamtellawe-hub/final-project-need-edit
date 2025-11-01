const express = require("express");
const router = express.Router();
// (تأكد من استيراد كل الموديلات و 'upload')
const { User, Item, ItemImage } = require("../models");
const upload = require("../middleware/upload");

// استيراد الحراس (Middlewares)
const verifyToken = require("../middleware/verifyToken");
const { isAdmin } = require("../middleware/adminMiddleware");

/**
 * -------------------------------------------
 * 📊 [GET] /api/admin/stats
 * -------------------------------------------
 * جلب إحصائيات الداشبورد (للآدمن فقط)
 */
router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    // 1. إحضار عدد المستخدمين الكلي
    const usersCount = await User.count();
    // 2. إحضار عدد المنتجات الكلي
    const productsCount = await Item.count(); // (استخدام موديل 'Item')
    // 3. إحضار عدد الآدمنز
    const adminsCount = await User.count({
      where: { role: "admin" },
    });

    res.json({
      usersCount,
      productsCount,
      adminsCount,
    });
  } catch (err) {
    console.error("❌ خطأ في جلب إحصائيات الآدمن:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/**
 * -------------------------------------------
 * 👥 [GET] /api/admin/users
 * -------------------------------------------
 * جلب قائمة جميع المستخدمين (للآدمن فقط)
 */
router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] }, // لا ترسل كلمة السر
    });
    res.json(users);
  } catch (err) {
    console.error("❌ خطأ في جلب المستخدمين:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/**
 * -------------------------------------------
 * 👑 [PUT] /api/admin/users/:id/toggle-admin
 * -------------------------------------------
 * ترقية/تخفيض مستخدم (للآدمن فقط)
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

      // لا تسمح للآدمن بتغيير صلاحياته بنفسه
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
      console.error("❌ خطأ في تبديل صلاحية المستخدم:", err);
      res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }
);

/**
 * -------------------------------------------
 * 📦 [GET] /api/admin/items
 * -------------------------------------------
 * جلب جميع المنتجات مع (كل) صورها (للآدمن فقط)
 */
router.get("/items", verifyToken, isAdmin, async (req, res) => {
  try {
    const items = await Item.findAll({
      // (تأكدنا من جلب البيانات الأساسية للمنتج)
      attributes: ["id", "title", "description", "created_at"],
      include: [
        {
          model: User,
          as: "owner", // (الاسم المستعار للعلاقة)
          attributes: ["id", "name", "email"],
        },
        {
          model: ItemImage,
          as: "images", // (الاسم المستعار للعلاقة)
          attributes: ["id", "image_path"], // (جلب ID الصورة للتمكن من حذفها)
        },
      ],
    });
    res.json(items);
  } catch (err) {
    console.error("❌ خطأ في جلب المنتجات للآدمن:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/**
 * -------------------------------------------
 * 🗑️ [DELETE] /api/admin/items/:id
 * -------------------------------------------
 * حذف أي منتج وكل صوره المرتبطة به (للآدمن فقط)
 */
router.delete("/items/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    // (يفضل حذف الصور أولاً ثم المنتج)
    await ItemImage.destroy({ where: { item_id: id } });
    await Item.destroy({ where: { id: id } }); // (تأكد من أن الشرط صحيح)
    res.json({ message: "تم حذف المنتج وما يتعلق به من صور" });
  } catch (err) {
    console.error("❌ خطأ في حذف المنتج:", err);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/**
 * -------------------------------------------
 * ✏️ [PUT] /api/admin/items/:id
 * -------------------------------------------
 * تعديل أي منتج (نص + صور) (للآدمن فقط)
 * يستقبل (FormData)
 */
router.put(
  "/items/:id",
  verifyToken,
  isAdmin,
  upload.array("newImages", 5), // (استخدام Multer لاستقبال 5 صور جديدة)
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, imagesToDelete } = req.body;

      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }

      // 1. تحديث البيانات النصية
      item.title = title || item.title;
      item.description = description || item.description;
      await item.save();

      // 2. حذف الصور المطلوبة
      if (imagesToDelete) {
        const idsToDelete = JSON.parse(imagesToDelete); // (تأتي كـ "[1, 2, 3]")
        if (Array.isArray(idsToDelete) && idsToDelete.length > 0) {
          await ItemImage.destroy({
            where: {
              id: idsToDelete,
              item_id: id,
            },
          });
          // (ملاحظة: يمكنك إضافة كود لحذف الملفات من السيرفر 'fs.unlink' هنا)
        }
      }

      // 3. إضافة الصور الجديدة
      if (req.files && req.files.length > 0) {
        const newImagesData = req.files.map((file) => ({
          image_path: file.filename,
          item_id: id,
        }));
        await ItemImage.bulkCreate(newImagesData);
      }

      // (إرجاع رسالة نجاح. الفرونت إند سيقوم بإعادة الجلب)
      res.json({ message: "تم تحديث المنتج بنجاح" });
    } catch (err) {
      console.error("❌ خطأ في تعديل المنتج:", err);
      res.status(500).json({ error: "خطأ في السيرفر" });
    }
  }
);

module.exports = router;
