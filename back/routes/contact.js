const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // التحقق من البيانات
  if (!name || !email || !message) {
    return res.status(400).json({ error: "الرجاء تعبئة الحقول المطلوبة" });
  }

  try {
    // 1. إعداد الناقل (Transporter) - مثال لـ Gmail
    // ملاحظة: لـ Gmail، يجب استخدام "App Password" وليس كلمة مرور حسابك العادية
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // إيميلك الذي سيرسل الرسائل
        pass: process.env.EMAIL_PASS, // كلمة مرور التطبيق (App Password)
      },
    });

    // 2. إعداد الرسالة
    const mailOptions = {
      from: email, // الإيميل الظاهر (غالباً سيكون إيميلك المرسل)
      to: process.env.EMAIL_USER, // الإيميل الذي ستستقبل عليه الرسائل
      subject: `رسالة جديدة من الموقع: ${subject || "بدون عنوان"}`,
      html: `
        <h3>لديك رسالة جديدة من نموذج "اتصل بنا"</h3>
        <ul>
          <li><strong>الاسم:</strong> ${name}</li>
          <li><strong>البريد الإلكتروني للمرسل:</strong> ${email}</li>
          <li><strong>العنوان:</strong> ${subject}</li>
        </ul>
        <h3>الرسالة:</h3>
        <p>${message}</p>
      `,
    };

    // 3. إرسال الإيميل
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: "تم إرسال رسالتك بنجاح!" });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "فشل إرسال الرسالة، حاول مرة أخرى لاحقاً." });
  }
});

module.exports = router;
