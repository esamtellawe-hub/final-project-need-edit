const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { Item, ItemImage, User, Category } = require("../models");
const { body, validationResult } = require("express-validator");
const verifyToken = require("../middleware/verifyToken");
// ==========================================
// 1. دوال مساعدة للتحقق (Validation Helpers)
// ==========================================

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array() });
};

// قواعد التحقق عند "إنشاء" منتج جديد
const createItemValidators = [
  body("title").trim().notEmpty().withMessage("يرجى إدخال عنوان المنتج"),
  body("description").trim().notEmpty().withMessage("يرجى إدخال الوصف"),
  body("price")
    .notEmpty()
    .withMessage("السعر مطلوب")
    .isFloat({ gt: 0 })
    .withMessage("السعر يجب أن يكون رقماً أكبر من صفر"),
  body("category_id")
    .notEmpty()
    .withMessage("يرجى اختيار الفئة")
    .isInt()
    .withMessage("معرف الفئة يجب أن يكون رقماً صحيحاً"),
  body("user_id").notEmpty().withMessage("معرف المستخدم مطلوب"),
];

// قواعد التحقق عند "تعديل" منتج
const updateItemValidators = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("العنوان لا يمكن أن يكون فارغاً"),
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("الوصف لا يمكن أن يكون فارغاً"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("السعر يجب أن يكون رقماً صحيحاً"),
  body("category_id")
    .optional()
    .isInt()
    .withMessage("معرف الفئة يجب أن يكون رقماً صحيحاً"),
  body("user_id")
    .notEmpty()
    .withMessage("معرف المستخدم مطلوب للتحقق من الملكية"),
];

// ==========================================
// 2. المسارات (Routes)
// ==========================================

// ✅ إضافة منتج جديد (POST)
router.post(
  "/",
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  createItemValidators,
  validate,
  async (req, res) => {
    try {
      const { title, description, price, category_id, user_id } = req.body;

      const cover = req.files?.cover?.[0]?.filename || null;

      // التحقق من وجود صورة الغلاف
      if (!cover) {
        return res
          .status(400)
          .json({ errors: [{ msg: "صورة الغلاف مطلوبة", path: "cover" }] });
      }

      // التأكد من أن المستخدم موجود
      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // ✅ التحقق من وجود الفئة باستخدام المفتاح الأساسي الجديد category_id
      const categoryExists = await Category.findByPk(category_id);
      if (!categoryExists) {
        return res.status(404).json({ error: "الفئة المختارة غير موجودة" });
      }

      // إنشاء المنتج
      const item = await Item.create({
        title,
        description,
        price,
        category_id, // حفظ المعرف
        cover_image: cover,
        user_id,
      });

      // حفظ صور المعرض
      const galleryFiles = req.files?.gallery_images || [];
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
// ✅ تعديل منتج (PUT)
router.put(
  "/:id",
  verifyToken,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const itemId = req.params.id;
      // تأكد أن المستخدم هو صاحب المنتج
      const item = await Item.findByPk(itemId);
      if (!item) return res.status(404).json({ error: "Item not found" });

      if (item.user_id !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // 1. تحديث البيانات النصية
      const { title, description, price, category_id } = req.body;

      item.title = title || item.title;
      item.description = description || item.description;
      item.price = price || item.price;
      item.category_id = category_id || item.category_id;

      // 2. تحديث صورة الغلاف (إذا تم رفع صورة جديدة باسم 'cover')
      if (req.files && req.files["cover"]) {
        // (اختياري: ممكن تحذف الصورة القديمة من السيرفر هنا باستخدام fs.unlink)
        item.cover_image = req.files["cover"][0].filename;
      }

      await item.save();

      // 3. إضافة صور المعرض (إذا تم رفع صور جديدة باسم 'gallery')
      if (req.files && req.files["gallery"]) {
        const galleryImages = req.files["gallery"].map((file) => ({
          item_id: itemId,
          image_path: file.filename,
        }));
        await ItemImage.bulkCreate(galleryImages);
      }

      res.json({ message: "Item updated successfully", item });
    } catch (err) {
      console.error("Update Error:", err);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

// ✅ جلب كل المنتجات (GET)
router.get("/", async (req, res) => {
  try {
    const items = await Item.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "photo"],
        },
        // ✅ جلب بيانات الفئة بالأسماء الصحيحة للأعمدة
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json({ items });
  } catch (err) {
    console.error("error fetching items", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// ✅ جلب منتج واحد (GET One)
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id, {
      include: [
        { model: ItemImage, as: "images" },
        {
          model: User,
          as: "owner",
          attributes: ["id", "name", "photo", "phone", "location"],
        },
        // ✅ جلب بيانات الفئة
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// ✅ جلب منتجات مستخدم معين
router.get("/user/:userId", async (req, res) => {
  try {
    const items = await Item.findAll({
      where: { user_id: req.params.userId },
      include: [
        { model: ItemImage, as: "images" },
        // ✅ جلب بيانات الفئة
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user items" });
  }
});
// ✅ حذف منتج (DELETE)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // تحقق أن المستخدم هو صاحب المنتج
    if (item.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this item" });
    }

    // حذف الصور المرتبطة (اختياري: يفضل حذف الملفات من السيرفر أيضاً)
    await ItemImage.destroy({ where: { item_id: item.id } });

    // حذف المنتج
    await item.destroy();

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;
