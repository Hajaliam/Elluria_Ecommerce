// src/controllers/categoryController.js

const db = require('../../models');
const Category = db.Category;
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer'); // 👈 این خط رو اضافه کنید

// تابع برای ایجاد دسته‌بندی جدید
exports.createCategory = async (req, res) => {
  let { name, description , parent_id} = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی به فیلدهای متنی
  name = sanitizeString(name);
  description = sanitizeString(description);

  const parentIdInt = parent_id ? parseInt(parent_id) : null;

  try {
    // بررسی وجود دسته‌بندی با نام تکراری
    const existingCategory = await Category.findOne({ where: { name: name } });
    if (existingCategory) {
      return res
        .status(409)
        .json({ message: 'Category with this name already exists.' });
    }
    if (parentIdInt) {
      const parentExists = await Category.findByPk(parentIdInt);
      if (!parentExists) {
        return res.status(400).json({ message: 'Parent category not found.' });
      }
    }

    const newCategory = await Category.create({ name, description , parentIdInt });
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
    // مرحله اول: همه دسته‌ها رو بگیر
    const categories = await Category.findAll({
      raw: true,
      order: [['id', 'ASC']],
    });

    // مرحله دوم: دسته‌ها رو به شکل درختی بساز
    const buildTree = (items, parentId = null) => {
      return items
          .filter(item => item.parent_id === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.id),
          }));
    };

    const tree = buildTree(categories);

    res.status(200).json({ categories: tree });
  } catch (error) {
    console.error('Error building category tree:', error);
    res.status(500).json({
      message: 'Server error fetching category tree',
      error: error.message,
    });
  }
};

// تابع برای دریافت یک دسته‌بندی بر اساس ID
exports.getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    // اول بررسی وجود دسته‌بندی
    const category = await Category.findByPk(id, { raw: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // همه دسته‌ها رو بگیر برای ساخت درخت
    const allCategories = await Category.findAll({ raw: true });

    // تابع بازگشتی برای ساخت children
    const buildTree = (parent) => {
      const children = allCategories.filter(cat => cat.parent_id === parent.id);
      return {
        ...parent,
        children: children.map(child => buildTree(child)),
      };
    };

    const categoryTree = buildTree(category);

    res.status(200).json({ category: categoryTree });
  } catch (error) {
    console.error('Error fetching category with children:', error);
    res.status(500).json({
      message: 'Server error fetching category',
      error: error.message,
    });
  }
};

// تابع برای به‌روزرسانی یک دسته‌بندی
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  let { name, description , parent_id } = req.body; // 👈 از let استفاده کنید

  //چک کردن این که آیا واقعا آیدی والد عدد هست یا نه
  const parentIdInt = parent_id ? parseInt(parent_id) : null;
  //جلوگیری از circular reference
  if (parent_id && parseInt(parent_id) === parseInt(id)) {
    return res.status(400).json({ message: 'A category cannot be its own parent.' });
  }
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
    category.parent_id = parentIdInt || category.parent_id // اگر والد جدیدی اضافه شد ، به روزرسانی کن
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
