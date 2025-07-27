// src/controllers/adminController.js

const db = require('../../models');
const User = db.User;
const Role = db.Role;
const bcrypt = require('bcrypt'); // برای به‌روزرسانی پسورد
const Sequelize = db.Sequelize;
const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs/promises');
const { parse } = require('csv-parse'); //  (برای واردات CSV)
const multer = require('multer');
const logger = require('../config/logger');
const moment = require('moment');
const { sanitizeString } = require('../utils/sanitizer');
// تابع برای اعتبارسنجی تاریخ
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date) ? new Date() : date;
};
// روت تست ادمین
exports.adminDashboard = (req, res) => {
  res
    .status(200)
    .json({
      message: 'Welcome to the Admin Dashboard, ' + req.user.username + '!',
    });
};

const upload = multer({
  dest: 'temp/', // 👈 فایل‌های آپلودی موقتاً در پوشه temp ذخیره می‌شوند
  limits: { fileSize: 1024 * 1024 * 10 }, // حداکثر حجم فایل 10 مگابایت
});

// تابع برای دریافت همه کاربران (فقط ادمین)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // پسورد را شامل نمی‌کنیم
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
    });
    res.status(200).json({ users: users });
  } catch (error) {
    console.error('Error fetching all users for admin:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching users', error: error.message });
  }
};

// تابع برای دریافت جزئیات یک کاربر بر اساس ID (فقط ادمین)
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ user: user });
  } catch (error) {
    console.error('Error fetching user by ID for admin:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching user', error: error.message });
  }
};

// تابع برای به‌روزرسانی اطلاعات کاربر (توسط ادمین)
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    email,
    password,
    first_name,
    last_name,
    phone_number,
    role_id,
  } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // بررسی نام کاربری یا ایمیل تکراری (اگر تغییر کنند)
    if (
      (username && username !== user.username) ||
      (email && email !== user.email)
    ) {
      const existingUser = await User.findOne({
        where: {
          [Sequelize.Op.or]: [
            { username: username || user.username },
            { email: email || user.email },
          ],
          id: { [Sequelize.Op.ne]: id }, // به جز خود کاربر فعلی
        },
      });
      if (existingUser) {
        return res
          .status(409)
          .json({
            message: 'Username or email already exists for another user.',
          });
      }
    }

    // اگر پسورد ارسال شد، آن را هش کن
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    user.username = username || user.username;
    user.email = email || user.email;
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.phone_number = phone_number || user.phone_number;

    // اگر role_id ارسال شد، مطمئن شویم نقش معتبر است
    if (role_id) {
      const role = await Role.findByPk(role_id);
      if (!role) {
        return res.status(400).json({ message: 'Invalid role ID provided.' });
      }
      user.role_id = role_id;
    }

    await user.save();
    // پسورد را در پاسخ برنمی‌گردانیم
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role_id: user.role_id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    res
      .status(200)
      .json({ message: 'User updated successfully!', user: userResponse });
  } catch (error) {
    console.error('Error updating user by admin:', error);
    res
      .status(500)
      .json({ message: 'Server error updating user', error: error.message });
  }
};

// تابع برای حذف یک کاربر (توسط ادمین)
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // نکته: اگر onDelete: 'RESTRICT' برای FKها در Migrationها تعیین شده باشد،
    // نمی‌توانید کاربری را حذف کنید که سفارش، آدرس، سبد خرید، بررسی یا تاریخچه سفارش دارد.
    // اگر onDelete: 'CASCADE' باشد، همه اطلاعات مرتبط هم حذف می‌شوند.
    // در Migration User ما از CASCADE برای Address و Cart و Review و Advice استفاده کردیم.
    // برای Order و OrderHistory از RESTRICT استفاده شده (چون نباید با حذف کاربر سفارشاتش هم حذف شوند)
    // این یعنی اگر کاربری سفارش یا تاریخچه سفارش داشته باشد، نمی‌توانید آن را حذف کنید.
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully!' });
  } catch (error) {
    console.error('Error deleting user by admin:', error);
    // اگر خطا به دلیل RESTRICT باشد، پیام خطا را واضح‌تر می‌کنیم
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res
        .status(400)
        .json({
          message:
            'Cannot delete user: Associated data (orders/history) exists.',
        });
    }
    res
      .status(500)
      .json({ message: 'Server error deleting user', error: error.message });
  }
};
// تابع برای دریافت گزارش فروش (مثلاً بر اساس بازه زمانی)
exports.getSalesReport = async (req, res) => {
  const { startDate, endDate } = req.query; // تاریخ شروع و پایان از کوئری پارامتر
  const whereClause = {};

  if (startDate) {
    whereClause.createdAt = { [Sequelize.Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      [Sequelize.Op.lte]: new Date(endDate),
    };
  }
  whereClause.payment_status = 'paid'; // فقط سفارشات پرداخت شده

  try {
    // 1. گزارش فروش روزانه (همانند قبل)
    const dailySales = await db.Order.findAll({
      where: whereClause,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'sale_date'],
        [
          Sequelize.fn('SUM', Sequelize.col('total_amount')),
          'daily_sales_amount',
        ],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'daily_orders_count'],
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']],
    });

    // 2. محاسبه مجموع فروش کلی برای بازه زمانی
    const totalSalesAmount = await db.Order.sum('total_amount', {
      where: whereClause,
    });
    const totalOrdersCount = await db.Order.count({
      where: whereClause,
    });

    res.status(200).json({
      sales_report: dailySales,
      summary: {
        // 👈 این بخش جدید است
        total_sales_amount_overall: totalSalesAmount
          ? parseFloat(totalSalesAmount).toFixed(2)
          : '0.00',
        total_orders_count_overall: totalOrdersCount,
      },
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res
      .status(500)
      .json({
        message: 'Server error fetching sales report',
        error: error.message,
      });
  }
};

// تابع برای دریافت گزارش محصولات کم‌موجودی
exports.getLowStockProducts = async (req, res) => {
  const threshold = req.query.threshold || 10; // آستانه موجودی کم (پیش فرض 10)

  try {
    const lowStockProducts = await db.Product.findAll({
      where: {
        stock_quantity: { [Sequelize.Op.lte]: threshold }, // محصولاتی که موجودیشان کمتر یا مساوی آستانه است
      },
      order: [['stock_quantity', 'ASC']],
    });
    res.status(200).json({ low_stock_products: lowStockProducts });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res
      .status(500)
      .json({
        message: 'Server error fetching low stock products',
        error: error.message,
      });
  }
};

// تابع برای دریافت آمار کلی داشبورد (مثلاً تعداد کل کاربران، محصولات، سفارشات، مجموع فروش)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await db.User.count();
    const totalProducts = await db.Product.count();
    const totalOrders = await db.Order.count();
    const totalPaidOrders = await db.Order.count({
      where: { payment_status: 'paid' },
    });
    const totalSalesAmount = await db.Order.sum('total_amount', {
      where: { payment_status: 'paid' },
    });

    res.status(200).json({
      dashboard_stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalPaidOrders,
        totalSalesAmount: totalSalesAmount
          ? parseFloat(totalSalesAmount).toFixed(2)
          : '0.00',
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res
      .status(500)
      .json({
        message: 'Server error fetching dashboard stats',
        error: error.message,
      });
  }
};

// تابع برای صادرات دسته‌بندی‌ها با روش Streaming
exports.exportCategories = async (req, res) => {
  const { format } = req.query;
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `categories_export_${Date.now()}`;

  try {
    const categories = await db.Category.findAll({
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    });

    const categoriesData = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));

    switch (format.toLowerCase()) {
      case 'json':
        res.status(200); // 👈 Status Code اینجا
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(categoriesData, null, 2)); // 👈 استفاده از res.send
        break;

      case 'csv':
        res.status(200); // 👈 Status Code اینجا
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'name', title: 'Name' },
            { id: 'description', title: 'Description' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        categoriesData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end(); // پایان پاسخ
        logger.info(
          `CSV export completed for ${categoriesData.length} categories.`,
        );
        break;

      case 'excel':
        res.status(200); // 👈 Status Code اینجا
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Categories');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Description', key: 'description', width: 50 },
          { header: 'Created At', key: 'createdAt', width: 25 },
          { header: 'Updated At', key: 'updatedAt', width: 25 },
        ];

        worksheet.addRows(categoriesData);

        // 👈 استفاده از pipe برای Streaming مستقیم (روش مطمئن‌تر)
        await workbook.xlsx.write(res); // این خودش response stream را مدیریت می‌کند و res.end() را فراخوانی می‌کند
        logger.info(
          `Excel export completed for ${categoriesData.length} categories.`,
        );
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting categories (streaming): ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end(); // اگر خطا بعد از ارسال هدرها بود، Stream را ببندید
    }
  }
};

