const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Reviews
 *     description: Product review and rating operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewInput:
 *       type: object
 *       required:
 *         - product_id
 *         - rating
 *       properties:
 *         product_id:
 *           type: integer
 *           description: ID of the product being reviewed
 *           example: 1
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given to the product (1-5)
 *           example: 5
 *         comment:
 *           type: string
 *           nullable: true
 *           description: Optional text comment for the review
 *           example: "This product is amazing!"
 *     Review:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the review
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: ID of the user who posted the review
 *           example: 1
 *         product_id:
 *           type: integer
 *           description: ID of the product reviewed
 *           example: 1
 *         rating:
 *           type: integer
 *           description: Rating given (1-5)
 *           example: 5
 *         comment:
 *           type: string
 *           nullable: true
 *           description: Text comment
 *           example: "Highly recommended."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the review was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the review was last updated
 *         example:
 *           id: 1
 *           user_id: 1
 *           product_id: 1
 *           rating: 5
 *           comment: "Excellent product!"
 *           createdAt: "2025-07-12T12:00:00.000Z"
 *           updatedAt: "2025-07-12T12:00:00.000Z"
 *     ReviewWithUser:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/Review'
 *         - type: object
 *           properties:
 *             user:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: testuser
 *                 first_name:
 *                   type: string
 *                   example: Test
 *                 last_name:
 *                   type: string
 *                   example: User
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Create a new product review (Authenticated users only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review created successfully!
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized (no token)
 *       403:
 *         description: Forbidden (invalid token or CSRF)
 *       404:
 *         description: Product not found
 *       409:
 *         description: Conflict, user has already reviewed this product
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware.authenticateToken, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/product/{productId}:
 *   get:
 *     summary: Get all reviews for a specific product
 *     tags: [Reviews]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the product to retrieve reviews for
 *     responses:
 *       200:
 *         description: A list of reviews for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReviewWithUser'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/product/:productId', reviewController.getReviewsByProductId);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     summary: Update a review by ID (Owner or Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: New rating (1-5)
 *                 example: 4
 *               comment:
 *                 type: string
 *                 nullable: true
 *                 description: Updated text comment
 *                 example: "It's good, but not perfect."
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review updated successfully!
 *                 review:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (invalid token, CSRF, or unauthorized user/role)
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware.authenticateToken, reviewController.updateReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review by ID (Owner or Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Review deleted successfully!
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (invalid token, CSRF, or unauthorized user/role)
 *       404:
 *         description: Review not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware.authenticateToken, reviewController.deleteReview);

module.exports = router;