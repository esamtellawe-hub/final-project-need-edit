const express = require("express");
const router = express.Router();
// ✅ استيراد كل الموديلات الضرورية
const { Favorite, Item, User, Category } = require("../models");
const verifyToken = require("../middleware/verifyToken");

// 1. إضافة / إزالة من المفضلة
router.post("/toggle", verifyToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user.id;

    // هل هو موجود مسبقاً؟
    const existing = await Favorite.findOne({
      where: { user_id: userId, item_id: itemId },
    });

    if (existing) {
      await existing.destroy(); // احذف
      return res.json({ message: "Removed", isFavorite: false });
    } else {
      await Favorite.create({ user_id: userId, item_id: itemId }); // ضيف
      return res.json({ message: "Added", isFavorite: true });
    }
  } catch (err) {
    console.error("Toggle Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 2. عرض المفضلة
router.get("/", verifyToken, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Item,
          attributes: [
            "id",
            "title",
            "price",
            "cover_image",
            "description",
            "category_id",
          ],
          include: [
            { model: User, as: "owner", attributes: ["name", "photo"] },
            { model: Category, as: "category", attributes: ["category_name"] }, // ✅ ضروري
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // ترتيب البيانات للفرونت
    const cleanList = favorites
      .map((fav) => {
        if (!fav.Item) return null;
        const itemJson = fav.Item.toJSON();
        return { ...itemJson, favorite_id: fav.id };
      })
      .filter((item) => item !== null);

    res.json(cleanList);
  } catch (err) {
    console.error("Fetch Favorites Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