//تابع برای صادرات محصولات با روش Streaming
exports.exportProducts = async (req, res) => {
  const { format } = req.query;
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `products_export_${Date.now()}`;
  res.status(200);

  try {
    const products = await db.Product.findAll({
      attributes: [
        'id',
        'name',
        'description',
        'price',
        'stock_quantity',
        'slug',
        'image_url',
        'views_count',
        'sold_count',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    });

    const productsData = products.map((prod) => ({
      id: prod.id,
      name: prod.name,
      description: prod.description,
      price: parseFloat(prod.price),
      stock_quantity: prod.stock_quantity,
      slug: prod.slug,
      image_url: prod.image_url,
      category_name: prod.category ? prod.category.name : 'N/A', // نام دسته‌بندی
      views_count: prod.views_count,
      sold_count: prod.sold_count,
      createdAt: prod.createdAt.toISOString(),
      updatedAt: prod.updatedAt.toISOString(),
    }));

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(productsData, null, 2));
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'name', title: 'Name' },
            { id: 'description', title: 'Description' },
            { id: 'price', title: 'Price' },
            { id: 'stock_quantity', title: 'Stock Quantity' },
            { id: 'slug', title: 'Slug' },
            { id: 'image_url', title: 'Image URL' },
            { id: 'category_name', title: 'Category' },
            { id: 'views_count', title: 'Views' },
            { id: 'sold_count', title: 'Sold' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        productsData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(
          `CSV export completed for ${productsData.length} products.`,
        );
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Name', key: 'name', width: 30 },
          { header: 'Description', key: 'description', width: 50 },
          { header: 'Price', key: 'price', width: 15 },
          { header: 'Stock Quantity', key: 'stock_quantity', width: 15 },
          { header: 'Slug', key: 'slug', width: 25 },
          { header: 'Image URL', key: 'image_url', width: 40 },
          { header: 'Category', key: 'category_name', width: 20 },
          { header: 'Views', key: 'views_count', width: 10 },
          { header: 'Sold', key: 'sold_count', width: 10 },
          { header: 'Created At', key: 'createdAt', width: 25 },
          { header: 'Updated At', key: 'updatedAt', width: 25 },
        ];

        worksheet.addRows(productsData);
        await workbook.xlsx.write(res);
        logger.info(
          `Excel export completed for ${productsData.length} products.`,
        );
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting products (streaming): ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//تابع برای صادرات کاربران در فرمت‌های مختلف
exports.exportUsers = async (req, res) => {
  const { format } = req.query;
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `users_export_${Date.now()}`;
  res.status(200);

  try {
    const users = await db.User.findAll({
      attributes: [
        'id',
        'username',
        'email',
        'first_name',
        'last_name',
        'phone_number',
        'role_id',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: db.Role,
          as: 'role',
          attributes: ['name'],
        },
      ],
    });

    const usersData = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      role_name: user.role ? user.role.name : 'N/A', // نام نقش
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(usersData, null, 2));
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'username', title: 'Username' },
            { id: 'email', title: 'Email' },
            { id: 'first_name', title: 'First Name' },
            { id: 'last_name', title: 'Last Name' },
            { id: 'phone_number', title: 'Phone Number' },
            { id: 'role_name', title: 'Role' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        usersData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(`CSV export completed for ${usersData.length} users.`);
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Username', key: 'username', width: 20 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'First Name', key: 'first_name', width: 20 },
          { header: 'Last Name', key: 'last_name', width: 20 },
          { header: 'Phone Number', key: 'phone_number', width: 20 },
          { header: 'Role', key: 'role_name', width: 15 },
          { header: 'Created At', key: 'createdAt', width: 25 },
          { header: 'Updated At', key: 'updatedAt', width: 25 },
        ];

        worksheet.addRows(usersData);
        await workbook.xlsx.write(res);
        logger.info(`Excel export completed for ${usersData.length} users.`);
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting users (streaming): ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//  تابع برای صادرات گزارش‌ها در فرمت‌های مختلف
exports.exportReports = async (req, res) => {
  const { reportType, format, startDate, endDate, threshold } = req.query;
  const allowedReportTypes = ['sales', 'low_stock'];
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!reportType || !allowedReportTypes.includes(reportType.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing reportType. Allowed types are: sales, low_stock.',
      });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `${reportType}_report_export_${Date.now()}`;
  res.status(200);

  let reportData = [];
  let headers = [];
  let worksheetName = 'Report';
  let jsonResponseObject = {};

  try {
    switch (reportType.toLowerCase()) {
      case 'sales':
        const salesWhereClause = {};
        if (startDate) {
          salesWhereClause.createdAt = {
            [db.Sequelize.Op.gte]: moment(startDate).startOf('day').toDate(),
          };
        }
        if (endDate) {
          salesWhereClause.createdAt = {
            ...salesWhereClause.createdAt,
            [db.Sequelize.Op.lte]: moment(endDate).endOf('day').toDate(),
          };
        }
        salesWhereClause.payment_status = 'paid';

        const sales = await db.Order.findAll({
          where: salesWhereClause,
          attributes: [
            [
              db.Sequelize.literal('DATE_TRUNC(\'day\', "Order"."createdAt")'),
              'sale_date',
            ],
            [
              db.Sequelize.fn(
                'COALESCE',
                db.Sequelize.fn('SUM', db.Sequelize.col('total_amount')),
                0,
              ),
              'daily_sales_amount',
            ],
            [
              db.Sequelize.fn(
                'COALESCE',
                db.Sequelize.fn('COUNT', db.Sequelize.col('id')),
                0,
              ),
              'daily_orders_count',
            ],
          ],
          group: [
            db.Sequelize.literal('DATE_TRUNC(\'day\', "Order"."createdAt")'),
          ],
          order: [
            [
              db.Sequelize.literal('DATE_TRUNC(\'day\', "Order"."createdAt")'),
              'ASC',
            ],
          ],
        });

        reportData = sales.map((s) => ({
          sale_date: s.get('sale_date'),
          daily_sales_amount: parseFloat(s.get('daily_sales_amount')),
          daily_orders_count: parseInt(s.get('daily_orders_count')),
        }));

        const totalSalesAmount = await db.Order.sum('total_amount', {
          where: salesWhereClause,
        });
        const totalOrdersCount = await db.Order.count({
          where: salesWhereClause,
        });

        jsonResponseObject = {
          sales_report: reportData,
          summary: {
            total_sales_amount_overall: totalSalesAmount
              ? parseFloat(totalSalesAmount).toFixed(2)
              : '0.00',
            total_orders_count_overall: totalOrdersCount,
          },
        };

        headers = [
          { id: 'sale_date', title: 'Sale Date' },
          { id: 'daily_sales_amount', title: 'Daily Sales Amount' },
          { id: 'daily_orders_count', title: 'Daily Orders Count' },
        ];
        worksheetName = 'Sales Report';
        break;

      case 'low_stock':
        const lowStockThreshold = threshold || 10;
        const lowStockProducts = await db.Product.findAll({
          where: {
            stock_quantity: { [db.Sequelize.Op.lte]: lowStockThreshold },
          },
          order: [['stock_quantity', 'ASC']],
          attributes: ['id', 'name', 'stock_quantity', 'category_id', 'price'],
        });
        reportData = lowStockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          stock_quantity: p.stock_quantity,
          category_id: p.category_id,
          price: parseFloat(p.price),
        }));
        headers = [
          { id: 'id', title: 'Product ID' },
          { id: 'name', title: 'Product Name' },
          { id: 'stock_quantity', title: 'Stock Quantity' },
          { id: 'category_id', title: 'Category ID' },
          { id: 'price', title: 'Price' },
        ];
        worksheetName = 'Low Stock Products';
        jsonResponseObject = { low_stock_products: reportData };
        break;

      default:
        return res.status(400).json({ message: 'Unsupported report type.' });
    }

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(jsonResponseObject, null, 2));
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({ header: headers });
        res.write(csvStringifier.getHeaderString());
        reportData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(`CSV export completed for ${reportType} report.`);
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(worksheetName);

        worksheet.columns = headers.map((h) => ({
          header: h.title,
          key: h.id,
          width: 20,
        }));
        worksheet.addRows(reportData);

        await workbook.xlsx.write(res);
        logger.info(`Excel export completed for ${reportType} report.`);
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting ${reportType} report: ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//  تابع برای صادرات سفارش‌ها در فرمت‌های مختلف
exports.exportOrders = async (req, res) => {
  const { format, startDate, endDate, status, userId } = req.query; // فیلترها
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `orders_export_${Date.now()}`;
  res.status(200);

  const whereClause = {};
  if (startDate) {
    whereClause.createdAt = { [db.Sequelize.Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      [db.Sequelize.Op.lte]: new Date(endDate),
    };
  }
  if (status) {
    whereClause.status = status;
  }
  if (userId) {
    whereClause.user_id = userId;
  }

  try {
    const orders = await db.Order.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: [
            'username',
            'email',
            'first_name',
            'last_name',
            'phone_number',
          ],
        },
        {
          model: db.Address,
          as: 'shippingAddress',
          attributes: ['street', 'city', 'state', 'zip_code', 'country'],
        },
        {
          model: db.Coupon,
          as: 'coupon',
          attributes: ['code', 'discount_type', 'discount_value'],
        },
        {
          model: db.OrderItem,
          as: 'orderItems',
          include: [
            {
              model: db.Product,
              as: 'product',
              attributes: ['name', 'price', 'slug'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // مسطح کردن داده‌های سفارش برای CSV/Excel
    const ordersData = [];
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        ordersData.push({
          order_id: order.id,
          order_date: order.createdAt.toISOString(),
          order_status: order.status,
          payment_status: order.payment_status,
          total_amount: parseFloat(order.total_amount),
          coupon_code: order.coupon ? order.coupon.code : 'N/A',
          coupon_discount: order.coupon
            ? parseFloat(order.coupon.discount_value)
            : 0,

          customer_username: order.user ? order.user.username : 'N/A',
          customer_email: order.user ? order.user.email : 'N/A',
          customer_first_name: order.user ? order.user.first_name : 'N/A',
          customer_last_name: order.user ? order.user.last_name : 'N/A',
          customer_phone: order.user ? order.user.phone_number : 'N/A',

          shipping_street: order.shippingAddress
            ? order.shippingAddress.street
            : 'N/A',
          shipping_city: order.shippingAddress
            ? order.shippingAddress.city
            : 'N/A',
          shipping_state: order.shippingAddress
            ? order.shippingAddress.state
            : 'N/A',
          shipping_zip_code: order.shippingAddress
            ? order.shippingAddress.zip_code
            : 'N/A',
          shipping_country: order.shippingAddress
            ? order.shippingAddress.country
            : 'N/A',

          product_name: item.product ? item.product.name : 'N/A',
          product_slug: item.product ? item.product.slug : 'N/A',
          product_quantity: item.quantity,
          product_price_at_purchase: parseFloat(item.price_at_purchase),
        });
      });
      if (order.orderItems.length === 0) {
        // اگر سفارشی آیتم نداشت، یک ردیف خالی برای سفارش اصلی اضافه کن
        ordersData.push({
          order_id: order.id,
          order_date: order.createdAt.toISOString(),
          order_status: order.status,
          payment_status: order.payment_status,
          total_amount: parseFloat(order.total_amount),
          coupon_code: order.coupon ? order.coupon.code : 'N/A',
          coupon_discount: order.coupon
            ? parseFloat(order.coupon.discount_value)
            : 0,

          customer_username: order.user ? order.user.username : 'N/A',
          customer_email: order.user ? order.user.email : 'N/A',
          customer_first_name: order.user ? order.user.first_name : 'N/A',
          customer_last_name: order.user ? order.user.last_name : 'N/A',
          customer_phone: order.user ? order.user.phone_number : 'N/A',

          shipping_street: order.shippingAddress
            ? order.shippingAddress.street
            : 'N/A',
          shipping_city: order.shippingAddress
            ? order.shippingAddress.city
            : 'N/A',
          shipping_state: order.shippingAddress
            ? order.shippingAddress.state
            : 'N/A',
          shipping_zip_code: order.shippingAddress
            ? order.shippingAddress.zip_code
            : 'N/A',
          shipping_country: order.shippingAddress
            ? order.shippingAddress.country
            : 'N/A',

          product_name: 'N/A', // برای آیتم‌های خالی
          product_slug: 'N/A',
          product_quantity: 0,
          product_price_at_purchase: 0,
        });
      }
    });

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(orders, null, 2)); // برای JSON، کل آبجکت order را می‌دهیم
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'order_id', title: 'Order ID' },
            { id: 'order_date', title: 'Order Date' },
            { id: 'order_status', title: 'Order Status' },
            { id: 'payment_status', title: 'Payment Status' },
            { id: 'total_amount', title: 'Total Amount' },
            { id: 'coupon_code', title: 'Coupon Code' },
            { id: 'coupon_discount', title: 'Coupon Discount' },
            { id: 'customer_username', title: 'Customer Username' },
            { id: 'customer_email', title: 'Customer Email' },
            { id: 'customer_first_name', title: 'Customer First Name' },
            { id: 'customer_last_name', title: 'Customer Last Name' },
            { id: 'customer_phone', title: 'Customer Phone' },
            { id: 'shipping_street', title: 'Shipping Street' },
            { id: 'shipping_city', title: 'Shipping City' },
            { id: 'shipping_state', title: 'Shipping State' },
            { id: 'shipping_zip_code', title: 'Shipping Zip Code' },
            { id: 'shipping_country', title: 'Shipping Country' },
            { id: 'product_name', title: 'Product Name' },
            { id: 'product_slug', title: 'Product Slug' },
            { id: 'product_quantity', title: 'Product Quantity' },
            { id: 'product_price_at_purchase', title: 'Price At Purchase' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        ordersData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(`CSV export completed for ${orders.length} orders.`);
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        worksheet.columns = [
          { header: 'Order ID', key: 'order_id', width: 10 },
          { header: 'Order Date', key: 'order_date', width: 20 },
          { header: 'Order Status', key: 'order_status', width: 15 },
          { header: 'Payment Status', key: 'payment_status', width: 15 },
          { header: 'Total Amount', key: 'total_amount', width: 15 },
          { header: 'Coupon Code', key: 'coupon_code', width: 15 },
          { header: 'Coupon Discount', key: 'coupon_discount', width: 15 },
          { header: 'Customer Username', key: 'customer_username', width: 20 },
          { header: 'Customer Email', key: 'customer_email', width: 30 },
          {
            header: 'Customer First Name',
            key: 'customer_first_name',
            width: 20,
          },
          {
            header: 'Customer Last Name',
            key: 'customer_last_name',
            width: 20,
          },
          { header: 'Customer Phone', key: 'customer_phone', width: 20 },
          { header: 'Shipping Street', key: 'shipping_street', width: 30 },
          { header: 'Shipping City', key: 'shipping_city', width: 15 },
          { header: 'Shipping State', key: 'shipping_state', width: 15 },
          { header: 'Shipping Zip', key: 'shipping_zip_code', width: 15 },
          { header: 'Shipping Country', key: 'shipping_country', width: 15 },
          { header: 'Product Name', key: 'product_name', width: 30 },
          { header: 'Product Slug', key: 'product_slug', width: 20 },
          { header: 'Product Quantity', key: 'product_quantity', width: 15 },
          {
            header: 'Price At Purchase',
            key: 'product_price_at_purchase',
            width: 20,
          },
        ];

        worksheet.addRows(ordersData);
        await workbook.xlsx.write(res);
        logger.info(`Excel export completed for ${orders.length} orders.`);
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting orders: ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//تابع برای صادرات تراکنش‌ها (Payments) در فرمت‌های مختلف
exports.exportPayments = async (req, res) => {
  const { format, startDate, endDate, status, method } = req.query; // فیلترها
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `payments_export_${Date.now()}`;
  res.status(200);

  const whereClause = {};
  if (startDate) {
    whereClause.payment_date = { [db.Sequelize.Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    whereClause.payment_date = {
      ...whereClause.payment_date,
      [db.Sequelize.Op.lte]: new Date(endDate),
    };
  }
  if (status) {
    whereClause.status = status;
  }
  if (method) {
    whereClause.method = method;
  }

  try {
    const payments = await db.Payment.findAll({
      where: whereClause,
      include: [
        {
          model: db.Order,
          as: 'order',
          attributes: ['id', 'user_id', 'total_amount', 'status'],
          include: [
            { model: db.User, as: 'user', attributes: ['username', 'email'] },
          ],
        },
      ],
      order: [['payment_date', 'DESC']],
    });

    // مسطح کردن داده‌های تراکنش برای CSV/Excel
    const paymentsData = payments.map((payment) => ({
      id: payment.id,
      transaction_id: payment.transaction_id,
      order_id: payment.order.id,
      customer_username: payment.order.user
        ? payment.order.user.username
        : 'N/A',
      customer_email: payment.order.user ? payment.order.user.email : 'N/A',
      amount: parseFloat(payment.amount),
      method: payment.method,
      status: payment.status,
      payment_date: payment.payment_date.toISOString(),
      refunded: payment.refunded,
      refund_reason: payment.refund_reason,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    }));

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(payments, null, 2)); // برای JSON، کل آبجکت payment را می‌دهیم
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'transaction_id', title: 'Transaction ID' },
            { id: 'order_id', title: 'Order ID' },
            { id: 'customer_username', title: 'Customer Username' },
            { id: 'customer_email', title: 'Customer Email' },
            { id: 'amount', title: 'Amount' },
            { id: 'method', title: 'Payment Method' },
            { id: 'status', title: 'Status' },
            { id: 'payment_date', title: 'Payment Date' },
            { id: 'refunded', title: 'Refunded' },
            { id: 'refund_reason', title: 'Refund Reason' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        paymentsData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(
          `CSV export completed for ${paymentsData.length} payments.`,
        );
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Payments');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Transaction ID', key: 'transaction_id', width: 30 },
          { header: 'Order ID', key: 'order_id', width: 15 },
          { header: 'Customer Username', key: 'customer_username', width: 20 },
          { header: 'Customer Email', key: 'customer_email', width: 30 },
          { header: 'Amount', key: 'amount', width: 15 },
          { header: 'Payment Method', key: 'method', width: 15 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Payment Date', key: 'payment_date', width: 25 },
          { header: 'Refunded', key: 'refunded', width: 10 },
          { header: 'Refund Reason', key: 'refund_reason', width: 30 },
          { header: 'Created At', key: 'createdAt', width: 25 },
          { header: 'Updated At', key: 'updatedAt', width: 25 },
        ];

        worksheet.addRows(paymentsData);
        await workbook.xlsx.write(res);
        logger.info(
          `Excel export completed for ${paymentsData.length} payments.`,
        );
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting payments: ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//تابع برای صادرات کوپن ها و تخفیف ها
exports.exportCoupons = async (req, res) => {
  const { format, status, min_amount, discount_type } = req.query; // فیلترها
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `coupons_export_${Date.now()}`;
  res.status(200);

  const whereClause = {};
  if (status) {
    whereClause.isActive = status.toLowerCase() === 'true';
  }
  if (min_amount) {
    whereClause.min_amount = { [db.Sequelize.Op.gte]: min_amount };
  }
  if (discount_type) {
    whereClause.discount_type = discount_type;
  }

  try {
    const coupons = await db.Coupon.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    const couponsData = coupons.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
      min_amount: parseFloat(coupon.min_amount),
      usage_limit: coupon.usage_limit,
      used_count: coupon.used_count,
      expiry_date: coupon.expiry_date || 'N/A', // 👈 **اینجا اصلاح شد!** از مقدار رشته‌ای مستقیم استفاده می‌کنیم
      isActive: coupon.isActive,
      createdAt: coupon.createdAt.toISOString(),
      updatedAt: coupon.updatedAt.toISOString(),
    }));

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(coupons, null, 2));
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'code', title: 'Code' },
            { id: 'discount_type', title: 'Discount Type' },
            { id: 'discount_value', title: 'Discount Value' },
            { id: 'min_amount', title: 'Min Amount' },
            { id: 'usage_limit', title: 'Usage Limit' },
            { id: 'used_count', title: 'Used Count' },
            { id: 'expiry_date', title: 'Expiry Date' },
            { id: 'isActive', title: 'Is Active' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        couponsData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(`CSV export completed for ${couponsData.length} coupons.`);
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Coupons');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Code', key: 'code', width: 20 },
          { header: 'Discount Type', key: 'discount_type', width: 15 },
          { header: 'Discount Value', key: 'discount_value', width: 15 },
          { header: 'Min Amount', key: 'min_amount', width: 15 },
          { header: 'Usage Limit', key: 'usage_limit', width: 15 },
          { header: 'Used Count', key: 'used_count', width: 15 },
          { header: 'Expiry Date', key: 'expiry_date', width: 15 },
          { header: 'Is Active', key: 'isActive', width: 10 },
          { header: 'Created At', key: 'createdAt', width: 25 },
          { header: 'Updated At', key: 'updatedAt', width: 25 },
        ];

        worksheet.addRows(couponsData);
        await workbook.xlsx.write(res);
        logger.info(
          `Excel export completed for ${couponsData.length} coupons.`,
        );
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting coupons: ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//تابع برای صادرات نظرات محصولات
exports.exportReviews = async (req, res) => {
  const { format, productId, minRating, maxRating } = req.query; // فیلترها
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `reviews_export_${Date.now()}`;
  res.status(200);

  const whereClause = {};
  if (productId) {
    whereClause.product_id = productId;
  }
  if (minRating) {
    whereClause.rating = { [db.Sequelize.Op.gte]: minRating };
  }
  if (maxRating) {
    whereClause.rating = {
      ...whereClause.rating,
      [db.Sequelize.Op.lte]: maxRating,
    };
  }

  try {
    const reviews = await db.Review.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['username', 'email', 'first_name', 'last_name'],
        },
        { model: db.Product, as: 'product', attributes: ['name', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const reviewsData = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      product_name: review.product ? review.product.name : 'N/A',
      product_slug: review.product ? review.product.slug : 'N/A',
      username: review.user ? review.user.username : 'N/A',
      user_email: review.user ? review.user.email : 'N/A',
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    }));

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(reviews, null, 2));
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'rating', title: 'Rating' },
            { id: 'comment', title: 'Comment' },
            { id: 'product_name', title: 'Product Name' },
            { id: 'product_slug', title: 'Product Slug' },
            { id: 'username', title: 'Username' },
            { id: 'user_email', title: 'User Email' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        reviewsData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(`CSV export completed for ${reviewsData.length} reviews.`);
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reviews');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Rating', key: 'rating', width: 10 },
          { header: 'Comment', key: 'comment', width: 50 },
          { header: 'Product Name', key: 'product_name', width: 30 },
          { header: 'Product Slug', key: 'product_slug', width: 25 },
          { header: 'Username', key: 'username', width: 20 },
          { header: 'User Email', key: 'user_email', width: 30 },
          { header: 'Created At', key: 'createdAt', width: 25 },
          { header: 'Updated At', key: 'updatedAt', width: 25 },
        ];

        worksheet.addRows(reviewsData);
        await workbook.xlsx.write(res);
        logger.info(
          `Excel export completed for ${reviewsData.length} reviews.`,
        );
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting reviews: ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//تابع برای گزارش گیری موجودی محصولات
exports.exportInventory = async (req, res) => {
  const { format, categoryId } = req.query; // 👈 categoryId را اضافه کنید
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res
      .status(400)
      .json({
        message:
          'Invalid or missing format. Allowed formats are: json, csv, excel.',
      });
  }

  const filenameBase = `inventory_export_${Date.now()}`;
  res.status(200);

  const whereClause = {}; // 👈 whereClause را تعریف کنید
  if (categoryId) {
    // 👈 اگر categoryId وجود داشت، فیلتر کنید
    whereClause.category_id = categoryId;
  }

  try {
    const inventoryData = await db.Product.findAll({
      where: whereClause, // 👈 whereClause را به کوئری اضافه کنید
      attributes: [
        'id',
        'name',
        'stock_quantity',
        'sold_count',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
      order: [['name', 'ASC']],
    });

    const exportedData = inventoryData.map((prod) => ({
      id: prod.id,
      name: prod.name,
      stock_quantity: prod.stock_quantity,
      sold_count: prod.sold_count,
      category_name: prod.category ? prod.category.name : 'N/A',
      createdAt: prod.createdAt.toISOString(),
      updatedAt: prod.updatedAt.toISOString(),
    }));

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.json`,
        );
        res.send(JSON.stringify(exportedData, null, 2));
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.csv`,
        );

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'id', title: 'Product ID' },
            { id: 'name', title: 'Product Name' },
            { id: 'stock_quantity', title: 'Stock Quantity' },
            { id: 'sold_count', title: 'Sold Count' },
            { id: 'category_name', title: 'Category' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
          ],
        });

        res.write(csvStringifier.getHeaderString());
        exportedData.forEach((row) => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(`CSV export completed for inventory.`);
        break;

      case 'excel':
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${filenameBase}.xlsx`,
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Inventory');

        worksheet.columns = [
          { header: 'Product ID', key: 'id', width: 10 },
          { header: 'Product Name', key: 'name', width: 30 },
          { header: 'Stock Quantity', key: 'stock_quantity', width: 15 },
          { header: 'Sold Count', key: 'sold_count', width: 15 },
          { header: 'Category', key: 'category_name', width: 20 },
          { header: 'Created At', key: 'createdAt', width: 25 },
          { header: 'Updated At', key: 'updatedAt', width: 25 },
        ];

        worksheet.addRows(exportedData);
        await workbook.xlsx.write(res);
        logger.info(`Excel export completed for inventory.`);
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting inventory: ${error.message}`, {
      stack: error.stack,
    });
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

