// src/routes/paymentRoutes.js

const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment processing operations
 */

/**
 * @swagger
 * /api/payments/initiate:
 * post:
 * summary: Initiate a payment using a coupon code
 * tags: [Payments]
 * security:
 *   - bearerAuth: []
 *   - csrfToken: []
 * requestBody:
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         required:
 *           - orderId
 *         properties:
 *           couponCode:
 *             type: string
 *             description: The coupon code used for the order
 *             example: SUMMER2025
 * responses:
 *   200:
 *     description: Payment initiation successful. Returns gateway URL.
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *             paymentGatewayUrl:
 *               type: string
 *             orderId:
 *               type: integer
 *   400:
 *     description: Bad Request (e.g., invalid or expired coupon)
 *   401:
 *     description: Unauthorized
 *   403:
 *     description: Forbidden (invalid token, CSRF, or unauthorized user)
 *   404:
 *     description: Coupon or associated order not found
 *   500:
 *     description: Server error
 */

router.post('/initiate', authMiddleware.authenticateToken, paymentController.initiatePayment);

/**
 * @swagger
 * /api/payments/verify:
 *   get:
 *     summary: Verify payment from gateway callback (Webhook)
 *     tags: [Payments]
 *     description: This endpoint is called by the payment gateway after a transaction.
 *     security: []  # No authentication needed from gateway
 *     parameters:
 *       - in: query
 *         name: Authority
 *         schema:
 *           type: string
 *         required: true
 *         description: Transaction Authority from Zarinpal or similar gateway
 *         example: "A0000000000000000000000000000001"
 *       - in: query
 *         name: Status
 *         schema:
 *           type: string
 *         required: true
 *         description: Payment status from gateway (e.g., 'OK' for success)
 *         example: "OK"
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Your internal Order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Payment verified and order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: integer
 *                 paymentId:
 *                   type: integer
 *       400:
 *         description: Payment failed or cancelled, or invalid status
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */

router.get('/verify', paymentController.verifyPayment); // 👈 نیازی به احراز هویت با JWT نیست

module.exports = router;