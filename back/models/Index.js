const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

// استيراد الموديلات
const User = require("./User");
const Item = require("./Item");
const ItemImage = require("./ItemImage");
const Message = require("./Message");
const Category = require("./Category");
const Favorite = require("./Favorite"); // ✅

// 1. علاقات المستخدم والمنتجات
User.hasMany(Item, { foreignKey: "user_id", as: "items" });
Item.belongsTo(User, { foreignKey: "user_id", as: "owner" });

// 2. علاقات الفئات (Categories)
Category.hasMany(Category, {
  foreignKey: "parent_category_id",
  as: "subCategories",
});
Category.belongsTo(Category, {
  foreignKey: "parent_category_id",
  as: "parentCategory",
});

Category.hasMany(Item, {
  foreignKey: "category_id",
  sourceKey: "category_id", // ✅ ضروري عشان ما يضرب
  as: "items",
});

Item.belongsTo(Category, {
  foreignKey: "category_id",
  targetKey: "category_id",
  as: "category",
});

// 3. علاقات المفضلة (الجديدة والنظيفة) ✅
User.hasMany(Favorite, { foreignKey: "user_id", onDelete: "CASCADE" });
Favorite.belongsTo(User, { foreignKey: "user_id" });

Item.hasMany(Favorite, { foreignKey: "item_id", onDelete: "CASCADE" });
Favorite.belongsTo(Item, { foreignKey: "item_id" });

// 4. باقي العلاقات
Item.hasMany(ItemImage, { foreignKey: "item_id", as: "images" });
ItemImage.belongsTo(Item, { foreignKey: "item_id", as: "item" });

User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiver_id", as: "receivedMessages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });
Message.belongsTo(User, { foreignKey: "receiver_id", as: "receiver" });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Item,
  ItemImage,
  Message,
  Category,
  Favorite,
};
