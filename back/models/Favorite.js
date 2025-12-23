const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Favorite = sequelize.define(
  "Favorite",
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
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "favorites",
    timestamps: true, // ✅ نعم، الجدول فيه توقيت
    createdAt: "created_at", // ✅ اربطه بعمود created_at
    updatedAt: "updated_at", // ✅ اربطه بعمود updated_at
    underscored: true,
  }
);

module.exports = Favorite;
