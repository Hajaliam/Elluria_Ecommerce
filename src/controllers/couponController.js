// src/controllers/couponController.js

const db = require('../../models');
const Coupon = db.Coupon;
const User = db.User; // برای کوپن‌های خصوصی
const Product = db.Product; // برای کوپن‌های محصول خاص
const Category = db.Category; //برای کوپن هاید مخصوص دسته بندی های خاص
const CouponGroup = db.CouponGroup; // برای گروه‌بندی کوپن‌ها
const Sequelize = db.Sequelize;
const { getDescendantCategoryIds } = require('../utils/descendantCategoryIds');
const { sanitizeString } = require('../utils/sanitizer');
// تابع برای ایجاد کوپن جدید
exports.createCoupon = async (req, res) => {
  let {
    code, discount_type, discount_value, min_amount, usage_limit,
    expiry_date, isActive, is_first_purchase_only, is_exclusive,
    max_usage_per_user, coupon_group_id, product_ids, user_ids ,category_ids// فیلدهای جدید و آرایه‌ها
  } = req.body;

  try {
    // 1. پاکسازی و اعتبارسنجی اولیه
    const sanitizedCode = sanitizeString(code);
    const sanitizedDiscountType = sanitizeString(discount_type);
    const allCategories = await Category.findAll({ attributes: ['id', 'parent_id'] });

    if (!sanitizedCode || !sanitizedDiscountType || discount_value === undefined) {
      return res.status(400).json({ message: 'Missing required fields: code, discount_type, discount_value.' });
    }
    if (!['percentage', 'fixed_amount', 'free_shipping'].includes(sanitizedDiscountType)) {
      return res.status(400).json({ message: 'Invalid discount_type. Allowed: percentage, fixed_amount, free_shipping.' });
    }
    if (sanitizedDiscountType !== 'free_shipping' && (isNaN(parseFloat(discount_value)) || parseFloat(discount_value) <= 0)) {
      return res.status(400).json({ message: 'discount_value must be a positive number for percentage/fixed coupons.' });
    }
    if (min_amount && isNaN(parseFloat(min_amount))) {
      return res.status(400).json({ message: 'min_amount must be a number.' });
    }
    if (category_ids && category_ids.length > 0) {
      const expandedCategoryIds = new Set();

      for (const categoryId of category_ids) {
        const allChildIds = getDescendantCategoryIds(categoryId, allCategories);
        allChildIds.forEach(id => expandedCategoryIds.add(id));
      }

      category_ids = [...expandedCategoryIds];
    }



    // 2. بررسی وجود کوپن با کد تکراری
    const existingCoupon = await Coupon.findOne({ where: { code: sanitizedCode } ,transaction: t});
    if (existingCoupon) {
      return res.status(409).json({ message: 'Coupon with this code already exists.' });
    }

    // 3. بررسی وجود گروه کوپن
    let couponGroup = null;
    if (coupon_group_id) {
      couponGroup = await CouponGroup.findByPk(coupon_group_id);
      if (!couponGroup) {
        return res.status(404).json({ message: 'CouponGroup not found.' });
      }
    }


    // 4. ایجاد کوپن جدید
    const newCoupon = await Coupon.create({
      code: sanitizedCode,
      discount_type: sanitizedDiscountType,
      discount_value: sanitizedDiscountType === 'free_shipping' ? 0 : parseFloat(discount_value), // برای ارسال رایگان، مقدار تخفیف 0
      min_amount: min_amount ? parseFloat(min_amount) : 0,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      isActive: isActive === 'true' || isActive === true,
      is_first_purchase_only: is_first_purchase_only === 'true' || is_first_purchase_only === true,
      is_exclusive: is_exclusive === 'true' || is_exclusive === true,
      max_usage_per_user: max_usage_per_user ? parseInt(max_usage_per_user) : null,
      coupon_group_id: couponGroup ? couponGroup.id : null
    });

    // 5. ایجاد ارتباط با محصولات خاص (CouponProducts)
    if (product_ids && product_ids.length > 0) {
      const products = await Product.findAll({ where: { id: product_ids } });
      if (products.length !== product_ids.length) {
        await newCoupon.destroy(); // کوپن را حذف کن اگر همه محصولات پیدا نشدند
        return res.status(404).json({ message: 'One or more specified products for coupon not found.' });
      }
      await newCoupon.setProducts(products.map(p => p.id)); // ایجاد ارتباط Many-to-Many
    }

    // 6. ایجاد ارتباط با کاربران خاص (UserCoupons)
    if (user_ids && user_ids.length > 0) {
      const users = await User.findAll({ where: { id: user_ids } });
      if (users.length !== user_ids.length) {
        await newCoupon.destroy(); // کوپن را حذف کن اگر همه کاربران پیدا نشدند
        return res.status(404).json({ message: 'One or more specified users for coupon not found.' });
      }
      await newCoupon.setUsers(users.map(user => user.id)); // ایجاد ارتباط Many-to-Many
    }
    /// ایجاد ارتباط با دسته بندی خاص
    if (category_ids && category_ids.length > 0) {
      const categories = await Category.findAll({ where: { id: category_ids } });
      if (categories.length !== category_ids.length) {
        await newCoupon.destroy(); // حذف کوپن اگر دسته‌ای پیدا نشد
        return res.status(404).json({ message: 'One or more specified categories for coupon not found.' });
      }
      await newCoupon.setCategories(categories.map(cat => cat.id)); // اتصال Many-to-Many
    }


    res.status(201).json({ message: 'Coupon created successfully!', coupon: newCoupon });

  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Server error creating coupon', error: error.message });
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
  const { id } = req.params;
  let {
    code, discount_type, discount_value, min_amount, usage_limit,
    expiry_date, isActive, is_first_purchase_only, is_exclusive,
    max_usage_per_user, coupon_group_id, product_ids, user_ids // فیلدهای جدید و آرایه‌ها
  } = req.body;

  try {
    const coupon = await db.Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // 1. پاکسازی و اعتبارسنجی
    const sanitizedCode = sanitizeString(code);
    const sanitizedDiscountType = sanitizeString(discount_type);

    if (!sanitizedCode || !sanitizedDiscountType || discount_value === undefined) {
      return res.status(400).json({ message: 'Missing required fields: code, discount_type, discount_value.' });
    }
    if (!['percentage', 'fixed_amount', 'free_shipping'].includes(sanitizedDiscountType)) {
      return res.status(400).json({ message: 'Invalid discount_type. Allowed: percentage, fixed_amount, free_shipping.' });
    }
    if (sanitizedDiscountType !== 'free_shipping' && (isNaN(parseFloat(discount_value)) || parseFloat(discount_value) <= 0)) {
      return res.status(400).json({ message: 'discount_value must be a positive number for percentage/fixed coupons.' });
    }
    if (min_amount && isNaN(parseFloat(min_amount))) {
      return res.status(400).json({ message: 'min_amount must be a number.' });
    }

    // بررسی کد تکراری در صورت تغییر کد
    if (sanitizedCode && sanitizedCode !== coupon.code) {
      const existingCoupon = await db.Coupon.findOne({ where: { code: sanitizedCode } });
      if (existingCoupon) {
        return res.status(409).json({ message: 'Coupon with this new code already exists.' });
      }
    }

    // 2. بررسی وجود گروه کوپن
    let couponGroup = null;
    if (coupon_group_id) {
      couponGroup = await CouponGroup.findByPk(coupon_group_id);
      if (!couponGroup) {
        return res.status(404).json({ message: 'CouponGroup not found.' });
      }
    }


    // 3. به‌روزرسانی فیلدهای کوپن
    coupon.code = sanitizedCode;
    coupon.discount_type = sanitizedDiscountType;
    coupon.discount_value = sanitizedDiscountType === 'free_shipping' ? 0 : parseFloat(discount_value);
    coupon.min_amount = min_amount ? parseFloat(min_amount) : 0;
    coupon.usage_limit = usage_limit ? parseInt(usage_limit) : null;
    coupon.expiry_date = expiry_date ? new Date(expiry_date) : null;
    coupon.isActive = isActive === 'true' || isActive === true;
    coupon.is_first_purchase_only = is_first_purchase_only === 'true' || is_first_purchase_only === true;
    coupon.is_exclusive = is_exclusive === 'true' || is_exclusive === true;
    coupon.max_usage_per_user = max_usage_per_user ? parseInt(max_usage_per_user) : null;
    coupon.coupon_group_id = couponGroup ? couponGroup.id : null;

    await coupon.save();

    // 4. به‌روزرسانی ارتباط با محصولات خاص (CouponProducts)
    if (product_ids) { // اگر product_ids ارسال شد، روابط را به‌روزرسانی کن
      const products = await Product.findAll({ where: { id: product_ids } });
      if (products.length !== product_ids.length) {
        return res.status(404).json({ message: 'One or more specified products for coupon not found.' });
      }
      await coupon.setProducts(products.map(p => p.id)); // به‌روزرسانی ارتباط Many-to-Many
    } else if (product_ids === null || product_ids === []) { // اگر product_ids به صراحت خالی ارسال شد، همه را حذف کن
      await coupon.setProducts([]);
    }

    // 5. به‌روزرسانی ارتباط با کاربران خاص (UserCoupons)
    if (user_ids) { // اگر user_ids ارسال شد، روابط را به‌روزرسانی کن
      const users = await User.findAll({ where: { id: user_ids } });
      if (users.length !== user_ids.length) {
        return res.status(404).json({ message: 'One or more specified users for coupon not found.' });
      }
      await coupon.setUserCoupons(users); // به‌روزرسانی ارتباط Many-to-Many
    } else if (user_ids === null || user_ids === []) { // اگر user_ids به صراحت خالی ارسال شد، همه را حذف کن
      await coupon.setUserCoupons([]);
    }

    res.status(200).json({ message: 'Coupon updated successfully', coupon: coupon });

  } catch (error) {
    console.error(`Error updating coupon: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Server error updating coupon', error: error.message });
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
