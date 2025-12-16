const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

// استيراد الموديلات
const User = require("./User");
const Item = require("./Item");
const ItemImage = require("./ItemImage");
const Message = require("./Message");
const Category = require("./Category"); // ✅ 1. استيراد مودل الفئات

// =============================
// 1. علاقات المستخدم والمنتجات
// =============================
User.hasMany(Item, { foreignKey: "user_id", as: "items" });
Item.belongsTo(User, { foreignKey: "user_id", as: "owner" });

// =============================
// 2. علاقات الفئات (Categories)
// =============================

// أ) علاقة الفئة بنفسها (رئيسية وفرعية)
// الفئة يمكن أن تحتوي على فئات فرعية كثيرة
Category.hasMany(Category, {
  foreignKey: "parent_category_id",
  as: "subCategories",
});
// الفئة الفرعية تتبع فئة أب واحدة
Category.belongsTo(Category, {
  foreignKey: "parent_category_id",
  as: "parentCategory",
});

// ب) علاقة الفئة بالمنتجات
// ملاحظة: نحدد sourceKey و targetKey لأن المفتاح ليس 'id' بل 'category_id'
Category.hasMany(Item, {
  foreignKey: "category_id",
  sourceKey: "category_id", // المفتاح في جدول الفئات
  as: "items",
});

Item.belongsTo(Category, {
  foreignKey: "category_id",
  targetKey: "category_id", // المفتاح الذي نشير إليه في جدول الفئات
  as: "category",
});

// =============================
// 3. علاقات الصور والرسائل
// =============================
Item.hasMany(ItemImage, { foreignKey: "item_id", as: "images" });
ItemImage.belongsTo(Item, { foreignKey: "item_id", as: "item" });

User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiver_id", as: "receivedMessages" });

Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

// ✅ تصدير كل شيء
module.exports = {
  sequelize,
  Sequelize,
  User,
  Item,
  ItemImage,
  Message,
  Category,
};
