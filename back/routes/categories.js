const express = require("express");
const router = express.Router();
const { Category } = require("../models");

// ✅ جلب كافة الفئات
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل جلب الفئات" });
  }
});

// ✅ إضافة فئة جديدة
router.post("/", async (req, res) => {
  try {
    // استقبال الأسماء الجديدة للأعمدة
    const { category_name, parent_category_id } = req.body;

    if (!category_name) {
      return res.status(400).json({ error: "اسم الفئة (category_name) مطلوب" });
    }

    const category = await Category.create({
      category_name,
      parent_category_id: parent_category_id || null,
    });

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "فشل إضافة الفئة" });
  }
});

module.exports = router;
