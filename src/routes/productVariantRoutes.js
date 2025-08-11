// src/routes/productVariantRoutes.js

const express = require('express');
const productVariantController = require('../controllers/productVariantController');
const authMiddleware = require('../middlewares/authMiddleware');
const limitMiddleware = require('../middlewares/rateLimitMiddleware');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   - name: Product Variants (Admin)
 *     description: مدیریت متغیرهای یک محصول خاص (مانند رنگ‌ها و سایزهای مختلف)
 */


/**
 * @swagger
 * /api/admin/products/{productId}/variants:
 *   get:
 *     summary: دریافت لیست تمام متغیرهای یک محصول
 *     tags: [Product Variants (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID محصول مادر
 *     responses:
 *       200:
 *         description: لیست متغیرها با موفقیت دریافت شد
 *       404:
 *         description: محصول مادر پیدا نشد
 */
router.get('/',limitMiddleware.generalLimiter  ,productVariantController.getVariantsForProduct);

/**
 * @swagger
 * /api/admin/products/{productId}/variants:
 *   post:
 *     summary: ایجاد یک متغیر جدید برای یک محصول
 *     tags: [Product Variants (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID محصول مادر
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock_quantity
 *               - values
 *             properties:
 *               price:
 *                 type: number
 *                 description: "قیمت خاص این متغیر (اگر خالی باشد، از محصول مادر ارث‌بری می‌کند)"
 *                 example: 275000
 *               stock_quantity:
 *                 type: integer
 *                 description: "موجودی انبار برای این متغیر خاص"
 *                 example: 50
 *               sku:
 *                 type: string
 *                 description: "کد انبارداری منحصر به فرد (اختیاری)"
 *                 example: "RLM-312-RED"
 *               values:
 *                 type: array
 *                 description: "آرایه‌ای از ID های مقادیر ویژگی‌ها (AttributeValue IDs)"
 *                 items:
 *                   type: integer
 *                 example: [1, 5]
 *     responses:
 *       201:
 *         description: متغیر با موفقیت ایجاد شد
 *       400:
 *         description: داده‌های ورودی نامعتبر است (مثلاً value ID اشتباه است)
 *       404:
 *         description: محصول مادر پیدا نشد
 */
router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    productVariantController.createVariantForProduct);

/**
 * @swagger
 * /api/admin/products/{productId}/variants/{variantId}:
 *   put:
 *     summary: ویرایش یک متغیر محصول
 *     tags: [Product Variants (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID محصول مادر
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID متغیر محصول
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 example: 299000
 *               stock_quantity:
 *                 type: integer
 *                 example: 40
 *               sku:
 *                 type: string
 *                 example: "RLM-312-BLUE"
 *               image_url:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               values:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 7]
 *     responses:
 *       200:
 *         description: متغیر با موفقیت ویرایش شد
 *       400:
 *         description: داده‌های ورودی نامعتبر
 *       404:
 *         description: متغیر یا محصول پیدا نشد
 */
router.put(
    '/:variantId',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    productVariantController.updateVariant
);

/**
 * @swagger
 * /api/admin/products/{productId}/variants/{variantId}:
 *   delete:
 *     summary: حذف یک متغیر محصول
 *     tags: [Product Variants (Admin)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID محصول مادر
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID متغیر محصول
 *     responses:
 *       200:
 *         description: متغیر با موفقیت حذف شد
 *       404:
 *         description: متغیر یا محصول پیدا نشد
 */
router.delete(
    '/:variantId',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    productVariantController.deleteVariant
);


module.exports = router;