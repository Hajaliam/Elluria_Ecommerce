// src/routes/couponRoutes.js

const express = require('express');
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Coupons
 *     description: Coupon code management operations (Admin only)
 *
 * components:
 *   schemas:
 *     CouponInput:
 *       type: object
 *       required:
 *         - code
 *         - discount_type
 *         - discount_value
 *       properties:
 *         code:
 *           type: string
 *           example: NEWYEAR2025
 *         discount_type:
 *           type: string
 *           enum: [percentage, fixed_amount]
 *           example: percentage
 *         discount_value:
 *           type: number
 *           format: float
 *           example: 10
 *         min_amount:
 *           type: number
 *           format: float
 *           example: 50.00
 *         usage_limit:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         expiry_date:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: 2025-12-31
 *         isActive:
 *           type: boolean
 *           example: true
 *
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         code:
 *           type: string
 *           example: NEWYEAR2025
 *         discount_type:
 *           type: string
 *           example: percentage
 *         discount_value:
 *           type: number
 *           format: float
 *           example: 10.00
 *         min_amount:
 *           type: number
 *           format: float
 *           example: 50.00
 *         usage_limit:
 *           type: integer
 *           nullable: true
 *           example: 100
 *         used_count:
 *           type: integer
 *           example: 5
 *         expiry_date:
 *           type: string
 *           format: date
 *           nullable: true
 *           example: 2025-12-31
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/coupons:
 *   post:
 *     summary: Create a new coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CouponInput'
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Coupon with this code already exists
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  couponController.createCoupon,
);

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get all coupons (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all coupons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coupons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get(
  '/',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  couponController.getAllCoupons,
);

/**
 * @swagger
 * /api/coupons/{code}:
 *   get:
 *     summary: Get a coupon by its code (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The code of the coupon to retrieve
 *     responses:
 *       200:
 *         description: Coupon details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Coupon not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:code',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  couponController.getCouponByCode,
);

/**
 * @swagger
 * /api/coupons/{code}:
 *   put:
 *     summary: Update a coupon by its code (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The code of the coupon to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               new_code:
 *                 type: string
 *                 example: SPRING_SALE
 *               discount_type:
 *                 type: string
 *                 enum: [percentage, fixed_amount]
 *                 example: fixed_amount
 *               discount_value:
 *                 type: number
 *                 format: float
 *                 example: 15.00
 *               min_amount:
 *                 type: number
 *                 format: float
 *                 example: 75.00
 *               usage_limit:
 *                 type: integer
 *                 example: 200
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-31
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Coupon'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Coupon not found
 *       409:
 *         description: Conflict - new code already exists
 *       500:
 *         description: Server error
 */
router.put(
  '/:code',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  couponController.updateCoupon,
);

/**
 * @swagger
 * /api/coupons/{code}:
 *   delete:
 *     summary: Delete a coupon by its code (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: The code of the coupon to delete
 *     responses:
 *       200:
 *         description: Coupon deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Coupon deleted successfully!
 *       400:
 *         description: Bad request (e.g. associated orders exist)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Coupon not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:code',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  couponController.deleteCoupon,
);

module.exports = router;
