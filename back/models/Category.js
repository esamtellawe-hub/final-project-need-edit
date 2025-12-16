const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Category = sequelize.define(
  "Category",
  {
    // ✅ المفتاح الأساسي (Primary Key)
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // ✅ اسم الفئة
    category_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // ✅ تاريخ الإنشاء
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // ✅ الفئة الأب (للفئات الفرعية)
    parent_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "category_id",
      },
    },
  },
  {
    tableName: "categories",
    timestamps: false, // لأن created_at معرف يدوياً
    underscored: true,
  }
);

module.exports = Category;