//تابع برای دریافت پرفروش ترین محصولات بر اساس دسته بندی و بازه زمانی
exports.getBestSellingProducts = async (req, res) => {
  const { startDate, endDate, categoryId, limit } = req.query;

  const whereClause = {};
  if (startDate) {
    whereClause.createdAt = { [db.Sequelize.Op.gte]: new Date(startDate) };
  }
  if (endDate) {
    whereClause.createdAt = { ...whereClause.createdAt, [db.Sequelize.Op.lte]: new Date(endDate) };
  }

  const productWhereClause = {};
  if (categoryId) {
    productWhereClause.category_id = categoryId;
  }

  const itemsLimit = limit ? parseInt(limit) : 10; // پیش‌فرض 10 محصول پرفروش

  try {
    // OrderItems را با Products و Order Join می‌کنیم
    const bestSellingItems = await db.OrderItem.findAll({
      attributes: [
        'product_id',
        [db.Sequelize.fn('SUM', db.Sequelize.col('quantity')), 'total_sold_quantity'], // 👈 ارجاع مستقیم به 'quantity'
        // 👈 ارجاع مستقیم و صریح به ستون‌ها در literal برای total_revenue
        [db.Sequelize.literal('SUM(quantity * "OrderItem"."price_at_purchase")'), 'total_revenue']
      ],
      include: [
        {
          model: db.Order,
          as: 'order',
          where: whereClause,
          attributes: [],
          required: true
        },
        {
          model: db.Product,
          as: 'product',
          where: productWhereClause,
          attributes: ['name', 'slug', 'image_url', 'price'],
          required: true
        }
      ],
      group: ['product_id', 'product.id', 'product.name', 'product.slug', 'product.image_url', 'product.price'],
      order: [[db.Sequelize.literal('total_sold_quantity'), 'DESC']],
      limit: itemsLimit
    });

    const bestSellingProducts = bestSellingItems.map(item => ({
      product_id: item.product_id,
      product_name: item.product.name,
      product_slug: item.product.slug,
      product_image_url: item.product.image_url,
      product_price: parseFloat(item.product.price),
      total_sold_quantity: parseInt(item.get('total_sold_quantity')),
      total_revenue: parseFloat(item.get('total_revenue'))
    }));

    res.status(200).json({ best_selling_products: bestSellingProducts });

  } catch (error) {
    logger.error(`Error fetching best-selling products: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Server error fetching best-selling products', error: error.message });
  }
};

//تابع برای دریافت سود حاصل از فروش در بازه زمانی انتخابی
exports.getProfitReport = async (req, res) => {
  const { startDate, endDate, format , groupBy } = req.query; // فیلترها و فرمت خروجی
  const allowedFormats = ['json', 'csv', 'excel'];

  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: json, csv, excel.' });
  }

  const filenameBase = `profit_report_export_${Date.now()}`;
  res.status(200);

  const whereClause = {};
  if (startDate) {
    whereClause.transaction_date = { [db.Sequelize.Op.gte]: moment(startDate).startOf('day').toDate() };
  }
  if (endDate) {
    whereClause.transaction_date = { ...whereClause.transaction_date, [db.Sequelize.Op.lte]: moment(endDate).endOf('day').toDate() };
  }

  try {
    const profitLogs = await db.ProfitLog.findAll({
      where: whereClause,
      attributes: [
        'order_id', 'order_item_id', 'product_id', 'item_quantity',
        'sell_price_at_purchase', 'buy_price_at_purchase', 'profit_per_item',
        'total_profit_amount', 'transaction_date'
      ],
      include: [
        { model: db.Product, as: 'product', attributes: ['name', 'slug'] }, // برای جزئیات محصول
        { model: db.Order, as: 'order', attributes: ['total_amount', 'status', 'payment_status'] } // برای جزئیات سفارش
      ],
      order: [['transaction_date', 'DESC']]
    });
    const uniqueOrderCount = new Set(profitLogs.map(log => log.order_id)).size;

    //منطق دسته بندی بر اساس روز و هفته و ماه
    let groupedSummary = [];
    if (groupBy && ['day', 'week', 'month'].includes(groupBy)) {
      const groupedMap = new Map();

      for (const log of profitLogs) {
        let key;
        switch (groupBy) {
          case 'day':
            key = moment(log.transaction_date).format('YYYY-MM-DD');
            break;
          case 'week':
            key = moment(log.transaction_date).startOf('isoWeek').format('YYYY-[W]WW');
            break;
          case 'month':
            key = moment(log.transaction_date).format('YYYY-MM');
            break;
        }

        if (!groupedMap.has(key)) {
          groupedMap.set(key, 0);
        }
        groupedMap.set(key, groupedMap.get(key) + parseFloat(log.total_profit_amount));
      }

      groupedSummary = Array.from(groupedMap.entries()).map(([period, total_profit]) => ({
        period,
        total_profit: total_profit.toFixed(2)
      }));
    }

    const profitData = profitLogs.map(log => ({
      order_id: log.order_id,
      order_item_id: log.order_item_id,
      product_id: log.product_id,
      product_name: log.product ? log.product.name : 'N/A',
      item_quantity: log.item_quantity,
      sell_price_at_purchase: parseFloat(log.sell_price_at_purchase),
      buy_price_at_purchase: parseFloat(log.buy_price_at_purchase),
      profit_per_item: parseFloat(log.profit_per_item),
      total_profit_amount: parseFloat(log.total_profit_amount),
      transaction_date: log.transaction_date.toISOString(),
      order_total_amount: log.order ? parseFloat(log.order.total_amount) : 'N/A',
      order_status: log.order ? log.order.status : 'N/A',
      order_payment_status: log.order ? log.order.payment_status : 'N/A',
    }));

    // محاسبه مجموع سود کلی و تعداد لاگ‌ها برای خلاصه (اگر JSON باشد)
    const totalProfitOverall = profitLogs.reduce((sum, log) => sum + parseFloat(log.total_profit_amount), 0);
    const totalLogsCount = profitLogs.length;

    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.json`);
        res.send(JSON.stringify({
          profit_report: profitData,
          summary: {
            total_profit_overall: totalProfitOverall.toFixed(2),
            total_profit_logs_count: totalLogsCount,
            total_unique_orders: uniqueOrderCount,
            ...(groupedSummary.length > 0 && { grouped_summary: groupedSummary })
          }
        }, null, 2));
        break;

      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.csv`);

        const csvStringifier = createCsvStringifier({
          header: [
            { id: 'order_id', title: 'Order ID' },
            { id: 'order_item_id', title: 'Order Item ID' },
            { id: 'product_id', title: 'Product ID' },
            { id: 'product_name', title: 'Product Name' },
            { id: 'item_quantity', title: 'Quantity' },
            { id: 'sell_price_at_purchase', title: 'Sell Price' },
            { id: 'buy_price_at_purchase', title: 'Buy Price' },
            { id: 'profit_per_item', title: 'Profit Per Item' },
            { id: 'total_profit_amount', title: 'Total Profit' },
            { id: 'transaction_date', title: 'Date' },
            { id: 'order_total_amount', title: 'Order Total' },
            { id: 'order_status', title: 'Order Status' },
            { id: 'order_payment_status', title: 'Payment Status' }
          ]
        });
        res.write(`Total Profit Overall,${totalProfitOverall.toFixed(2)}\n`);
        res.write(`Total Profit Logs Count,${totalLogsCount}\n`);
        res.write(`Total Unique Orders,${uniqueOrderCount}\n`);
        // افزودن خلاصه گروه‌بندی‌شده (اگه وجود داره)
        if (groupedSummary.length > 0) {
          res.write(`\nGrouped Summary by ${groupBy.toUpperCase()}\n`);
          res.write('Period,Total Profit\n');
          groupedSummary.forEach(({ period, total_profit }) => {
            res.write(`${period},${total_profit}\n`);
          });
        }

        res.write('\n'); // فاصله قبل از هدر جدول اصلی
        res.write(csvStringifier.getHeaderString());
        profitData.forEach(row => {
          res.write(csvStringifier.stringifyRecords([row]));
        });
        res.end();
        logger.info(`CSV export completed for profit report.`);
        break;

      case 'excel':
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.xlsx`);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Profit Report');

        worksheet.columns = [
          { header: 'Order ID', key: 'order_id', width: 10 },
          { header: 'Order Item ID', key: 'order_item_id', width: 15 },
          { header: 'Product ID', key: 'product_id', width: 15 },
          { header: 'Product Name', key: 'product_name', width: 30 },
          { header: 'Quantity', key: 'item_quantity', width: 10 },
          { header: 'Sell Price', key: 'sell_price_at_purchase', width: 15 },
          { header: 'Buy Price', key: 'buy_price_at_purchase', width: 15 },
          { header: 'Profit Per Item', key: 'profit_per_item', width: 15 },
          { header: 'Total Profit', key: 'total_profit_amount', width: 15 },
          { header: 'Date', key: 'transaction_date', width: 25 },
          { header: 'Order Total', key: 'order_total_amount', width: 15 },
          { header: 'Order Status', key: 'order_status', width: 15 },
          { header: 'Payment Status', key: 'order_payment_status', width: 15 }
        ];

        // ساخت شیت خلاصه
        const summarySheet = workbook.addWorksheet('Summary');

        summarySheet.columns = [
          { header: 'Metric', key: 'metric', width: 30 },
          { header: 'Value', key: 'value', width: 20 }
        ];

        summarySheet.addRows([
          { metric: 'Total Profit Overall', value: totalProfitOverall.toFixed(2) },
          { metric: 'Total Profit Logs Count', value: totalLogsCount },
          { metric: 'Total Unique Orders', value: uniqueOrderCount }
        ]);


        worksheet.addRows(profitData);
        if (groupedSummary.length > 0) {
          const groupedSheet = workbook.addWorksheet('Grouped Summary');
          groupedSheet.columns = [
            { header: groupBy.charAt(0).toUpperCase() + groupBy.slice(1), key: 'period', width: 20 },
            { header: 'Total Profit', key: 'total_profit', width: 20 }
          ];
          groupedSheet.addRows(groupedSummary);
        }
        await workbook.xlsx.write(res);
        logger.info(`Excel export completed for profit report.`);
        break;

      default:
        return res.status(400).json({ message: 'Unsupported format.' });
    }
  } catch (error) {
    logger.error(`Error exporting profit report: ${error.message}`, { stack: error.stack });
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error during export', error: error.message });
    } else {
      res.end();
    }
  }
};

