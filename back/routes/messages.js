const express = require("express");
const router = express.Router();
const { Message, User } = require("../models");
const { Op } = require("sequelize");

// ✅ إرسال رسالة جديدة
router.post("/", async (req, res) => {
  try {
    const { sender_id, receiver_id, text } = req.body;

    if (!sender_id || !receiver_id || !text) {
      return res
        .status(400)
        .json({ error: "يرجى إدخال جميع البيانات المطلوبة" });
    }

    const message = await Message.create({ sender_id, receiver_id, text });
    res.status(201).json({ message });
  } catch (err) {
    console.error("❌ خطأ في إرسال الرسالة:", err);
    res.status(500).json({ error: "فشل إرسال الرسالة" });
  }
});

// ✅ جلب المحادثة بين مستخدمين
router.get("/conversation/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: user1, receiver_id: user2 },
          { sender_id: user2, receiver_id: user1 },
        ],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "photo"] },
        { model: User, as: "receiver", attributes: ["id", "name", "photo"] },
      ],
      order: [["created_at", "ASC"]],
    });
    console.log("📦 Messages found:", messages.length);
    res.json({ messages });
  } catch (err) {
    console.error("❌ خطأ في جلب المحادثة:", err);
    res.status(500).json({ error: "فشل جلب المحادثة" });
  }
});

// ✅ جلب كل الرسائل الخاصة بمستخدم معيّن
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { receiver_id: userId }],
      },
      include: [
        { model: User, as: "sender", attributes: ["id", "name", "photo"] },
        { model: User, as: "receiver", attributes: ["id", "name", "photo"] },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({ messages });
  } catch (err) {
    console.error("❌ خطأ في جلب رسائل المستخدم:", err);
    res.status(500).json({ error: "فشل جلب الرسائل" });
  }
});

module.exports = router;
