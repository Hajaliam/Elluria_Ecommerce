// src/middlewares/rateLimitMiddleware.js

const rateLimit = require('express-rate-limit');

// Rate Limiter برای روت‌های احراز هویت (Login, Register)
// 10 درخواست در 15 دقیقه از هر IP
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: 10, // حداکثر 10 درخواست
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    standardHeaders: true, // اضافه کردن هدرهای RateLimit-*
    legacyHeaders: false, // غیرفعال کردن هدرهای X-RateLimit-* (اختیاری)
    keyGenerator: (req, res) => {
        // از IP کاربر (یا اگر پشت پروکسی هستید، از X-Forwarded-For) استفاده می‌کند
        return req.ip;
    }
});

// Rate Limiter برای روت‌های عمومی (مثلاً ارسال فرم‌های تماس، یا جستجو)
// 100 درخواست در 15 دقیقه از هر IP
exports.generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقیقه
    max: 100, // حداکثر 100 درخواست
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        return req.ip;
    }
});

exports.forgotPasswordLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 دقیقه
    max: 1, // حداکثر یک درخواست در این مدت زمان
    message: 'امکان ارسال درخواست تا دو دقیقه وجود ندارد.',
    standardHeaders: true, // اضافه کردن هدرهای RateLimit-*
    legacyHeaders: false, // غیرفعال کردن هدرهای X-RateLimit-* (اختیاری)
    keyGenerator: (req, res) => {
        // استفاده از x-forwarded-for برای پروکسی‌ها یا شبکه‌های با IP مشترک
        return req.headers['x-forwarded-for'] || req.ip;
    }
});

exports.verifyOTPlimitter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 دقیقه
    max: 5, // حداکثر پنج درخواست در این مدت زمان
    message: 'امکان ارسال درخواست تا پنج دقیقه وجود ندارد.',
    standardHeaders: true, // اضافه کردن هدرهای RateLimit-*
    legacyHeaders: false, // غیرفعال کردن هدرهای X-RateLimit-* (اختیاری)
    keyGenerator: (req, res) => {
        // استفاده از x-forwarded-for برای پروکسی‌ها یا شبکه‌های با IP مشترک
        return req.headers['x-forwarded-for'] || req.ip;
    }
});