/////توابع ایمپورتی

//تابع برای ایمپورت دسته بندی ها
exports.importCategories = async (req, res) => {
  const file = req.file; // فایل آپلود شده توسط Multer
  const { format } = req.body; // فرمت فایل (csv, excel)
  const allowedFormats = ['csv', 'excel'];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    // حذف فایل موقت اگر فرمت نامعتبر بود
    await fs.unlink(file.path);
    return res
      .status(400)
      .json({
        message: 'Invalid or missing format. Allowed formats are: csv, excel.',
      });
  }

  const t = await db.sequelize.transaction(); // شروع یک تراکنش برای واردات

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      // خواندن و parse کردن فایل CSV
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          {
            columns: true, // فرض می‌کنیم ردیف اول هدر است
            skip_empty_lines: true,
          },
          (err, records) => {
            if (err) reject(err);
            resolve(records);
          },
        );
      });
    } else if (format.toLowerCase() === 'excel') {
      // خواندن و parse کردن فایل Excel
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1); // گرفتن اولین ورک‌شیت

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // ردیف هدر را رد می‌کنیم
        const rowData = {
          id: row.getCell(1).value,
          name: row.getCell(2).value,
          description: row.getCell(3).value,
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const record of records) {
      // 👈 پاکسازی ورودی‌ها برای جلوگیری از XSS
      const sanitizedName = sanitizeString(record.name);
      const sanitizedDescription = sanitizeString(record.description);

      try {
        // بررسی وجود دسته‌بندی بر اساس نام
        const [category, created] = await db.Category.findOrCreate({
          where: { name: sanitizedName },
          defaults: { description: sanitizedDescription },
          transaction: t,
        });

        if (created) {
          importedCount++;
        } else {
          // اگر موجود بود، به‌روزرسانی کن
          category.description = sanitizedDescription;
          await category.save({ transaction: t });
          updatedCount++;
        }
      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(
          `Error importing category record: ${recordError.message}`,
          { record: record },
        );
      }
    }

    await t.commit(); // انجام تراکنش
    res.status(200).json({
      message: 'Categories imported successfully!',
      importedCount: importedCount,
      updatedCount: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await t.rollback(); // برگرداندن تراکنش در صورت خطا
    logger.error(`Error importing categories: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: 'Server error during import', error: error.message });
  } finally {
    // حذف فایل موقت آپلود شده در نهایت
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        logger.error(
          `Error deleting temp uploaded file ${file.path}: ${e.message}`,
        );
      }
    }
  }
};

//  تابع برای واردات محصولات
exports.importProducts = async (req, res) => {
  const file = req.file;
  const { format } = req.body;
  const allowedFormats = ['csv', 'excel'];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    await fs.unlink(file.path);
    return res
      .status(400)
      .json({
        message: 'Invalid or missing format. Allowed formats are: csv, excel.',
      });
  }

  const t = await db.sequelize.transaction();

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          { columns: true, skip_empty_lines: true },
          (err, records) => {
            if (err) reject(err);
            resolve(records);
          },
        );
      });
    } else if (format.toLowerCase() === 'excel') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {
          name: row.getCell(1).value,
          description: row.getCell(2).value,
          price: row.getCell(3).value,
          stock_quantity: row.getCell(4).value,
          category_name: row.getCell(5).value, // فرض می‌کنیم نام دسته‌بندی است
          slug: row.getCell(6).value,
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const record of records) {
      const sanitizedName = sanitizeString(record.name);
      const sanitizedDescription = sanitizeString(record.description);
      const sanitizedSlug = sanitizeString(record.slug);

      try {
        // یافتن ID دسته‌بندی از روی نام آن
        const category = await db.Category.findOne({
          where: { name: record.category_name },
          attributes: ['id'],
          transaction: t,
        });

        if (!category) {
          errors.push({
            record: record,
            error: `Category '${record.category_name}' not found.`,
          });
          continue; // اگر دسته‌بندی پیدا نشد، این رکورد را رد کن
        }

        // استفاده از findOrCreate برای جلوگیری از تکرار
        const [product, created] = await db.Product.findOrCreate({
          where: { slug: sanitizedSlug },
          defaults: {
            name: sanitizedName,
            description: sanitizedDescription,
            price: record.price,
            stock_quantity: record.stock_quantity,
            category_id: category.id,
            slug: sanitizedSlug,
          },
          transaction: t,
        });

        if (created) {
          importedCount++;
        } else {
          // اگر محصول موجود بود، به‌روزرسانی کن
          product.name = sanitizedName;
          product.description = sanitizedDescription;
          product.price = record.price;
          product.stock_quantity = record.stock_quantity;
          product.category_id = category.id;
          await product.save({ transaction: t });
          updatedCount++;
        }
      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(`Error importing product record: ${recordError.message}`, {
          record: record,
        });
      }
    }

    await t.commit();
    res.status(200).json({
      message: 'Products imported successfully!',
      importedCount: importedCount,
      updatedCount: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await t.rollback();
    logger.error(`Error importing products: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: 'Server error during import', error: error.message });
  } finally {
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        logger.error(
          `Error deleting temp uploaded file ${file.path}: ${e.message}`,
        );
      }
    }
  }
};

