// src/controllers/settingController.js

const db = require('../../models');
const Setting = db.Setting;
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer'); // برای پاکسازی ورودی‌ها

// 👈 تابع برای ایجاد/به‌روزرسانی یک تنظیم
exports.setSetting = async (req, res) => {
    const { key, value } = req.body; // key و value تنظیمات

    // پاکسازی ورودی
    const sanitizedKey = sanitizeString(key);
    const sanitizedValue = sanitizeString(value); // تنظیمات می‌توانند هر نوع داده‌ای باشند، اما به عنوان رشته ذخیره می‌شوند

    try {
        // از findOrCreate برای ایجاد یا به‌روزرسانی استفاده می‌کنیم
        const [setting, created] = await Setting.findOrCreate({
            where: { key: sanitizedKey },
            defaults: { value: sanitizedValue }
        });

        if (!created) {
            // اگر تنظیم موجود بود، آن را به‌روزرسانی می‌کنیم
            setting.value = sanitizedValue;
            await setting.save();
        }

        res.status(200).json({
            message: created ? 'Setting created successfully!' : 'Setting updated successfully!',
            setting: setting
        });

    } catch (error) {
        logger.error(`Error setting/updating setting with key ${sanitizedKey}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error setting/updating setting', error: error.message });
    }
};

// 👈 تابع برای دریافت یک تنظیم بر اساس key
exports.getSetting = async (req, res) => {
    const { key } = req.params; // key تنظیم از پارامترهای URL
    const sanitizedKey = sanitizeString(key);

    try {
        const setting = await Setting.findByPk(sanitizedKey); // Setting.key primary key است
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found.' });
        }
        res.status(200).json({ setting: setting });
    } catch (error) {
        logger.error(`Error fetching setting with key ${sanitizedKey}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching setting', error: error.message });
    }
};

// 👈 تابع برای دریافت همه تنظیمات
exports.getAllSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        res.status(200).json({ settings: settings });
    } catch (error) {
        logger.error(`Error fetching all settings: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching all settings', error: error.message });
    }
};

// 👈 تابع برای حذف یک تنظیم بر اساس key
exports.deleteSetting = async (req, res) => {
    const { key } = req.params; // key تنظیم از پارامترهای URL
    const sanitizedKey = sanitizeString(key);

    try {
        const setting = await Setting.findByPk(sanitizedKey);
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found.' });
        }
        await setting.destroy();
        res.status(200).json({ message: 'Setting deleted successfully!' });
    } catch (error) {
        logger.error(`Error deleting setting with key ${sanitizedKey}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error deleting setting', error: error.message });
    }
};