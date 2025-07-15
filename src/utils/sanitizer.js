// src/utils/sanitizer.js

const xss = require('xss');

// تابع برای پاکسازی رشته‌های ورودی
// به طور پیش‌فرض، تگ‌های HTML و اسکریپت‌های مخرب را حذف می‌کند
// می‌توانید گزینه‌ها را برای اجازه دادن به تگ‌های خاص (مثل <b>, <i>) سفارشی کنید
exports.sanitizeString = (input) => {
    if (typeof input !== 'string') {
        return input; // اگر ورودی رشته نبود، آن را برگردان
    }
    return xss(input);
};

// می‌توانید توابع دیگری برای پاکسازی ورودی‌های خاص (مثلاً HTML غنی) اضافه کنید