const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { Item, ItemImage, User, Category } = require("../models");
const { body, validationResult } = require("express-validator");

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
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "gallery_images", maxCount: 10 },
  ]),
  updateItemValidators,
  validate,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, price, category_id, user_id } = req.body;

      const item = await Item.findByPk(id);
      if (!item) {
        return res.status(404).json({ error: "المنتج غير موجود" });
      }

      if (item.user_id.toString() !== user_id.toString()) {
        return res
          .status(403)
          .json({ error: "ليس لديك صلاحية تعديل هذا المنتج" });
      }

      // إذا تم إرسال فئة جديدة، تحقق من وجودها
      if (category_id) {
        const categoryExists = await Category.findByPk(category_id);
        if (!categoryExists) {
          return res.status(404).json({ error: "الفئة الجديدة غير موجودة" });
        }
      }

      const newCover = req.files?.cover?.[0]?.filename || item.cover_image;

      await item.update({
        title: title !== undefined ? title : item.title,
        description: description !== undefined ? description : item.description,
        price: price !== undefined ? price : item.price,
        category_id: category_id !== undefined ? category_id : item.category_id,
        cover_image: newCover,
      });

      const galleryFiles = req.files?.gallery_images || [];
      if (galleryFiles.length > 0) {
        await ItemImage.destroy({ where: { item_id: item.id } });

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

module.exports = router;
