// src/routes/attributeRoutes.js

const express = require('express');
const attributeController = require('../controllers/attributeController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimitMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Attributes (Admin)
 *     description: مدیریت ویژگی‌های محصولات (مانند رنگ، سایز) - نیازمند نقش ادمین
 */


// تمام مسیرها به جز خواندن، نیازمند نقش ادمین هستند
/**
 * @swagger
 * /api/admin/attributes:
 *   post:
 *     summary: ایجاد یک ویژگی جدید
 *     tags: [Attributes (Admin)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: نام منحصر به فرد ویژگی
 *                 example: "رنگ"
 *     responses:
 *       201:
 *         description: ویژگی با موفقیت ایجاد شد
 *       401:
 *         description: عدم دسترسی (Unauthorized)
 *       403:
 *         description: دسترسی غیرمجاز (Forbidden)
 *       409:
 *         description: ویژگی با این نام از قبل وجود دارد (Conflict)
 *       500:
 *         description: خطای سرور
 */
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    attributeController.createAttribute);

/**
 * @swagger
 * /api/admin/attributes/{id}:
 *   put:
 *     summary: به‌روزرسانی یک ویژگی بر اساس ID
 *     tags: [Attributes (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ویژگی مورد نظر
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: نام جدید و منحصر به فرد ویژگی
 *                 example: "سایز"
 *     responses:
 *       200:
 *         description: ویژگی با موفقیت به‌روزرسانی شد
 *       404:
 *         description: ویژگی پیدا نشد
 *       409:
 *         description: ویژگی با این نام از قبل وجود دارد
 *       500:
 *         description: خطای سرور
 */
router.put('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    attributeController.updateAttribute);

/**
 * @swagger
 * /api/admin/attributes/{id}:
 *   delete:
 *     summary: حذف یک ویژگی بر اساس ID
 *     tags: [Attributes (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ویژگی مورد نظر برای حذف
 *     responses:
 *       200:
 *         description: ویژگی با موفقیت حذف شد
 *       404:
 *         description: ویژگی پیدا نشد
 *       500:
 *         description: خطای سرور
 */
router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    attributeController.deleteAttribute);

// مسیرهای خواندن  عمومی با محدود کننده تعداد درخواست
/**
 * @swagger
 * /api/admin/attributes:
 *   get:
 *     summary: دریافت لیست تمام ویژگی‌ها به همراه مقادیر آن‌ها (عمومی، با ریت لیمیت)
 *     tags: [Attributes (Admin)]
 *     responses:
 *       200:
 *         description: لیست ویژگی‌ها با موفقیت دریافت شد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       values:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             value:
 *                               type: string
 *       429:
 *         description: تعداد درخواست‌ها بیش از حد مجاز است (Rate limit exceeded)
 *       500:
 *         description: خطای سرور
 */
router.get('/',
    rateLimiter.generalLimiter,
    attributeController.getAllAttributes);

/**
 * @swagger
 * /api/admin/attributes/{id}:
 *   get:
 *     summary: دریافت یک ویژگی خاص بر اساس ID به همراه مقادیر آن (عمومی، با ریت لیمیت)
 *     tags: [Attributes (Admin)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ویژگی مورد نظر
 *     responses:
 *       200:
 *         description: اطلاعات ویژگی با موفقیت دریافت شد
 *       404:
 *         description: ویژگی پیدا نشد
 *       429:
 *         description: تعداد درخواست‌ها بیش از حد مجاز است (Rate limit exceeded)
 *       500:
 *         description: خطای سرور
 */
router.get('/:id',
    rateLimiter.generalLimiter,
    attributeController.getAttributeById);

module.exports = router;