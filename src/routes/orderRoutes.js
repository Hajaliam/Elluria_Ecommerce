// src/routes/orderRoutes.js

const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order management and processing operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderInput:
 *       type: object
 *       required:
 *         - shippingAddressId
 *       properties:
 *         shippingAddressId:
 *           type: integer
 *           description: The ID of the shipping address for the order
 *           example: 1
 *         couponCode:
 *           type: string
 *           description: Optional coupon code to apply to the order
 *           example: SUMMER20
 *
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the order
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID of the user who placed the order
 *           example: 1
 *         total_amount:
 *           type: number
 *           format: float
 *           description: Total amount of the order after discounts
 *           example: 799.99
 *         status:
 *           type: string
 *           description: Current status of the order (e.g., pending, processing, shipped, delivered, cancelled, refunded)
 *           example: pending
 *         shipping_address_id:
 *           type: integer
 *           description: ID of the shipping address used for the order
 *           example: 1
 *         payment_status:
 *           type: string
 *           description: Status of the payment for the order (e.g., unpaid, paid, refunded)
 *           example: unpaid
 *         coupon_id:
 *           type: integer
 *           nullable: true
 *           description: ID of the coupon used for the order (if any)
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     OrderWithDetails:
 *       allOf:
 *         - $ref: '#/components/schemas/Order'
 *         - type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserBasic'
 *             shippingAddress:
 *               $ref: '#/components/schemas/Address'
 *             coupon:
 *               $ref: '#/components/schemas/CouponBasic'
 *             orderItems:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrderItem'
 *
 *     OrderStatusUpdate:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           description: New status for the order
 *           example: shipped
 *
 *     UserBasic:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *
 *     Address:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         street:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zip_code:
 *           type: string
 *         country:
 *           type: string
 *
 *     CouponBasic:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         discount_type:
 *           type: string
 *         discount_value:
 *           type: number
 *           format: float
 *
 *     OrderItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         order_id:
 *           type: integer
 *         product_id:
 *           type: integer
 *         quantity:
 *           type: integer
 *         price_at_purchase:
 *           type: number
 *           format: float
 *         product:
 *           $ref: '#/components/schemas/ProductBasic'
 *
 *     ProductBasic:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         image_url:
 *           type: string
 */

/**
 * @swagger
 * /api/orders/place-order:
 *   post:
 *     summary: Place or update an unpaid order from the cart
 *     tags: [Orders]
 *     description: >
 *       Finalizes the current cart for the authenticated user, applies coupon rules,
 *       reserves inventory, and creates or updates an unpaid order.
 *       Supports various types of coupons including:
 *       - Product-specific coupons
 *       - Category-specific coupons
 *       - Free shipping coupons
 *       - First-purchase-only coupons
 *       - Private user-specific coupons
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddressId:
 *                 type: integer
 *                 example: 1
 *               couponCode:
 *                 type: string
 *                 example: "NEWUSER20"
 *     responses:
 *       201:
 *         description: Order placed or updated successfully, with inventory reserved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order placed and stock reserved. Awaiting payment...
 *                 orderId:
 *                   type: integer
 *                   example: 123
 *                 totalAmount:
 *                   type: number
 *                   format: float
 *                   example: 149.99
 *       400:
 *         description: Bad Request - Cart empty, invalid coupon, stock issues, or coupon restrictions
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post(
  '/place-order',
  authMiddleware.authenticateToken,
  orderController.placeOrder,
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (Admin) or current user's orders (Customer)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: query
 *         description: Filter orders by user ID (only for Admin)
 *         required: false
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: Filter orders by status (only for Admin)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [pending, processing, delivered]
 *       - name: payment_status
 *         in: query
 *         description: Filter orders by payment status (only for Admin)
 *         required: false
 *         schema:
 *           type: string
 *           enum: [paid, unpaid]
 *     responses:
 *       200:
 *         description: A list of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderWithDetails'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Access denied or not logged in)
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware.authenticateToken, orderController.getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     description: Retrieves full details of a specific order. Accessible by order owner or Admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the order to retrieve
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderWithDetails'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:id',
  authMiddleware.authenticateToken,
  orderController.getOrderById,
);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update the status of an order (Admin only)
 *     tags: [Orders]
 *     description: >
 *       Updates the status of an existing order by its ID.
 *       Allowed status values include: `pending`, `processing`, `shipped`, `delivered`, `cancelled`, and `refunded`.
 *       Also logs the status change to OrderHistory for auditing.
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled, refunded]
 *                 example: shipped
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully!
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (admin access required)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id/status',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  orderController.updateOrderStatus,
);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order (Owner or Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the order to cancel
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id/cancel',
  authMiddleware.authenticateToken,
  orderController.cancelOrder,
);

module.exports = router;