//تابغ برای واردات کاربران
exports.importUsers = async (req, res) => {
  const file = req.file;
  const { format } = req.body;
  const allowedFormats = ['csv', 'excel'];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    await fs.unlink(file.path);
    return res
      .status(400)
      .json({
        message: 'Invalid or missing format. Allowed formats are: csv, excel.',
      });
  }

  const t = await db.sequelize.transaction();

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          { columns: true, skip_empty_lines: true },
          (err, records) => {
            if (err) reject(err);
            resolve(records);
          },
        );
      });
    } else if (format.toLowerCase() === 'excel') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {
          username: row.getCell(1).value,
          email: row.getCell(2).value,
          password: row.getCell(3).value,
          first_name: row.getCell(4).value,
          last_name: row.getCell(5).value,
          phone_number: row.getCell(6).value,
          role_name: row.getCell(7).value,
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    const customerRole = await db.Role.findOne({
      where: { name: 'customer' },
      transaction: t,
    });
    if (!customerRole) {
      await t.rollback();
      return res
        .status(500)
        .json({ message: 'Customer role not found. Cannot import users.' });
    }

    for (const record of records) {
      const sanitizedUsername = sanitizeString(record.username);
      const sanitizedEmail = sanitizeString(record.email);
      const sanitizedFirstName = sanitizeString(record.first_name);
      const sanitizedLastName = sanitizeString(record.last_name);
      const sanitizedPhoneNumber = sanitizeString(record.phone_number);
      const sanitizedRoleName = record.role_name
        ? sanitizeString(record.role_name)
        : 'customer';

      try {
        const role = await db.Role.findOne({
          where: { name: sanitizedRoleName },
          transaction: t,
        });
        const roleId = role ? role.id : customerRole.id; // اگر نقش پیدا نشد، نقش پیش‌فرض 'customer'

        // هش کردن پسورد
        const hashedPassword = await bcrypt.hash(record.password, 10);

        // استفاده از findOrCreate برای جلوگیری از تکرار بر اساس ایمیل یا نام کاربری
        const [user, created] = await db.User.findOrCreate({
          where: {
            [db.Sequelize.Op.or]: [
              { username: sanitizedUsername },
              { email: sanitizedEmail },
            ],
          },
          defaults: {
            username: sanitizedUsername,
            email: sanitizedEmail,
            password: hashedPassword,
            first_name: sanitizedFirstName,
            last_name: sanitizedLastName,
            phone_number: sanitizedPhoneNumber,
            role_id: roleId,
          },
          transaction: t,
        });

        if (created) {
          importedCount++;
        } else {
          // اگر کاربر موجود بود، به‌روزرسانی کن
          user.first_name = sanitizedFirstName;
          user.last_name = sanitizedLastName;
          user.phone_number = sanitizedPhoneNumber;
          user.role_id = roleId;
          await user.save({ transaction: t });
          updatedCount++;
        }
      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(`Error importing user record: ${recordError.message}`, {
          record: record,
        });
      }
    }

    await t.commit();
    res.status(200).json({
      message: 'Users imported successfully!',
      importedCount: importedCount,
      updatedCount: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await t.rollback();
    logger.error(`Error importing users: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: 'Server error during import', error: error.message });
  } finally {
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        logger.error(
          `Error deleting temp uploaded file ${file.path}: ${e.message}`,
        );
      }
    }
  }
};

//تابع برای ایمپورت سفارشات
exports.importOrders = async (req, res) => {
  const file = req.file;
  const { format } = req.body;
  const allowedFormats = ['csv', 'excel'];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    await fs.unlink(file.path);
    return res
      .status(400)
      .json({
        message: 'Invalid or missing format. Allowed formats are: csv, excel.',
      });
  }

  const t = await db.sequelize.transaction();

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          { columns: true, skip_empty_lines: true },
          (err, records) => {
            if (err) reject(err);
            resolve(records);
          },
        );
      });
    } else if (format.toLowerCase() === 'excel') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {
          customer_email: row.getCell(1).value,
          shipping_street: row.getCell(2).value,
          shipping_city: row.getCell(3).value,
          total_amount: row.getCell(4).value,
          status: row.getCell(5).value,
          payment_status: row.getCell(6).value,
          product_slug: row.getCell(7).value,
          quantity: row.getCell(8).value,
          // و ... فیلدهای دیگر
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    const errors = [];

    for (const record of records) {
      const {
        customer_email,
        shipping_street,
        shipping_city,
        total_amount,
        status,
        payment_status,
        product_slug,
        quantity,
      } = record;
      const sanitizedEmail = sanitizeString(customer_email);

      try {
        // اعتبارسنجی: وجود مشتری (کاربر)
        const user = await db.User.findOne({
          where: { email: sanitizedEmail },
          transaction: t,
        });
        if (!user) {
          errors.push({
            record: record,
            error: `Customer with email '${sanitizedEmail}' not found.`,
          });
          continue;
        }

        // اعتبارسنجی: وجود محصول
        const product = await db.Product.findOne({
          where: { slug: product_slug },
          transaction: t,
        });
        if (!product) {
          errors.push({
            record: record,
            error: `Product with slug '${product_slug}' not found.`,
          });
          continue;
        }

        // اعتبارسنجی: وجود آدرس (فرض می‌کنیم آدرس پیش‌فرض مشتری است)
        const shippingAddress = await db.Address.findOne({
          where: { user_id: user.id, is_default: true },
          transaction: t,
        });
        if (!shippingAddress) {
          errors.push({
            record: record,
            error: `Default shipping address for user '${user.username}' not found.`,
          });
          continue;
        }

        // ایجاد یا به‌روزرسانی سفارش (اگر شماره سفارش در فایل باشد)
        // در این مثال، فرض می‌کنیم سفارشات جدید وارد می‌کنیم
        const newOrder = await db.Order.create(
          {
            user_id: user.id,
            total_amount: parseFloat(total_amount),
            status: sanitizeString(status),
            shipping_address_id: shippingAddress.id,
            payment_status: sanitizeString(payment_status),
            coupon_id: null, // فرض می‌کنیم فعلاً کوپن نداریم
          },
          { transaction: t },
        );
        importedCount++;

        // ایجاد آیتم‌های سفارش
        await db.OrderItem.create(
          {
            order_id: newOrder.id,
            product_id: product.id,
            quantity: parseInt(quantity),
            price_at_purchase: parseFloat(product.price),
          },
          { transaction: t },
        );
      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(`Error importing order record: ${recordError.message}`, {
          record: record,
        });
      }
    }

    await t.commit();
    res.status(200).json({
      message: 'Orders imported successfully!',
      importedCount: importedCount,
      updatedCount: 0, // در این مثال فقط واردات جدید داریم
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await t.rollback();
    logger.error(`Error importing orders: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: 'Server error during import', error: error.message });
  } finally {
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        logger.error(
          `Error deleting temp uploaded file ${file.path}: ${e.message}`,
        );
      }
    }
  }
};

