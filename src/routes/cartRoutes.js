// src/routes/cartRoutes.js

const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Shopping cart management operations for both logged-in and guest users
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *     sessionId:
 *       type: apiKey
 *       in: cookie
 *       name: sessionId
 *     csrfToken:
 *       type: apiKey
 *       in: header
 *       name: X-CSRF-Token
 *
 *   schemas:
 *     CartItemInput:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: integer
 *           description: The ID of the product to add to the cart
 *           example: 1
 *         quantity:
 *           type: integer
 *           description: The quantity of the product
 *           example: 1
 *
 *     CartItem:
 *       type: object
 *       properties:
 *         cartItemId:
 *           type: integer
 *           example: 1
 *         productId:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Smartphone X
 *         quantity:
 *           type: integer
 *           example: 2
 *         price:
 *           type: number
 *           format: float
 *           example: 799.99
 *         image_url:
 *           type: string
 *           example: "/uploads/products/123.jpg"
 *         stock_available:
 *           type: integer
 *           example: 48
 *         status:
 *           type: string
 *           example: available
 *
 *     CartDetails:
 *       type: object
 *       properties:
 *         cartId:
 *           type: integer
 *           example: 1
 *         userId:
 *           type: integer
 *           nullable: true
 *           example: 101
 *         sessionId:
 *           type: string
 *           nullable: true
 *           example: "guest_session_12345"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         totalItems:
 *           type: integer
 *           example: 2
 *         totalAmount:
 *           type: number
 *           format: float
 *           example: 1599.98
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 */

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - sessionId: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItemInput'
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item added to cart successfully!
 *                 cartItem:
 *                   $ref: '#/components/schemas/CartItem'
 *                 sessionId:
 *                   type: string
 *                   nullable: true
 *                   description: New session ID if generated
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post(
  '/add',
  authMiddleware.authenticateToken,
  cartController.addItemToCart,
);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get cart contents
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - sessionId: []
 *     responses:
 *       200:
 *         description: Cart contents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartDetails'
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware.authenticateToken, cartController.getCart);

/**
 * @swagger
 * /api/cart/{cartItemId}:
 *   put:
 *     summary: Update quantity of an item in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - sessionId: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cart item quantity updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart item quantity updated successfully!
 *                 cartItem:
 *                   $ref: '#/components/schemas/CartItem'
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:cartItemId',
  authMiddleware.authenticateToken,
  cartController.updateCartItemQuantity,
);

/**
 * @swagger
 * /api/cart/{cartItemId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - sessionId: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item to remove
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item removed from cart successfully!
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Cart item not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:cartItemId',
  authMiddleware.authenticateToken,
  cartController.removeItemFromCart,
);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear the entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *       - sessionId: []
 *       - csrfToken: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cart cleared successfully!
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/', authMiddleware.authenticateToken, cartController.clearCart);

module.exports = router;
