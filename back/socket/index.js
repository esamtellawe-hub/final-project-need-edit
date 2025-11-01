// في ملف: socket/index.js

const { Message } = require("../models");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // console.log("✅ User connected:", socket.id);

    // الانضمام للغرفة الخاصة بالمستخدم
    socket.on("join", (userId) => {
      const room = userId.toString();
      socket.join(room);
      console.log(`📥 User ${userId} joined room: ${room}`);
    });

    socket.on("sendMessage", async (data) => {
      const { sender_id, receiver_id, text } = data;

      if (!sender_id || !receiver_id || !text) return;

      try {
        const savedMessage = await Message.create({
          sender_id,
          receiver_id,
          text,
        });

        // === 💡 التعديل هنا ===

        // إرسال الرسالة إلى غرفة المستلم
        io.to(receiver_id.toString()).emit("receiveMessage", savedMessage);

        // إرسال الرسالة إلى غرفة المرسل (إذا كان شخصاً مختلفاً)
        // هذا يضمن أن المرسل يستقبل الرسالة (في التاب الحالي وفي أي تابات أخرى فتحها)
        if (sender_id.toString() !== receiver_id.toString()) {
          io.to(sender_id.toString()).emit("receiveMessage", savedMessage);
        }

        // === 💡 نهاية التعديل ===
      } catch (err) {
        console.error("❌ Failed to store message:", err);
      }
    });

    socket.on("disconnect", () => {
      //   console.log("❌ Disconnected:", socket.id);
    });
  });
};
