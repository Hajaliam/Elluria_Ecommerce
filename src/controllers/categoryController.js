// src/controllers/categoryController.js

const db = require('../../models');
const Category = db.Category;
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer'); // 👈 این خط رو اضافه کنید

// تابع برای ایجاد دسته‌بندی جدید
exports.createCategory = async (req, res) => {
  let { name, description } = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی به فیلدهای متنی
  name = sanitizeString(name);
  description = sanitizeString(description);

  try {
    // بررسی وجود دسته‌بندی با نام تکراری
    const existingCategory = await Category.findOne({ where: { name: name } });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: 'Category with this name already exists.' });
    }

    const newCategory = await Category.create({ name, description });
    res.status(201).json({
      message: 'Category created successfully!',
      category: newCategory,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      message: 'Server error during category creation',
      error: error.message,
    });
  }
};

// تابع برای دریافت لیست همه دسته‌بندی‌ها
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ categories: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      message: 'Server error fetching categories',
      error: error.message,
    });
  }
};

// تابع برای دریافت یک دسته‌بندی بر اساس ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params; // ID از پارامترهای URL گرفته می‌شود

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }
    res.status(200).json({ category: category });
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({
      message: 'Server error fetching category',
      error: error.message,
    });
  }
};

// تابع برای به‌روزرسانی یک دسته‌بندی
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  let { name, description } = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی به فیلدهای متنی
  if (name) name = sanitizeString(name);
  if (description) description = sanitizeString(description);

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // بررسی نام تکراری در صورت تغییر نام
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { name: name },
      });
      if (existingCategory) {
        return res
          .status(409)
          .json({ message: 'Category with this name already exists.' });
      }
    }

    category.name = name || category.name; // اگر نام جدیدی ارسال شد، به‌روزرسانی کن
    category.description = description || category.description; // اگر توضیحات جدیدی ارسال شد، به‌روزرسانی کن
    await category.save(); // ذخیره تغییرات در دیتابیس

    res
      .status(200)
      .json({ message: 'Category updated successfully!', category: category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      message: 'Server error updating category',
      error: error.message,
    });
  }
};

// تابع برای حذف یک دسته‌بندی
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // نکته مهم: قبل از حذف یک دسته‌بندی، باید مطمئن شوید که هیچ محصولی به آن وابسته نیست.
    // یا محصولات وابسته را به دسته‌بندی دیگری منتقل کنید، یا هنگام حذف دسته‌بندی، محصولات وابسته را هم حذف کنید.
    // در مهاجرت شما، onDelete: 'RESTRICT' برای category_id در Product تعیین شده.
    // این یعنی اگر محصولی به این دسته وابسته باشد، حذف دسته ممکن نیست و خطای دیتابیس دریافت می‌کنید.
    // برای مدیریت این خطا، می‌توانید قبل از حذف، محصولات وابسته را بررسی کنید:
    // const productsCount = await db.Product.count({ where: { category_id: id } });
    // if (productsCount > 0) {
    //   return res.status(400).json({ message: 'Cannot delete category: Products are associated with it.' });
    // }

    await category.destroy(); // حذف دسته‌بندی از دیتابیس
    res.status(200).json({ message: 'Category deleted successfully!' });
  } catch (error) {
    console.error('Error deleting category:', error);
    // اضافه کردن مدیریت خطای Foreign Key (اختیاری)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: 'Cannot delete category: Products are associated with it.',
      });
    }
    res.status(500).json({
      message: 'Server error deleting category',
      error: error.message,
    });
  }
};
