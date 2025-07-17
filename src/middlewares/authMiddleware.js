// src/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const db = require('../../models');
const User = db.User;
const Role = db.Role;

// تابع authenticateToken را طوری تغییر می‌دهیم که اگر توکن نبود، فقط req.user را null بگذارد و ادامه دهد (next())
// این اجازه می‌دهد که روت‌های عمومی (مثل سبد خرید برای مهمانان) بدون توکن کار کنند.
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null; // اگر توکن نبود، req.user را null می‌گذاریم
    return next(); // 👈 اجازه می‌دهیم درخواست ادامه پیدا کند
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // اطلاعات کاربر (id, role_id) را به آبجکت req اضافه می‌کنیم
    next(); // به Middleware بعدی یا کنترلر اصلی برو
  } catch (error) {
    console.error('Token verification error:', error);
    // در صورت نامعتبر بودن توکن، همچنان دسترسی را رد می‌کنیم
    return res
      .status(403)
      .json({ message: 'Access Denied: Invalid or expired token.' });
  }
};

exports.authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role_id) {
      // اگر authenticateToken اجرا شده ولی توکن معتبر نبوده یا کاربری نیست
      return res.status(403).json({
        message: 'Access Denied: User role not found or not authenticated.',
      });
    }

    try {
      const userRole = await Role.findByPk(req.user.role_id);

      if (!userRole || !allowedRoles.includes(userRole.name)) {
        return res.status(403).json({
          message: 'Access Denied: You do not have the required role.',
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        message: 'Server error during role authorization.',
        error: error.message,
      });
    }
  };
};
exports.bypassCsrf = (req, res, next) => {
  const csrfBypassPaths = [
    '/verify-otp',
    '/request-otp',
    '/forgot-password',
  ];

  // چک مسیرهای ثابت
  const isStaticPath = csrfBypassPaths.includes(req.path);

  // چک مسیر داینامیک reset-password/:token
  const isResetPasswordPath = req.path.startsWith('/reset-password/');

  if (req.method === 'POST' && (isStaticPath || isResetPasswordPath)) {
    req.csrfToken = () => null; // غیرفعال کردن CSRF برای این مسیرها
  }

  next();
};

exports.authenticateForPayments = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'برای ادامه فرآیند پرداخت لطفا وارد شوید.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // اطلاعات کاربر (id, role_id) را به آبجکت req اضافه می‌کنیم
    next(); // به Middleware بعدی یا کنترلر اصلی برو
  } catch (error) {
    console.error('Token verification error:', error);
    // در صورت نامعتبر بودن توکن، همچنان دسترسی را رد می‌کنیم
    return res
        .status(403)
        .json({ message: 'Access Denied: Invalid or expired token.' });
  }
};
