const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // ✅ تمت الإضافة: لمعرفة ما إذا تم تعديل الرسالة
    is_edited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "messages",
    timestamps: false,
  }
);

module.exports = Message;
