// src/controllers/couponController.js

const db = require('../../models');
const Coupon = db.Coupon;
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer'); // 👈 اضافه کنید

// تابع برای ایجاد کوپن جدید
exports.createCoupon = async (req, res) => {
  let {
    code,
    discount_type,
    discount_value,
    min_amount,
    usage_limit,
    expiry_date,
    isActive,
  } = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی
  code = sanitizeString(code);
  discount_type = sanitizeString(discount_type);

  try {
    const existingCoupon = await Coupon.findOne({ where: { code: code } });
    if (existingCoupon) {
      return res
        .status(409)
        .json({ message: 'Coupon with this code already exists.' });
    }
    const newCoupon = await Coupon.create({
      code,
      discount_type,
      discount_value,
      min_amount: min_amount || 0,
      usage_limit,
      expiry_date,
      isActive,
    });
    res
      .status(201)
      .json({ message: 'Coupon created successfully!', coupon: newCoupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res
      .status(500)
      .json({ message: 'Server error creating coupon', error: error.message });
  }
};

// تابع برای دریافت همه کوپن‌ها
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.status(200).json({ coupons: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching coupons', error: error.message });
  }
};

// تابع برای دریافت یک کوپن بر اساس کد
exports.getCouponByCode = async (req, res) => {
  let { code } = req.params; // 👈 از let استفاده کنید و پاکسازی کنید
  code = sanitizeString(code); // 👈 پاکسازی پارامتر URL

  try {
    const coupon = await Coupon.findOne({ where: { code: code } });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }
    res.status(200).json({ coupon: coupon });
  } catch (error) {
    console.error('Error fetching coupon by code:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching coupon', error: error.message });
  }
};

// تابع برای به‌روزرسانی یک کوپن
exports.updateCoupon = async (req, res) => {
  let { code } = req.params; // 👈 از let استفاده کنید و پاکسازی کنید
  code = sanitizeString(code); // 👈 پاکسازی پارامتر URL

  let {
    new_code,
    discount_type,
    discount_value,
    min_amount,
    usage_limit,
    expiry_date,
    isActive,
  } = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی
  if (new_code) new_code = sanitizeString(new_code);
  if (discount_type) discount_type = sanitizeString(discount_type);

  try {
    const coupon = await Coupon.findOne({ where: { code: code } });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    // بررسی کد تکراری در صورت تغییر کد
    if (new_code && new_code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        where: { code: new_code },
      });
      if (existingCoupon) {
        return res
          .status(409)
          .json({ message: 'Coupon with this new code already exists.' });
      }
    }

    coupon.code = new_code || coupon.code;
    coupon.discount_type = discount_type || coupon.discount_type;
    coupon.discount_value = discount_value || coupon.discount_value;
    coupon.min_amount =
      min_amount !== undefined ? min_amount : coupon.min_amount;
    coupon.usage_limit =
      usage_limit !== undefined ? usage_limit : coupon.usage_limit;
    coupon.expiry_date = expiry_date || coupon.expiry_date;
    coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

    await coupon.save();
    res
      .status(200)
      .json({ message: 'Coupon updated successfully!', coupon: coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res
      .status(500)
      .json({ message: 'Server error updating coupon', error: error.message });
  }
};

// تابع برای حذف یک کوپن
exports.deleteCoupon = async (req, res) => {
  let { code } = req.params; // 👈 از let استفاده کنید و پاکسازی کنید
  code = sanitizeString(code); // 👈 پاکسازی پارامتر URL

  try {
    const coupon = await Coupon.findOne({ where: { code: code } });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }
    await coupon.destroy();
    res.status(200).json({ message: 'Coupon deleted successfully!' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res
        .status(400)
        .json({ message: 'Cannot delete coupon: Associated orders exist.' });
    }
    res
      .status(500)
      .json({ message: 'Server error deleting coupon', error: error.message });
  }
};
