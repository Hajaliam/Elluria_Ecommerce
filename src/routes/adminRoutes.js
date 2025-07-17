// src/routes/adminRoutes.js

const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const backupUtil = require('../utils/backupService')

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Admin
 *     description: Admin panel management operations (Requires 'admin' role)
 */

router.use(
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard welcome message
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome message for admin dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the Admin Dashboard, AdminUser!
 *       401:
 *         description: Unauthorized (no token)
 *       403:
 *         description: Forbidden (invalid token or unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/dashboard', adminController.adminDashboard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserAdminView'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/users', adminController.getAllUsers);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to get
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAdminView'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id', adminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   put:
 *     summary: Update a user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               role_id:
 *                 type: integer
 *             example:
 *               username: updateduser
 *               email: updated@example.com
 *               role_id: 1
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAdminView'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (invalid token, CSRF, or unauthorized role)
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflict, username or email already exists
 *       500:
 *         description: Server error
 */
router.put('/users/:id', adminController.updateUser);

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully!
 *       400:
 *         description: Bad Request (e.g., user has associated data like orders)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (invalid token, CSRF, or unauthorized role)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/users/:id', adminController.deleteUser);

/**
 * @swagger
 * /api/admin/exports/categories:
 *   get:
 *     summary: Export categories in various formats (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *     responses:
 *       200:
 *         description: Successfully exported categories. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/categories', adminController.exportCategories);

/**
 * @swagger
 * /api/admin/exports/products:
 *   get:
 *     summary: Export products in various formats (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *     responses:
 *       200:
 *         description: Successfully exported products. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/products', adminController.exportProducts);

/**
 * @swagger
 * /api/admin/exports/users:
 *   get:
 *     summary: Export users in various formats (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *     responses:
 *       200:
 *         description: Successfully exported users. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/users', adminController.exportUsers);

/**
 * @swagger
 * /api/admin/exports/reports:
 *   get:
 *     summary: Export various reports (Sales, Low Stock) in different formats (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [sales, low_stock]
 *         required: true
 *         description: Type of report to export
 *         example: sales
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: excel
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for sales report (YYYY-MM-DD). Required for 'sales' report.
 *         example: 2025-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for sales report (YYYY-MM-DD). Required for 'sales' report.
 *         example: 2025-12-31
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *         description: Stock quantity threshold for 'low_stock' report. Default is 10.
 *         example: 5
 *     responses:
 *       200:
 *         description: Successfully exported report. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing parameters/format/reportType
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/reports', adminController.exportReports);

/**
 * @swagger
 * /api/admin/exports/orders:
 *   get:
 *     summary: Export orders data in various formats (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders by creation date from (YYYY-MM-DD)
 *         example: 2025-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders by creation date to (YYYY-MM-DD)
 *         example: 2025-12-31
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter orders by status (e.g., pending, delivered, shipped)
 *         example: delivered
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter orders by customer ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully exported orders. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing parameters/format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/orders', adminController.exportOrders); // 👈 صادرات سفارش‌ها

/**
 * @swagger
 * /api/admin/exports/payments:
 *   get:
 *     summary: Export payments data in various formats (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments by date from (YYYY-MM-DD)
 *         example: 2025-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments by date to (YYYY-MM-DD)
 *         example: 2025-12-31
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter payments by status (e.g., success, failed)
 *         example: success
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *         description: Filter payments by method (e.g., Zarinpal, CreditCard)
 *         example: Zarinpal
 *     responses:
 *       200:
 *         description: Successfully exported payments. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing parameters/format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/payments', adminController.exportPayments);

/**
 * @swagger
 * /api/admin/exports/coupons:
 *   get:
 *     summary: Export coupons data in various formats (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status (e.g., true for active, false for inactive)
 *         example: true
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *         description: Filter by minimum order amount (min_amount)
 *         example: 50
 *       - in: query
 *         name: discount_type
 *         schema:
 *           type: string
 *         description: Filter by discount type (e.g., percentage, fixed_amount)
 *         example: percentage
 *     responses:
 *       200:
 *         description: Successfully exported coupons. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing parameters/format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/coupons', adminController.exportCoupons); // 👈 صادرات کوپن‌ها

/**
 * @swagger
 * /api/admin/exports/reviews:
 *   get:
 *     summary: Export product reviews and ratings (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: Filter reviews by product ID
 *         example: 1
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *         description: Filter reviews with a minimum rating
 *         example: 4
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *         description: Filter reviews with a maximum rating
 *         example: 5
 *     responses:
 *       200:
 *         description: Successfully exported reviews. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing parameters/format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/reviews', adminController.exportReviews); // 👈 صادرات نظرات

/**
 * @swagger
 * /api/admin/exports/inventory:
 *   get:
 *     summary: Export all products stock data (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *         required: true
 *         description: Desired export format
 *         example: csv
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter inventory by category ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully exported inventory data. Returns file download.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example: Returns JSON data
 *           text/csv:
 *             schema:
 *               type: string
 *             example: Returns CSV data
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *             example: Returns Excel (xlsx) data
 *       400:
 *         description: Invalid or missing format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get('/exports/inventory', adminController.exportInventory); // 👈 صادرات موجودی

/**
 * @swagger
 * /api/admin/imports/categories:
 *   post:
 *     summary: Import categories from CSV or Excel file (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing categories data
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Categories imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
  '/imports/categories',
  adminController.uploadImport.single('file'),
  adminController.importCategories,
);

/**
 * @swagger
 * /api/admin/imports/products:
 *   post:
 *     summary: Import products from CSV or Excel file (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing products data
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Products imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
  '/imports/products',
  adminController.uploadImport.single('file'),
  adminController.importProducts,
);

/**
 * @swagger
 * /api/admin/imports/users:
 *   post:
 *     summary: Import users from CSV or Excel file (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing users data
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Users imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
  '/imports/users',
  adminController.uploadImport.single('file'),
  adminController.importUsers,
);

/**
 * @swagger
 * /api/admin/imports/orders:
 *   post:
 *     summary: Import orders from CSV or Excel file (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing orders data
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Orders imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
  '/imports/orders',
  adminController.uploadImport.single('file'),
  adminController.importOrders,
);

/**
 * @swagger
 * /api/admin/imports/payments:
 *   post:
 *     summary: Import payments from CSV or Excel file (Admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing payments data
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Payments imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
  '/imports/payments',
  adminController.uploadImport.single('file'),
  adminController.importPayments,
);

/**
 * @swagger
 * /api/admin/imports/coupons:
 *   post:
 *     summary: Import coupons from CSV or Excel file (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing coupons data
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Coupons imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
  '/imports/coupons',
  adminController.uploadImport.single('file'),
  adminController.importCoupons,
);

/**
 * @swagger
 * /api/admin/imports/inventory:
 *   post:
 *     summary: Import inventory updates from CSV or Excel file (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing inventory updates
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Inventory updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
  '/imports/inventory',
  adminController.uploadImport.single('file'),
  adminController.importInventoryUpdates,
);

/**
 * @swagger
 * /api/admin/imports/reviews:
 *   post:
 *     summary: Import reviews from CSV or Excel file (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing reviews data
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: Format of the uploaded file
 *                 example: csv
 *     responses:
 *       200:
 *         description: Reviews imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 importedCount:
 *                   type: integer
 *                 updatedCount:
 *                   type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                       error:
 *                         type: string
 *       400:
 *         description: Bad Request (e.g., no file uploaded, invalid format, file parsing error)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error
 */
router.post(
    '/imports/reviews',
    adminController.uploadImport.single('file'),
    adminController.importReviews
);

/**
 * @swagger
 * /api/admin/backup:
 *   post:
 *     summary: Trigger a manual database backup (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Manual backup initiated. Check logs for status.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       500:
 *         description: Server error during backup
 */
router.post(
    '/backup',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    backupUtil.manualBackup
);

module.exports = router;
