// middleware/adminMiddleware.js

/**
 * هذا الحارس (Middleware) يفترض أنه يعمل *بعد*
 * الحارس 'verifyToken.js'.
 * هو يقرأ 'req.user' الذي تم تجهيزه مسبقاً.
 */
const isAdmin = (req, res, next) => {
  // نتأكد أن req.user موجود (من verifyToken)
  // ونتأكد أن الصلاحية هي 'admin'
  if (req.user && req.user.role === "admin") {
    // ممتاز، هذا المستخدم هو "admin"، اسمح له بالمرور
    next();
  } else {
    // هذا المستخدم إما 'user' عادي أو غير مصرح له
    return res.status(403).json({
      error: "Forbidden: Access denied. Requires admin privileges.",
    });
  }
};

// نقوم بتصديره ككائن (Object) لسهولة إضافة حراس آخرين مستقبلاً
module.exports = { isAdmin };
