const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { Item, ItemImage, User } = require("../models");

// ✅ إضافة منتج جديد مع صورة غلاف وصور متعددة
router.post(
  "/",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { title, description, price, user_id } = req.body;
      const cover = req.files?.cover?.[0]?.filename || null;

      // تحقق من البيانات المطلوبة
      if (!title || !user_id) {
        return res.status(400).json({
          error: "يرجى إدخال العنوان ومعرّف المستخدم",
        });
      }

      // تحقق من وجود المستخدم
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // إنشاء المنتج
      const item = await Item.create({
        title,
        description,
        price,
        cover_image: cover,
        user_id,
      });

      // إضافة الصور الإضافية إن وجدت
      const galleryFiles = req.files?.gallery || [];
      if (galleryFiles.length > 0) {
        const images = galleryFiles.map((file) => ({
          image_path: file.filename,
          item_id: item.id,
        }));
        await ItemImage.bulkCreate(images);
      }

      res.status(201).json({
        message: "✅ تم إضافة المنتج بنجاح",
        item,
      });
    } catch (err) {
      console.error("❌ خطأ في إضافة المنتج:", err);
      res.status(500).json({ error: "فشل إضافة المنتج" });
    }
  }
);

// ✅ جلب كل المنتجات مع صاحب المنتج
router.get("/", async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "photo"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ items });
  } catch (err) {
    console.error("❌ خطأ في جلب المنتجات:", err);
    res.status(500).json({ error: "فشل جلب المنتجات" });
  }
});

// ✅ جلب منتج معين مع الصور وصاحب المنتج
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [
        {
          model: ItemImage,
          as: "images",
          attributes: ["id", "image_path"],
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "photo", "location", "phone"],
        },
      ],
    });

    if (!item) {
      return res.status(404).json({ error: "المنتج غير موجود" });
    }

    res.json({ item });
  } catch (err) {
    console.error("❌ خطأ في جلب المنتج:", err);
    res.status(500).json({ error: "فشل جلب المنتج" });
  }
});

// ✅ جلب المنتجات الخاصة بمستخدم معين
router.get("/user/:userId", async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { user_id: req.params.userId },
      include: [
        {
          model: ItemImage,
          as: "images",
          attributes: ["id", "image_path"],
        },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "photo", "location"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ items });
  } catch (err) {
    console.error("❌ خطأ في جلب منتجات المستخدم:", err);
    res.status(500).json({ error: "فشل جلب المنتجات" });
  }
});
// ✅ تعديل منتج معين (خاص بصاحب المنتج)
router.put(
  "/:id",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const { title, description, price, user_id } = req.body;
      const { id } = req.params;

      // التحقق من وجود المنتج
      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }

      // التحقق من ملكية المنتج
      if (item.user_id != user_id) {
        return res
          .status(403)
          .json({ error: "ليس لديك صلاحية تعديل هذا المنتج" });
      }

      // تحديث صورة الغلاف إذا تم رفعها
      const cover = req.files?.cover?.[0]?.filename || item.cover_image;

      // تحديث بيانات المنتج
      await item.update({
        title: title || item.title,
        description: description || item.description,
        price: price || item.price,
        cover_image: cover,
      });

      // تحديث صور المعرض (اختياري)
      const galleryFiles = req.files?.gallery || [];
      if (galleryFiles.length > 0) {
        // حذف الصور القديمة (اختياري حسب التصميم)
        await ItemImage.destroy({ where: { item_id: item.id } });

        // إضافة الصور الجديدة
        const images = galleryFiles.map((file) => ({
          image_path: file.filename,
          item_id: item.id,
        }));
        await ItemImage.bulkCreate(images);
      }

      res.json({ message: "✅ تم تعديل المنتج بنجاح", item });
    } catch (err) {
      console.error("❌ خطأ في تعديل المنتج:", err);
      res.status(500).json({ error: "فشل تعديل المنتج" });
    }
  }
);

module.exports = router;
