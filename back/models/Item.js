const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Item = sequelize.define(
  "Item",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // ✅ تمت إضافة حقل معرف الفئة
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false, // جعلناه إجبارياً ليتم ربط كل منتج بفئة
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    cover_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "items",
    timestamps: false,
  }
);

module.exports = Item;
