const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ItemImage = sequelize.define(
  "ItemImage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "item_images",
    timestamps: false,
  }
);

module.exports = ItemImage;