// 👈 تابع برای واردات تراکنش‌ها
exports.importPayments = async (req, res) => {
  const file = req.file;
  const { format } = req.body;
  const allowedFormats = ['csv', 'excel'];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    await fs.unlink(file.path);
    return res
      .status(400)
      .json({
        message: 'Invalid or missing format. Allowed formats are: csv, excel.',
      });
  }

  const t = await db.sequelize.transaction();

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          { columns: true, skip_empty_lines: true },
          (err, records) => {
            if (err) reject(err);
            resolve(records);
          },
        );
      });
    } else if (format.toLowerCase() === 'excel') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {
          order_id: row.getCell(1).value,
          transaction_id: row.getCell(2).value,
          amount: row.getCell(3).value,
          method: row.getCell(4).value,
          status: row.getCell(5).value,
          payment_date: row.getCell(6).value,
          refunded: row.getCell(7).value,
          refund_reason: row.getCell(8).value,
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    const errors = [];

    for (const record of records) {
      const {
        order_id,
        transaction_id,
        amount,
        method,
        status,
        payment_date,
        refunded,
        refund_reason,
      } = record;

      try {
        // اعتبارسنجی: وجود سفارش
        const order = await db.Order.findByPk(order_id, { transaction: t });
        if (!order) {
          errors.push({
            record: record,
            error: `Order with ID '${order_id}' not found.`,
          });
          continue;
        }

        // اعتبارسنجی: عدم تکرار transaction_id
        const existingPayment = await db.Payment.findOne({
          where: { transaction_id: transaction_id },
          transaction: t,
        });
        if (existingPayment) {
          errors.push({
            record: record,
            error: `Payment with transaction ID '${transaction_id}' already exists.`,
          });
          continue;
        }

        // 👈 **مهم:** تبدیل رشته‌های refunded و payment_date به نوع درست
        const isRefunded = refunded && refunded.toLowerCase() === 'true';
        const paymentDate = payment_date ? new Date(payment_date) : new Date();

        await db.Payment.create(
          {
            order_id: order_id,
            transaction_id: sanitizeString(transaction_id),
            amount: parseFloat(amount),
            method: sanitizeString(method),
            status: sanitizeString(status),
            payment_date: paymentDate, // 👈 استفاده از شیء تاریخ
            refunded: isRefunded, // 👈 استفاده از مقدار boolean
            refund_reason: sanitizeString(refund_reason),
          },
          { transaction: t },
        );
        importedCount++;
      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(`Error importing payment record: ${recordError.message}`, {
          record: record,
        });
      }
    }

    await t.commit();
    res.status(200).json({
      message: 'Payments imported successfully!',
      importedCount: importedCount,
      updatedCount: 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await t.rollback();
    logger.error(`Error importing payments: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: 'Server error during import', error: error.message });
  } finally {
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        logger.error(
          `Error deleting temp uploaded file ${file.path}: ${e.message}`,
        );
      }
    }
  }
};

//تابع برای واردات  کوپن ها
exports.importCoupons = async (req, res) => {
  const file = req.file;
  const { format } = req.body;
  const allowedFormats = ['csv', 'excel'];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    await fs.unlink(file.path);
    return res
      .status(400)
      .json({
        message: 'Invalid or missing format. Allowed formats are: csv, excel.',
      });
  }

  const t = await db.sequelize.transaction();

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          { columns: true, skip_empty_lines: true },
          (err, records) => {
            if (err) reject(err);
            resolve(records);
          },
        );
      });
    } else if (format.toLowerCase() === 'excel') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {
          code: row.getCell(1).value,
          discount_type: row.getCell(2).value,
          discount_value: row.getCell(3).value,
          min_amount: row.getCell(4).value,
          usage_limit: row.getCell(5).value,
          expiry_date: row.getCell(6).value,
          isActive: row.getCell(7).value,
          is_first_purchase_only: row.getCell(8).value,
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const record of records) {
      const {
        code,
        discount_type,
        discount_value,
        min_amount,
        usage_limit,
        expiry_date,
        isActive,
        is_first_purchase_only,
      } = record;

      try {
        // 👈 **مهم:** بررسی نوع داده قبل از تبدیل
        const isFirstPurchaseOnly =
          typeof is_first_purchase_only === 'string'
            ? is_first_purchase_only.toLowerCase() === 'true'
            : is_first_purchase_only;
        const isActiveBool =
          typeof isActive === 'string'
            ? isActive.toLowerCase() === 'true'
            : isActive;

        const [coupon, created] = await db.Coupon.findOrCreate({
          where: { code: sanitizeString(code) },
          defaults: {
            discount_type: sanitizeString(discount_type),
            discount_value: parseFloat(discount_value),
            min_amount: parseFloat(min_amount),
            usage_limit: usage_limit ? parseInt(usage_limit) : null,
            expiry_date: expiry_date ? new Date(expiry_date) : null,
            isActive: isActiveBool,
            is_first_purchase_only: isFirstPurchaseOnly,
          },
          transaction: t,
        });

        if (created) {
          importedCount++;
        } else {
          coupon.discount_type = sanitizeString(discount_type);
          coupon.discount_value = parseFloat(discount_value);
          coupon.min_amount = parseFloat(min_amount);
          coupon.usage_limit = usage_limit ? parseInt(usage_limit) : null;
          coupon.expiry_date = expiry_date ? new Date(expiry_date) : null;
          coupon.isActive = isActiveBool;
          coupon.is_first_purchase_only = isFirstPurchaseOnly;
          await coupon.save({ transaction: t });
          updatedCount++;
        }
      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(`Error importing coupon record: ${recordError.message}`, {
          record: record,
        });
      }
    }

    await t.commit();
    res.status(200).json({
      message: 'Coupons imported successfully!',
      importedCount: importedCount,
      updatedCount: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await t.rollback();
    logger.error(`Error importing coupons: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: 'Server error during import', error: error.message });
  } finally {
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        logger.error(
          `Error deleting temp uploaded file ${file.path}: ${e.message}`,
        );
      }
    }
  }
};

