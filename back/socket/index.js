const { Message } = require("../models");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // console.log("✅ User connected:", socket.id);

    // 1. الانضمام للغرفة الخاصة بالمستخدم
    socket.on("join", (userId) => {
      const room = userId.toString();
      socket.join(room);
      console.log(`📥 User ${userId} joined room: ${room}`);
    });

    // 2. إرسال رسالة
    socket.on("sendMessage", async (data) => {
      const { sender_id, receiver_id, text } = data;

      if (!sender_id || !receiver_id || !text) return;

      try {
        // حفظ الرسالة في قاعدة البيانات
        const savedMessage = await Message.create({
          sender_id,
          receiver_id,
          text,
          is_edited: false,
        });

        // إرسال للمستلم
        io.to(receiver_id.toString()).emit("receiveMessage", savedMessage);

        // إرسال للمرسل (لضمان التزامن)
        if (sender_id.toString() !== receiver_id.toString()) {
          io.to(sender_id.toString()).emit("receiveMessage", savedMessage);
        }
      } catch (err) {
        console.error("❌ Failed to store message:", err);
      }
    });

    // 3. تعديل رسالة (تحديث قاعدة البيانات)
    socket.on("editMessage", async (data) => {
      const { id, text, receiver_id } = data;
      try {
        // ✅ الخطوة المهمة: تحديث النص وحالة التعديل في الداتابيز
        await Message.update(
          { text: text, is_edited: true },
          { where: { id: id } }
        );

        const updatedMsg = { id, text, is_edited: true };

        // إبلاغ المستلم بالتحديث
        io.to(receiver_id.toString()).emit("messageUpdated", updatedMsg);
      } catch (err) {
        console.error("❌ Failed to edit message:", err);
      }
    });

    // 4. حذف رسالة (حذف من قاعدة البيانات)
    socket.on("deleteMessage", async (data) => {
      const { id, receiver_id } = data;
      try {
        // ✅ الخطوة المهمة: حذف السطر من الداتابيز
        await Message.destroy({ where: { id: id } });

        // إبلاغ المستلم بالحذف
        io.to(receiver_id.toString()).emit("messageDeleted", id);
      } catch (err) {
        console.error("❌ Failed to delete message:", err);
      }
    });

    socket.on("disconnect", () => {
      // console.log("❌ Disconnected:", socket.id);
    });
  });
};
