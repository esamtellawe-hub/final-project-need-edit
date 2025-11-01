const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

// استيراد الموديلات
const User = require("./User");
const Item = require("./Item");
const ItemImage = require("./ItemImage");
const Message = require("./Message");

// ✅ ربط العلاقات بين المستخدم والمنتجات
User.hasMany(Item, { foreignKey: "user_id", as: "items" });
Item.belongsTo(User, { foreignKey: "user_id", as: "owner" });

// ✅ ربط الصور بالمنتج
Item.hasMany(ItemImage, { foreignKey: "item_id", as: "images" });
ItemImage.belongsTo(Item, { foreignKey: "item_id", as: "item" });

// ✅ ربط الرسائل بالمستخدمين
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
};