//واردات داده های انبار داری
exports.importInventoryUpdates = async (req, res) => {
  const file = req.file;
  const { format } = req.body;
  const allowedFormats = ['csv', 'excel'];


  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    await fs.unlink(file.path);
    return res
      .status(400)
      .json({
        message: 'Invalid or missing format. Allowed formats are: csv, excel.',
      });
  }

  const t = await db.sequelize.transaction();

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(
          fileContent,
          { columns: true, skip_empty_lines: true },
          (err, records) => {
            if (err) reject(err);
            resolve(records);
          },
        );
      });
    } else if (format.toLowerCase() === 'excel') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {
          product_slug: row.getCell(1).value, // یا product_id
          new_stock_quantity: row.getCell(2).value,
          description: row.getCell(3).value, // توضیحات تغییر (اختیاری)
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (const record of records) {
      const { product_slug, new_stock_quantity, description } = record;
      const sanitizedDescription = sanitizeString(description);

      try {
        // اعتبارسنجی: وجود محصول
        const product = await db.Product.findOne({
          where: { slug: product_slug },
          transaction: t,
        });
        if (!product) {
          errors.push({
            record: record,
            error: `Product with slug '${product_slug}' not found.`,
          });
          continue;
        }

        // اعتبارسنجی: موجودی منفی نباشد (در صورت محدودیت)
        if (parseInt(new_stock_quantity) < 0) {
          errors.push({
            record: record,
            error: `Invalid stock quantity for product '${product.name}': cannot be negative.`,
          });
          continue;
        }

        // به‌روزرسانی موجودی
        let oldStock = product.stock_quantity
        product.stock_quantity = parseInt(new_stock_quantity);
        await product.save({ transaction: t });
        updatedCount++;

        // 👈 ثبت لاگ انبارداری برای واردات دستی
        await db.InventoryLog.create({
          product_id: product.id,
          change_type: 'import',
          quantity_change: parseInt(new_stock_quantity) - oldStock, // تغییر موجودی
          old_stock_quantity: oldStock,
          new_stock_quantity: product.stock_quantity,
          changed_by_user_id: req.user.id, // کاربری که واردات را انجام می‌دهد (ادمین)
          description: sanitizedDescription || 'Manual import via file.'
        }, { transaction: t });

      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(
          `Error importing inventory update record: ${recordError.message}`,
          { record: record },
        );
      }
    }

    await t.commit();
    res.status(200).json({
      message: 'Inventory updated successfully!',
      importedCount: 0, // در این مورد فقط به‌روزرسانی داریم، نه واردات جدید
      updatedCount: updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    await t.rollback();
    logger.error(`Error importing inventory updates: ${error.message}`, {
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: 'Server error during import', error: error.message });
  } finally {
    if (file) {
      try {
        await fs.unlink(file.path);
      } catch (e) {
        logger.error(
          `Error deleting temp uploaded file ${file.path}: ${e.message}`,
        );
      }
    }
  }
};

// 👈 تابع برای واردات نظرات
exports.importReviews = async (req, res) => {
  const file = req.file;
  const { format } = req.body;
  const allowedFormats = ['csv', 'excel'];

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  if (!format || !allowedFormats.includes(format.toLowerCase())) {
    await fs.unlink(file.path);
    return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: csv, excel.' });
  }

  const t = await db.sequelize.transaction();

  try {
    let records = [];

    if (format.toLowerCase() === 'csv') {
      const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
      records = await new Promise((resolve, reject) => {
        parse(fileContent, { columns: true, skip_empty_lines: true }, (err, records) => {
          if (err) reject(err);
          resolve(records);
        });
      });
    } else if (format.toLowerCase() === 'excel') {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const rowData = {
          user_email: row.getCell(1).value,
          product_slug: row.getCell(2).value,
          rating: row.getCell(3).value,
          comment: row.getCell(4).value,
        };
        records.push(rowData);
      });
    }

    let importedCount = 0;
    let updatedCount = 0; // برای Reviewها معمولاً فقط واردات جدید است
    const errors = [];

    for (const record of records) {
      const { user_email, product_slug, rating, comment } = record;
      const sanitizedEmail = sanitizeString(user_email);
      const sanitizedComment = sanitizeString(comment);

      try {
        // اعتبارسنجی: وجود کاربر و محصول
        const user = await db.User.findOne({ where: { email: sanitizedEmail }, transaction: t });
        if (!user) {
          errors.push({ record: record, error: `User with email '${sanitizedEmail}' not found.` });
          continue;
        }

        const product = await db.Product.findOne({ where: { slug: product_slug }, transaction: t });
        if (!product) {
          errors.push({ record: record, error: `Product with slug '${product_slug}' not found.` });
          continue;
        }

        // اعتبارسنجی: عدم تکرار (هر کاربر فقط یک Review برای هر محصول)
        const existingReview = await db.Review.findOne({
          where: { user_id: user.id, product_id: product.id },
          transaction: t
        });
        if (existingReview) {
          // اگر Review موجود بود، آن را به‌روزرسانی کن (یا فقط skip کن)
          existingReview.rating = parseInt(rating);
          existingReview.comment = sanitizedComment;
          await existingReview.save({ transaction: t });
          updatedCount++; // اگر به‌روزرسانی کردیم
          continue; // به رکورد بعدی برو
        }

        // ایجاد Review جدید
        await db.Review.create({
          user_id: user.id,
          product_id: product.id,
          rating: parseInt(rating),
          comment: sanitizedComment,
        }, { transaction: t });
        importedCount++;

      } catch (recordError) {
        errors.push({ record: record, error: recordError.message });
        logger.error(`Error importing review record: ${recordError.message}`, { record: record });
      }
    }

    await t.commit();
    res.status(200).json({
      message: 'Reviews imported successfully!',
      importedCount: importedCount,
      updatedCount: updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    await t.rollback();
    logger.error(`Error importing reviews: ${error.message}`, { stack: error.stack });
    res.status(500).json({ message: 'Server error during import', error: error.message });
  } finally {
    if (file) {
      try { await fs.unlink(file.path); } catch (e) { logger.error(`Error deleting temp uploaded file ${file.path}: ${e.message}`); }
    }
  }
};

// Multer middleware برای استفاده در روت‌ها (برای واردات)
exports.uploadImport = upload;
