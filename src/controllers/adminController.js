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
const logger = require('../config/logger');
const moment = require('moment');
// روت تست ادمین
exports.adminDashboard = (req, res) => {
    res.status(200).json({ message: 'Welcome to the Admin Dashboard, ' + req.user.username + '!' });
};

// تابع برای دریافت همه کاربران (فقط ادمین)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] }, // پسورد را شامل نمی‌کنیم
            include: [{
                model: Role,
                as: 'role',
                attributes: ['name']
            }]
        });
        res.status(200).json({ users: users });
    } catch (error) {
        console.error('Error fetching all users for admin:', error);
        res.status(500).json({ message: 'Server error fetching users', error: error.message });
    }
};

// تابع برای دریافت جزئیات یک کاربر بر اساس ID (فقط ادمین)
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Role,
                as: 'role',
                attributes: ['name']
            }]
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ user: user });
    } catch (error) {
        console.error('Error fetching user by ID for admin:', error);
        res.status(500).json({ message: 'Server error fetching user', error: error.message });
    }
};

// تابع برای به‌روزرسانی اطلاعات کاربر (توسط ادمین)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password, first_name, last_name, phone_number, role_id } = req.body;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // بررسی نام کاربری یا ایمیل تکراری (اگر تغییر کنند)
        if ((username && username !== user.username) || (email && email !== user.email)) {
            const existingUser = await User.findOne({
                where: {
                    [Sequelize.Op.or]: [{ username: username || user.username }, { email: email || user.email }],
                    id: { [Sequelize.Op.ne]: id } // به جز خود کاربر فعلی
                }
            });
            if (existingUser) {
                return res.status(409).json({ message: 'Username or email already exists for another user.' });
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
            updatedAt: user.updatedAt
        };
        res.status(200).json({ message: 'User updated successfully!', user: userResponse });
    } catch (error) {
        console.error('Error updating user by admin:', error);
        res.status(500).json({ message: 'Server error updating user', error: error.message });
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
            return res.status(400).json({ message: 'Cannot delete user: Associated data (orders/history) exists.' });
        }
        res.status(500).json({ message: 'Server error deleting user', error: error.message });
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
        whereClause.createdAt = { ...whereClause.createdAt, [Sequelize.Op.lte]: new Date(endDate) };
    }
    whereClause.payment_status = 'paid'; // فقط سفارشات پرداخت شده

    try {
        // 1. گزارش فروش روزانه (همانند قبل)
        const dailySales = await db.Order.findAll({
            where: whereClause,
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('createdAt')), 'sale_date'],
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'daily_sales_amount'],
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'daily_orders_count']
            ],
            group: [Sequelize.fn('DATE', Sequelize.col('createdAt'))],
            order: [[Sequelize.fn('DATE', Sequelize.col('createdAt')), 'ASC']]
        });

        // 2. محاسبه مجموع فروش کلی برای بازه زمانی
        const totalSalesAmount = await db.Order.sum('total_amount', {
            where: whereClause
        });
        const totalOrdersCount = await db.Order.count({
            where: whereClause
        });

        res.status(200).json({
            sales_report: dailySales,
            summary: { // 👈 این بخش جدید است
                total_sales_amount_overall: totalSalesAmount ? parseFloat(totalSalesAmount).toFixed(2) : '0.00',
                total_orders_count_overall: totalOrdersCount
            }
        });
    } catch (error) {
        console.error('Error fetching sales report:', error);
        res.status(500).json({ message: 'Server error fetching sales report', error: error.message });
    }
};

// تابع برای دریافت گزارش محصولات کم‌موجودی
exports.getLowStockProducts = async (req, res) => {
    const threshold = req.query.threshold || 10; // آستانه موجودی کم (پیش فرض 10)

    try {
        const lowStockProducts = await db.Product.findAll({
            where: {
                stock_quantity: { [Sequelize.Op.lte]: threshold } // محصولاتی که موجودیشان کمتر یا مساوی آستانه است
            },
            order: [['stock_quantity', 'ASC']]
        });
        res.status(200).json({ low_stock_products: lowStockProducts });
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ message: 'Server error fetching low stock products', error: error.message });
    }
};

