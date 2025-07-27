// src/routes/shippingRoutes.js

const express = require('express');
const shippingController = require('../controllers/shippingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Shipping
 *     description: Order shipping status and tracking management
 */

/**
 * @swagger
 * /api/shipping:
 *   post:
 *     summary: Create new shipment tracking record for an order (Admin only)
 *     tags: [Shipping]
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
 *               - provider_name
 *               - status
 *             properties:
 *               orderId:
 *                 type: integer
 *                 description: The ID of the order to create tracking for
 *                 example: 1
 *               provider_name:
 *                 type: string
 *                 description: Shipping provider name (e.g., 'Post', 'Tipax')
 *                 example: Post
 *               tracking_code:
 *                 type: string
 *                 description: Unique tracking code for the shipment
 *                 example: "TRK1234567890"
 *               status:
 *                 type: string
 *                 description: Current status of the shipment (e.g., 'Pending', 'In Transit', 'Delivered')
 *                 example: Pending
 *               estimated_delivery_date:
 *                 type: string
 *                 format: date
 *                 description: Estimated delivery date (YYYY-MM-DD)
 *                 example: '2025-08-01'
 *     responses:
 *       201:
 *         description: Shipment tracking created successfully
 *       400:
 *         description: Bad Request (e.g., missing fields)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       404:
 *         description: Order not found
 *       409:
 *         description: Conflict, tracking record already exists for this order
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), shippingController.createShipmentTracking);

/**
 * @swagger
 * /api/shipping/{orderId}:
 *   put:
 *     summary: Update shipping status and tracking info for an order (Admin only)
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order to update shipping status for
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider_name:
 *                 type: string
 *                 description: Shipping provider name (e.g., 'Post', 'Tipax')
 *                 example: Post
 *               tracking_code:
 *                 type: string
 *                 description: Unique tracking code for the shipment
 *                 example: "TRK1234567890"
 *               status:
 *                 type: string
 *                 description: Current status of the shipment (e.g., 'Pending', 'In Transit', 'Delivered')
 *                 example: In Transit
 *               estimated_delivery_date:
 *                 type: string
 *                 format: date
 *                 description: Estimated delivery date (YYYY-MM-DD)
 *                 example: '2025-08-01'
 *     responses:
 *       200:
 *         description: Shipping status updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role or CSRF)
 *       404:
 *         description: Order or shipment tracking not found
 *       500:
 *         description: Server error
 */
router.put('/:orderId', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), shippingController.updateShippingStatus);

/**
 * @swagger
 * /api/shipping/{orderId}:
 *   get:
 *     summary: Get shipping status and tracking info for an order (Owner or Admin only)
 *     tags: [Shipping]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the order to get shipping status for
 *         example: 1
 *     responses:
 *       200:
 *         description: Shipping status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shipment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     order_id:
 *                       type: integer
 *                     provider_name:
 *                       type: string
 *                     tracking_code:
 *                       type: string
 *                     status:
 *                       type: string
 *                     estimated_delivery_date:
 *                       type: string
 *                       format: date
 *                     last_update_date:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized user/role)
 *       404:
 *         description: Order or shipment tracking not found
 *       500:
 *         description: Server error
 */
router.get('/:orderId', authMiddleware.authenticateToken, shippingController.getShippingStatus);

module.exports = router;