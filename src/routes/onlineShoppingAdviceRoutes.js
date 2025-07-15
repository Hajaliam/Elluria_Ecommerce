// src/routes/onlineShoppingAdviceRoutes.js

const express = require('express');
const onlineShoppingAdviceController = require('../controllers/onlineShoppingAdviceController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Online Shopping Advice (Chat History)
 *     description: Management of online chat advice history (primarily for Admin/User to view)
 *
 * components:
 *   schemas:
 *     OnlineShoppingAdvice:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         user_id:
 *           type: integer
 *           nullable: true
 *           example: 1
 *         session_id:
 *           type: string
 *           nullable: true
 *           example: "guest_session_xyz"
 *         chat_text:
 *           type: string
 *           example: "I need help finding a laptop."
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-07-12T12:00:00.000Z"
 *         object:
 *           type: string
 *           nullable: true
 *           example: "laptop recommendation"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     OnlineShoppingAdviceWithUser:
 *       allOf:
 *         - $ref: '#/components/schemas/OnlineShoppingAdvice'
 *         - type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/UserBasic'
 */

/**
 * @swagger
 * /api/advice:
 *   get:
 *     summary: Get all online shopping advice requests (Admin only)
 *     tags: [Online Shopping Advice (Chat History)]
 *     description: Retrieves a list of all chat advice history records.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of advice requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 advice_requests:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OnlineShoppingAdviceWithUser'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized role)
 *       500:
 *         description: Server error
 */
router.get(
    '/',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    onlineShoppingAdviceController.getAllAdvice
);

/**
 * @swagger
 * /api/advice/{id}:
 *   get:
 *     summary: Get a specific online shopping advice request by ID (Admin or owner only)
 *     tags: [Online Shopping Advice (Chat History)]
 *     description: Retrieves details of a specific chat advice record.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the advice record to retrieve
 *     responses:
 *       200:
 *         description: Advice request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnlineShoppingAdviceWithUser'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (unauthorized user/role)
 *       404:
 *         description: Advice request not found
 *       500:
 *         description: Server error
 */
router.get(
    '/:id',
    authMiddleware.authenticateToken,
    onlineShoppingAdviceController.getAdviceById
);

/**
 * @swagger
 * /api/advice/{id}:
 *   put:
 *     summary: Update an online shopping advice request by ID (Admin only)
 *     tags: [Online Shopping Advice (Chat History)]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the advice record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chat_text:
 *                 type: string
 *                 example: "Admin's updated response to user's query."
 *               object:
 *                 type: string
 *                 nullable: true
 *                 example: "resolved - laptop issue"
 *     responses:
 *       200:
 *         description: Advice request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnlineShoppingAdvice'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Advice request not found
 *       500:
 *         description: Server error
 */
router.put(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    onlineShoppingAdviceController.updateAdvice
);

/**
 * @swagger
 * /api/advice/{id}:
 *   delete:
 *     summary: Delete an online shopping advice request by ID (Admin only)
 *     tags: [Online Shopping Advice (Chat History)]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the advice record to delete
 *     responses:
 *       200:
 *         description: Advice request deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Advice request not found
 *       500:
 *         description: Server error
 */
router.delete(
    '/:id',
    authMiddleware.authenticateToken,
    authMiddleware.authorizeRoles('admin'),
    onlineShoppingAdviceController.deleteAdvice
);

module.exports = router;
