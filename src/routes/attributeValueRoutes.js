// src/routes/attributeValueRoutes.js

const express = require('express');
const attributeValueController = require('../controllers/attributeValueController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimitMiddleware = require('../middlewares/rateLimitMiddleware');

// mergeParams: true به ما اجازه می‌دهد به پارامترهای روت پدر (یعنی :attributeId) دسترسی داشته باشیم
const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   - name: Attribute Values (Admin)
 *     description: مدیریت مقادیر یک ویژگی خاص (مانند قرمز، آبی برای رنگ)
 */


// Admin Routes for CUD
/**
 * @swagger
 * /api/admin/attributes/{attributeId}/values:
 *   post:
 *     summary: ایجاد مقدار جدید برای یک ویژگی خاص (فقط ادمین)
 *     tags: [Attribute Values (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ویژگی والد
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: مقدار جدید ویژگی
 *                 example: "قرمز"
 *     responses:
 *       201:
 *         description: مقدار ویژگی با موفقیت ایجاد شد
 *       404:
 *         description: ویژگی والد پیدا نشد
 *       409:
 *         description: این مقدار برای این ویژگی قبلاً وجود دارد
 *       401:
 *         description: عدم دسترسی (Unauthorized)
 *       403:
 *         description: دسترسی غیرمجاز (Forbidden)
 *       500:
 *         description: خطای سرور
 */
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    attributeValueController.createValueForAttribute);

/**
 * @swagger
 * /api/admin/attributes/{attributeId}/values/{valueId}:
 *   put:
 *     summary: به‌روزرسانی مقدار یک ویژگی (فقط ادمین)
 *     tags: [Attribute Values (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ویژگی والد
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID مقدار ویژگی مورد نظر
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: مقدار جدید ویژگی
 *                 example: "آبی"
 *     responses:
 *       200:
 *         description: مقدار ویژگی با موفقیت به‌روزرسانی شد
 *       404:
 *         description: مقدار ویژگی یا ویژگی والد پیدا نشد
 *       409:
 *         description: این مقدار برای این ویژگی قبلاً وجود دارد
 *       401:
 *         description: عدم دسترسی (Unauthorized)
 *       403:
 *         description: دسترسی غیرمجاز (Forbidden)
 *       500:
 *         description: خطای سرور
 */
router.put('/:valueId',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    attributeValueController.updateValue);

/**
 * @swagger
 * /api/admin/attributes/{attributeId}/values/{valueId}:
 *   delete:
 *     summary: حذف یک مقدار ویژگی (فقط ادمین)
 *     tags: [Attribute Values (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ویژگی والد
 *       - in: path
 *         name: valueId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID مقدار ویژگی برای حذف
 *     responses:
 *       200:
 *         description: مقدار ویژگی با موفقیت حذف شد
 *       404:
 *         description: مقدار ویژگی یا ویژگی والد پیدا نشد
 *       401:
 *         description: عدم دسترسی (Unauthorized)
 *       403:
 *         description: دسترسی غیرمجاز (Forbidden)
 *       500:
 *         description: خطای سرور
 */
router.delete('/:valueId',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    attributeValueController.deleteValue);

// Public Route for GET
/**
 * @swagger
 * /api/admin/attributes/{attributeId}/values:
 *   get:
 *     summary: دریافت لیست مقادیر یک ویژگی خاص (عمومی، با ریت لیمیت)
 *     tags: [Attribute Values (Admin)]
 *     parameters:
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ویژگی مورد نظر
 *     responses:
 *       200:
 *         description: لیست مقادیر ویژگی با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 values:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       value:
 *                         type: string
 *       429:
 *         description: تعداد درخواست‌ها بیش از حد مجاز است (Rate limit exceeded)
 *       500:
 *         description: خطای سرور
 */
router.get('/',
    rateLimitMiddleware.generalLimiter,
    attributeValueController.getValuesForAttribute);

module.exports = router;