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
    max_usage_per_user, coupon_group_id, product_ids, user_ids,
    category_ids , max_discount_amount// 👈 فیلد جدید برای دسته‌بندی‌ها
  } = req.body;

  const t = await db.sequelize.transaction(); // 👈 شروع تراکنش

  try {
    // 1. پاکسازی و اعتبارسنجی اولیه
    const sanitizedCode = sanitizeString(code);
    const sanitizedDiscountType = sanitizeString(discount_type);

    if (!sanitizedCode || !sanitizedDiscountType || discount_value === undefined) {
      await t.rollback();
      return res.status(400).json({ message: 'Missing required fields: code, discount_type, discount_value.' });
    }
    if (!['percentage', 'fixed_amount', 'free_shipping'].includes(sanitizedDiscountType)) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid discount_type. Allowed: percentage, fixed_amount, free_shipping.' });
    }
    if (sanitizedDiscountType !== 'free_shipping' && (isNaN(parseFloat(discount_value)) || parseFloat(discount_value) <= 0)) {
      await t.rollback();
      return res.status(400).json({ message: 'discount_value must be a positive number for percentage/fixed coupons.' });
    }
    if (min_amount && isNaN(parseFloat(min_amount))) {
      await t.rollback();
      return res.status(400).json({ message: 'min_amount must be a number.' });
    }

    // 2. گسترش category_ids به شامل شدن فرزندان (اگر وجود داشت)
    let finalCategoryIds = [];
    if (category_ids && category_ids.length > 0) {
      const allCategories = await db.Category.findAll({ attributes: ['id', 'parent_id'], transaction: t });
      const expandedCategoryIdsSet = new Set();
      for (const catId of category_ids) {
        const allChildIds = getDescendantCategoryIds(parseInt(catId, 10), allCategories);
        allChildIds.forEach(id => expandedCategoryIdsSet.add(id));
      }
      finalCategoryIds = [...expandedCategoryIdsSet];
    }


    // 3. بررسی وجود کوپن با کد تکراری
    const existingCoupon = await Coupon.findOne({ where: { code: sanitizedCode }, transaction: t });
    if (existingCoupon) {
      await t.rollback();
      return res.status(409).json({ message: 'Coupon with this code already exists.' });
    }

    // 4. بررسی وجود گروه کوپن
    let couponGroup = null;
    if (coupon_group_id) {
      couponGroup = await db.CouponGroup.findByPk(coupon_group_id, { transaction: t });
      if (!couponGroup) {
        await t.rollback();
        return res.status(404).json({ message: 'CouponGroup not found.' });
      }
    }

    // 5. ایجاد کوپن جدید
    const newCoupon = await Coupon.create({
      code: sanitizedCode,
      discount_type: sanitizedDiscountType,
      discount_value: sanitizedDiscountType === 'free_shipping' ? 0 : parseFloat(discount_value),
      min_amount: min_amount ? parseFloat(min_amount) : 0,
      usage_limit: usage_limit ? parseInt(usage_limit) : null,
      expiry_date: expiry_date ? new Date(expiry_date) : null,
      isActive: isActive === 'true' || isActive === true,
      is_first_purchase_only: is_first_purchase_only === 'true' || is_first_purchase_only === true,
      is_exclusive: is_exclusive === 'true' || is_exclusive === true,
      max_usage_per_user: max_usage_per_user ? parseInt(max_usage_per_user) : null,
      coupon_group_id: couponGroup ? couponGroup.id : null,
      max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null
    }, { transaction: t });

    // 6. ایجاد ارتباط با محصولات خاص (CouponProducts)
    if (product_ids && product_ids.length > 0) {
      const productIdsInt = product_ids.map(id => parseInt(id, 10));
      const products = await db.Product.findAll({ where: { id: productIdsInt }, transaction: t });
      if (products.length !== productIdsInt.length) {
        await t.rollback();
        return res.status(404).json({ message: 'One or more specified products for coupon not found.' });
      }
      // استفاده از setProducts برای ارتباط Many-to-Many
      await newCoupon.setProducts(products, { transaction: t });
    }

    // 7. ایجاد ارتباط با کاربران خاص (UserCoupons)
    if (user_ids && user_ids.length > 0) {
      const userIdsInt = user_ids.map(id => parseInt(id, 10));
      const users = await db.User.findAll({ where: { id: userIdsInt }, transaction: t });
      if (users.length !== userIdsInt.length) {
        await t.rollback();
        return res.status(404).json({ message: 'One or more specified users for coupon not found.' });
      }
      // استفاده از setUsers برای ارتباط Many-to-Many
      await newCoupon.setUsers(users, { transaction: t });
    }

    // 8. ایجاد ارتباط با دسته‌بندی‌های خاص (CouponCategories) 👈 منطق جدید
    if (finalCategoryIds.length > 0) { // استفاده از finalCategoryIds
      const categories = await db.Category.findAll({ where: { id: finalCategoryIds }, transaction: t });
      if (categories.length !== finalCategoryIds.length) {
        await t.rollback();
        return res.status(404).json({ message: 'One or more specified categories for coupon not found after expansion.' });
      }
      // استفاده از setCategories برای ارتباط Many-to-Many
      await newCoupon.setCategories(categories, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: 'Coupon created successfully!', coupon: newCoupon });

  } catch (error) {
    if (t && !t.finished) { await t.rollback(); }
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
    max_usage_per_user, coupon_group_id, product_ids, user_ids,
    category_ids , max_discount_amount
  } = req.body;

  const t = await db.sequelize.transaction();

  try {
    const coupon = await db.Coupon.findByPk(id, { transaction: t });
    if (!coupon) {
      await t.rollback();
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // 1. پاکسازی و اعتبارسنجی
    const sanitizedCode = sanitizeString(code);
    const sanitizedDiscountType = sanitizeString(discount_type);

    if (!sanitizedCode || !sanitizedDiscountType || discount_value === undefined) {
      await t.rollback();
      return res.status(400).json({ message: 'Missing required fields: code, discount_type, discount_value.' });
    }
    if (!['percentage', 'fixed_amount', 'free_shipping'].includes(sanitizedDiscountType)) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid discount_type. Allowed: percentage, fixed_amount, free_shipping.' });
    }
    if (sanitizedDiscountType !== 'free_shipping' && (isNaN(parseFloat(discount_value)) || parseFloat(discount_value) <= 0)) {
      await t.rollback();
      return res.status(400).json({ message: 'discount_value must be a positive number for percentage/fixed coupons.' });
    }
    if (min_amount && isNaN(parseFloat(min_amount))) {
      await t.rollback();
      return res.status(400).json({ message: 'min_amount must be a number.' });
    }
    if (max_discount_amount && isNaN(parseFloat(max_discount_amount))) {
      await t.rollback();
      return res.status(400).json({ message: 'max_discount_amount must be a number.' });
    }

    // بررسی کد تکراری در صورت تغییر کد
    if (sanitizedCode && sanitizedCode !== coupon.code) {
      const existingCoupon = await db.Coupon.findOne({ where: { code: sanitizedCode }, transaction: t });
      if (existingCoupon) {
        await t.rollback();
        return res.status(409).json({ message: 'Coupon with this new code already exists.' });
      }
    }

    // 2. گسترش category_ids به شامل شدن فرزندان (اگر وجود داشت)
    let finalCategoryIds = [];
    if (category_ids && category_ids.length > 0) {
      const allCategories = await db.Category.findAll({ attributes: ['id', 'parent_id'], transaction: t });
      const expandedCategoryIdsSet = new Set();
      for (const catId of category_ids) {
        const allChildIds = getDescendantCategoryIds(parseInt(catId, 10), allCategories);
        allChildIds.forEach(id => expandedCategoryIdsSet.add(id));
      }
      finalCategoryIds = [...expandedCategoryIdsSet];
    }

    // 3. بررسی وجود گروه کوپن
    let couponGroup = null;
    if (coupon_group_id) {
      couponGroup = await db.CouponGroup.findByPk(coupon_group_id, { transaction: t });
      if (!couponGroup) {
        await t.rollback();
        return res.status(404).json({ message: 'CouponGroup not found.' });
      }
    }


    // 4. به‌روزرسانی فیلدهای کوپن
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
    coupon.max_discount_amount = max_discount_amount ? parseInt(max_discount_amount) : null;

    await coupon.save({ transaction: t });

    // 5. به‌روزرسانی ارتباط با محصولات خاص (CouponProducts)
    if (product_ids) { // اگر product_ids ارسال شد، روابط را به‌روزرسانی کن
      const productIdsInt = product_ids.map(id => parseInt(id, 10));
      const products = await db.Product.findAll({ where: { id: productIdsInt }, transaction: t });
      if (products.length !== productIdsInt.length) {
        await t.rollback();
        return res.status(404).json({ message: 'One or more specified products for coupon not found.' });
      }
      // استفاده از setProducts برای ارتباط Many-to-Many
      await coupon.setProducts(products, { transaction: t });
    } else if (product_ids !== undefined) { // اگر product_ids به صراحت خالی (مثل []) یا null ارسال شد، همه را حذف کن
      await coupon.setProducts([], { transaction: t }); // 👈 استفاده از setProducts با آرایه خالی
    }


    // 6. به‌روزرسانی ارتباط با کاربران خاص (UserCoupons)
    if (user_ids) { // اگر user_ids ارسال شد، روابط را به‌روزرسانی کن
      const userIdsInt = user_ids.map(id => parseInt(id, 10));
      const users = await db.User.findAll({ where: { id: userIdsInt }, transaction: t });
      if (users.length !== userIdsInt.length) {
        await t.rollback();
        return res.status(404).json({ message: 'One or more specified users for coupon not found.' });
      }
      // استفاده از setUsers برای ارتباط Many-to-Many
      await coupon.setUsers(users, { transaction: t });
    } else if (user_ids !== undefined) { // اگر user_ids به صراحت خالی (مثل []) یا null ارسال شد، همه را حذف کن
      await coupon.setUsers([], { transaction: t }); // 👈 استفاده از setUsers با آرایه خالی
    }

    // 7. به‌روزرسانی ارتباط با دسته‌بندی‌های خاص (CouponCategories) 👈 منطق جدید
    if (finalCategoryIds.length > 0) { // استفاده از finalCategoryIds
      const categories = await db.Category.findAll({ where: { id: finalCategoryIds }, transaction: t });
      if (categories.length !== finalCategoryIds.length) {
        await t.rollback();
        return res.status(404).json({ message: 'One or more specified categories for coupon not found after expansion.' });
      }
      // استفاده از setCategories برای ارتباط Many-to-Many
      await coupon.setCategories(categories, { transaction: t });
    } else if (category_ids !== undefined) { // اگر category_ids به صراحت خالی (مثل []) یا null ارسال شد، همه را حذف کن
      await coupon.setCategories([], { transaction: t }); // 👈 استفاده از setCategories با آرایه خالی
    }

    await t.commit();
    res.status(200).json({ message: 'Coupon updated successfully', coupon: coupon });

  } catch (error) {
    if (t && !t.finished) { await t.rollback(); }
    console.error('Error updating coupon:', error);
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
