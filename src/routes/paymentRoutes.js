// src/routes/paymentRoutes.js

const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimiter = require('../middlewares/rateLimitMiddleware');

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
 *   post:
 *     summary: Initiate a payment for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: The ID of the order to initiate payment for
 *                 example: 1
 *     responses:
 *       200:
 *         description: Payment initiation successful. Returns gateway URL.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payment initiation successful. Redirecting to payment gateway.
 *                 paymentGatewayUrl:
 *                   type: string
 *                   example: http://zarinpal.com/pg/StartPay/1500/1
 *                 orderId:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad Request (e.g., order already paid or cancelled)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order has already been paid.
 *       401:
 *         description: Unauthorized (user not authenticated)
 *       403:
 *         description: Forbidden (user not authorized to pay for this order)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Access Denied: You are not authorized to pay for this order.'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found.
 *       500:
 *         description: Server error initiating payment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error initiating payment
 *                 error:
 *                   type: string
 */
router.post('/initiate', authMiddleware.authenticateForPayments,rateLimiter.paymentLimiter, paymentController.initiatePayment);

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
 *         required: false
 *         description: Optional consistency check; the registered Payment Authority determines the Order
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
 *         description: Invalid callback, binding/amount mismatch, or failed provider verification
 *       502:
 *         description: Payment provider verification failed unexpectedly
 *       503:
 *         description: Payment provider adapter is unavailable
 *       500:
 *         description: Server error
 */
router.get('/verify', paymentController.verifyPayment); // 👈 نیازی به احراز هویت با JWT نیست

module.exports = router;
