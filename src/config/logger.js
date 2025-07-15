// src/config/logger.js

const winston = require('winston');
const path = require('path');

// تعریف فرمت لاگ‌ها
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`,
  ),
);

// Logger اصلی برای خطاها و لاگ‌های عمومی
const logger = winston.createLogger({
  level: 'info', // حداقل سطح لاگ برای ذخیره (error, warn, info, verbose, debug, silly)
  format: logFormat,
  transports: [
    // لاگ در کنسول (برای توسعه)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // رنگی کردن لاگ‌ها در کنسول
        logFormat,
      ),
    }),
    // لاگ در فایل برای خطاها
    new winston.transports.File({
      filename: path.join(__dirname, '..', '..', 'logs', 'error.log'), // مسیر ذخیره فایل لاگ خطا
      level: 'error',
    }),
    // لاگ در فایل برای همه اطلاعات (عمومی)
    new winston.transports.File({
      filename: path.join(__dirname, '..', '..', 'logs', 'combined.log'), // مسیر ذخیره فایل لاگ کلی
    }),
  ],
});

module.exports = logger;