// تابع برای دریافت آمار کلی داشبورد (مثلاً تعداد کل کاربران، محصولات، سفارشات، مجموع فروش)
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await db.User.count();
        const totalProducts = await db.Product.count();
        const totalOrders = await db.Order.count();
        const totalPaidOrders = await db.Order.count({ where: { payment_status: 'paid' } });
        const totalSalesAmount = await db.Order.sum('total_amount', { where: { payment_status: 'paid' } });

        res.status(200).json({
            dashboard_stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalPaidOrders,
                totalSalesAmount: totalSalesAmount ? parseFloat(totalSalesAmount).toFixed(2) : '0.00'
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats', error: error.message });
    }
};

// تابع برای صادرات دسته‌بندی‌ها با روش Streaming
exports.exportCategories = async (req, res) => {
    const { format } = req.query;
    const allowedFormats = ['json', 'csv', 'excel'];

    if (!format || !allowedFormats.includes(format.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: json, csv, excel.' });
    }

    const filenameBase = `categories_export_${Date.now()}`;

    try {
        const categories = await db.Category.findAll({
            attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
        });

        const categoriesData = categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            createdAt: cat.createdAt.toISOString(),
            updatedAt: cat.updatedAt.toISOString()
        }));

        switch (format.toLowerCase()) {
            case 'json':
                res.status(200) // 👈 Status Code اینجا
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.json`);
                res.send(JSON.stringify(categoriesData, null, 2)); // 👈 استفاده از res.send
                break;

            case 'csv':
                res.status(200) // 👈 Status Code اینجا
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.csv`);

                const csvStringifier = createCsvStringifier({
                    header: [
                        { id: 'id', title: 'ID' },
                        { id: 'name', title: 'Name' },
                        { id: 'description', title: 'Description' },
                        { id: 'createdAt', title: 'Created At' },
                        { id: 'updatedAt', title: 'Updated At' }
                    ]
                });

                res.write(csvStringifier.getHeaderString());
                categoriesData.forEach(row => {
                    res.write(csvStringifier.stringifyRecords([row]));
                });
                res.end(); // پایان پاسخ
                logger.info(`CSV export completed for ${categoriesData.length} categories.`);
                break;

            case 'excel':
                res.status(200) // 👈 Status Code اینجا
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.xlsx`);

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Categories');

                worksheet.columns = [
                    { header: 'ID', key: 'id', width: 10 },
                    { header: 'Name', key: 'name', width: 30 },
                    { header: 'Description', key: 'description', width: 50 },
                    { header: 'Created At', key: 'createdAt', width: 25 },
                    { header: 'Updated At', key: 'updatedAt', width: 25 }
                ];

                worksheet.addRows(categoriesData);

                // 👈 استفاده از pipe برای Streaming مستقیم (روش مطمئن‌تر)
                await workbook.xlsx.write(res); // این خودش response stream را مدیریت می‌کند و res.end() را فراخوانی می‌کند
                logger.info(`Excel export completed for ${categoriesData.length} categories.`);
                break;

            default:
                return res.status(400).json({ message: 'Unsupported format.' });
        }
    } catch (error) {
        logger.error(`Error exporting categories (streaming): ${error.message}`, { stack: error.stack });
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error during export', error: error.message });
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
        return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: json, csv, excel.' });
    }

    const filenameBase = `products_export_${Date.now()}`;
    res.status(200);

    try {
        const products = await db.Product.findAll({
            attributes: ['id', 'name', 'description', 'price', 'stock_quantity', 'slug', 'image_url', 'views_count', 'sold_count', 'createdAt', 'updatedAt'],
            include: [{
                model: db.Category,
                as: 'category',
                attributes: ['name']
            }]
        });

        const productsData = products.map(prod => ({
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
            updatedAt: prod.updatedAt.toISOString()
        }));

        switch (format.toLowerCase()) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.json`);
                res.send(JSON.stringify(productsData, null, 2));
                break;

            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.csv`);

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
                        { id: 'updatedAt', title: 'Updated At' }
                    ]
                });

                res.write(csvStringifier.getHeaderString());
                productsData.forEach(row => {
                    res.write(csvStringifier.stringifyRecords([row]));
                });
                res.end();
                logger.info(`CSV export completed for ${productsData.length} products.`);
                break;

            case 'excel':
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.xlsx`);

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
                    { header: 'Updated At', key: 'updatedAt', width: 25 }
                ];

                worksheet.addRows(productsData);
                await workbook.xlsx.write(res);
                logger.info(`Excel export completed for ${productsData.length} products.`);
                break;

            default:
                return res.status(400).json({ message: 'Unsupported format.' });
        }
    } catch (error) {
        logger.error(`Error exporting products (streaming): ${error.message}`, { stack: error.stack });
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error during export', error: error.message });
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
        return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: json, csv, excel.' });
    }

    const filenameBase = `users_export_${Date.now()}`;
    res.status(200);

    try {
        const users = await db.User.findAll({
            attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'role_id', 'createdAt', 'updatedAt'],
            include: [{
                model: db.Role,
                as: 'role',
                attributes: ['name']
            }]
        });

        const usersData = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            role_name: user.role ? user.role.name : 'N/A', // نام نقش
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        }));

        switch (format.toLowerCase()) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.json`);
                res.send(JSON.stringify(usersData, null, 2));
                break;

            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.csv`);

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
                        { id: 'updatedAt', title: 'Updated At' }
                    ]
                });

                res.write(csvStringifier.getHeaderString());
                usersData.forEach(row => {
                    res.write(csvStringifier.stringifyRecords([row]));
                });
                res.end();
                logger.info(`CSV export completed for ${usersData.length} users.`);
                break;

            case 'excel':
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.xlsx`);

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
                    { header: 'Updated At', key: 'updatedAt', width: 25 }
                ];

                worksheet.addRows(usersData);
                await workbook.xlsx.write(res);
                logger.info(`Excel export completed for ${usersData.length} users.`);
                break;

            default:
                return res.status(400).json({ message: 'Unsupported format.' });
        }
    } catch (error) {
        logger.error(`Error exporting users (streaming): ${error.message}`, { stack: error.stack });
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error during export', error: error.message });
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
        return res.status(400).json({ message: 'Invalid or missing reportType. Allowed types are: sales, low_stock.' });
    }
    if (!format || !allowedFormats.includes(format.toLowerCase())) {
        return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: json, csv, excel.' });
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
                    salesWhereClause.createdAt = { [db.Sequelize.Op.gte]: moment(startDate).startOf('day').toDate() };
                }
                if (endDate) {
                    salesWhereClause.createdAt = {
                        ...salesWhereClause.createdAt,
                        [db.Sequelize.Op.lte]: moment(endDate).endOf('day').toDate()
                    };
                }
                salesWhereClause.payment_status = 'paid';

                const sales = await db.Order.findAll({
                    where: salesWhereClause,
                    attributes: [
                        [db.Sequelize.literal('DATE_TRUNC(\'day\', "Order"."createdAt")'), 'sale_date'],
                        [db.Sequelize.fn('COALESCE', db.Sequelize.fn('SUM', db.Sequelize.col('total_amount')), 0), 'daily_sales_amount'],
                        [db.Sequelize.fn('COALESCE', db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 0), 'daily_orders_count']
                    ],
                    group: [db.Sequelize.literal('DATE_TRUNC(\'day\', "Order"."createdAt")')],
                    order: [[db.Sequelize.literal('DATE_TRUNC(\'day\', "Order"."createdAt")'), 'ASC']]
                });

                reportData = sales.map(s => ({
                    sale_date: s.get('sale_date'),
                    daily_sales_amount: parseFloat(s.get('daily_sales_amount')),
                    daily_orders_count: parseInt(s.get('daily_orders_count'))
                }));

                const totalSalesAmount = await db.Order.sum('total_amount', {
                    where: salesWhereClause
                });
                const totalOrdersCount = await db.Order.count({
                    where: salesWhereClause
                });

                jsonResponseObject = {
                    sales_report: reportData,
                    summary: {
                        total_sales_amount_overall: totalSalesAmount ? parseFloat(totalSalesAmount).toFixed(2) : '0.00',
                        total_orders_count_overall: totalOrdersCount
                    }
                };

                headers = [
                    { id: 'sale_date', title: 'Sale Date' },
                    { id: 'daily_sales_amount', title: 'Daily Sales Amount' },
                    { id: 'daily_orders_count', title: 'Daily Orders Count' }
                ];
                worksheetName = 'Sales Report';
                break;

            case 'low_stock':
                const lowStockThreshold = threshold || 10;
                const lowStockProducts = await db.Product.findAll({
                    where: {
                        stock_quantity: { [db.Sequelize.Op.lte]: lowStockThreshold }
                    },
                    order: [['stock_quantity', 'ASC']],
                    attributes: ['id', 'name', 'stock_quantity', 'category_id', 'price']
                });
                reportData = lowStockProducts.map(p => ({
                    id: p.id,
                    name: p.name,
                    stock_quantity: p.stock_quantity,
                    category_id: p.category_id,
                    price: parseFloat(p.price)
                }));
                headers = [
                    { id: 'id', title: 'Product ID' },
                    { id: 'name', title: 'Product Name' },
                    { id: 'stock_quantity', title: 'Stock Quantity' },
                    { id: 'category_id', title: 'Category ID' },
                    { id: 'price', title: 'Price' }
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
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.json`);
                res.send(JSON.stringify(jsonResponseObject, null, 2));
                break;

            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.csv`);

                const csvStringifier = createCsvStringifier({ header: headers });
                res.write(csvStringifier.getHeaderString());
                reportData.forEach(row => {
                    res.write(csvStringifier.stringifyRecords([row]));
                });
                res.end();
                logger.info(`CSV export completed for ${reportType} report.`);
                break;

            case 'excel':
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.xlsx`);

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(worksheetName);

                worksheet.columns = headers.map(h => ({ header: h.title, key: h.id, width: 20 }));
                worksheet.addRows(reportData);

                await workbook.xlsx.write(res);
                logger.info(`Excel export completed for ${reportType} report.`);
                break;

            default:
                return res.status(400).json({ message: 'Unsupported format.' });
        }
    } catch (error) {
        logger.error(`Error exporting ${reportType} report: ${error.message}`, { stack: error.stack });
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error during export', error: error.message });
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
        return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: json, csv, excel.' });
    }

    const filenameBase = `orders_export_${Date.now()}`;
    res.status(200);

    const whereClause = {};
    if (startDate) {
        whereClause.createdAt = { [db.Sequelize.Op.gte]: new Date(startDate) };
    }
    if (endDate) {
        whereClause.createdAt = { ...whereClause.createdAt, [db.Sequelize.Op.lte]: new Date(endDate) };
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
                { model: db.User, as: 'user', attributes: ['username', 'email', 'first_name', 'last_name', 'phone_number'] },
                { model: db.Address, as: 'shippingAddress', attributes: ['street', 'city', 'state', 'zip_code', 'country'] },
                { model: db.Coupon, as: 'coupon', attributes: ['code', 'discount_type', 'discount_value'] },
                {
                    model: db.OrderItem,
                    as: 'orderItems',
                    include: [{ model: db.Product, as: 'product', attributes: ['name', 'price', 'slug'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // مسطح کردن داده‌های سفارش برای CSV/Excel
        const ordersData = [];
        orders.forEach(order => {
            order.orderItems.forEach(item => {
                ordersData.push({
                    order_id: order.id,
                    order_date: order.createdAt.toISOString(),
                    order_status: order.status,
                    payment_status: order.payment_status,
                    total_amount: parseFloat(order.total_amount),
                    coupon_code: order.coupon ? order.coupon.code : 'N/A',
                    coupon_discount: order.coupon ? parseFloat(order.coupon.discount_value) : 0,

                    customer_username: order.user ? order.user.username : 'N/A',
                    customer_email: order.user ? order.user.email : 'N/A',
                    customer_first_name: order.user ? order.user.first_name : 'N/A',
                    customer_last_name: order.user ? order.user.last_name : 'N/A',
                    customer_phone: order.user ? order.user.phone_number : 'N/A',

                    shipping_street: order.shippingAddress ? order.shippingAddress.street : 'N/A',
                    shipping_city: order.shippingAddress ? order.shippingAddress.city : 'N/A',
                    shipping_state: order.shippingAddress ? order.shippingAddress.state : 'N/A',
                    shipping_zip_code: order.shippingAddress ? order.shippingAddress.zip_code : 'N/A',
                    shipping_country: order.shippingAddress ? order.shippingAddress.country : 'N/A',

                    product_name: item.product ? item.product.name : 'N/A',
                    product_slug: item.product ? item.product.slug : 'N/A',
                    product_quantity: item.quantity,
                    product_price_at_purchase: parseFloat(item.price_at_purchase)
                });
            });
            if (order.orderItems.length === 0) { // اگر سفارشی آیتم نداشت، یک ردیف خالی برای سفارش اصلی اضافه کن
                ordersData.push({
                    order_id: order.id,
                    order_date: order.createdAt.toISOString(),
                    order_status: order.status,
                    payment_status: order.payment_status,
                    total_amount: parseFloat(order.total_amount),
                    coupon_code: order.coupon ? order.coupon.code : 'N/A',
                    coupon_discount: order.coupon ? parseFloat(order.coupon.discount_value) : 0,

                    customer_username: order.user ? order.user.username : 'N/A',
                    customer_email: order.user ? order.user.email : 'N/A',
                    customer_first_name: order.user ? order.user.first_name : 'N/A',
                    customer_last_name: order.user ? order.user.last_name : 'N/A',
                    customer_phone: order.user ? order.user.phone_number : 'N/A',

                    shipping_street: order.shippingAddress ? order.shippingAddress.street : 'N/A',
                    shipping_city: order.shippingAddress ? order.shippingAddress.city : 'N/A',
                    shipping_state: order.shippingAddress ? order.shippingAddress.state : 'N/A',
                    shipping_zip_code: order.shippingAddress ? order.shippingAddress.zip_code : 'N/A',
                    shipping_country: order.shippingAddress ? order.shippingAddress.country : 'N/A',

                    product_name: 'N/A', // برای آیتم‌های خالی
                    product_slug: 'N/A',
                    product_quantity: 0,
                    product_price_at_purchase: 0
                });
            }
        });

        switch (format.toLowerCase()) {
            case 'json':
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.json`);
                res.send(JSON.stringify(orders, null, 2)); // برای JSON، کل آبجکت order را می‌دهیم
                break;

            case 'csv':
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.csv`);

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
                        { id: 'product_price_at_purchase', title: 'Price At Purchase' }
                    ]
                });

                res.write(csvStringifier.getHeaderString());
                ordersData.forEach(row => {
                    res.write(csvStringifier.stringifyRecords([row]));
                });
                res.end();
                logger.info(`CSV export completed for ${orders.length} orders.`);
                break;

            case 'excel':
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename=${filenameBase}.xlsx`);

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
                    { header: 'Customer First Name', key: 'customer_first_name', width: 20 },
                    { header: 'Customer Last Name', key: 'customer_last_name', width: 20 },
                    { header: 'Customer Phone', key: 'customer_phone', width: 20 },
                    { header: 'Shipping Street', key: 'shipping_street', width: 30 },
                    { header: 'Shipping City', key: 'shipping_city', width: 15 },
                    { header: 'Shipping State', key: 'shipping_state', width: 15 },
                    { header: 'Shipping Zip', key: 'shipping_zip_code', width: 15 },
                    { header: 'Shipping Country', key: 'shipping_country', width: 15 },
                    { header: 'Product Name', key: 'product_name', width: 30 },
                    { header: 'Product Slug', key: 'product_slug', width: 20 },
                    { header: 'Product Quantity', key: 'product_quantity', width: 15 },
                    { header: 'Price At Purchase', key: 'product_price_at_purchase', width: 20 }
                ];

                worksheet.addRows(ordersData);
                await workbook.xlsx.write(res);
                logger.info(`Excel export completed for ${orders.length} orders.`);
                break;

            default:
                return res.status(400).json({ message: 'Unsupported format.' });
        }
    } catch (error) {
        logger.error(`Error exporting orders: ${error.message}`, { stack: error.stack });
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error during export', error: error.message });
        } else {
            res.end();
        }
    }
};


