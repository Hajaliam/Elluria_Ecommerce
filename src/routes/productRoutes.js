// src/routes/productRoutes.js

const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware'); // برای محافظت از روت‌ها

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product management and catalog operations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Smartphone X
 *         description:
 *           type: string
 *           example: Latest model smartphone with advanced features and camera.
 *         price:
 *           type: number
 *           format: float
 *           example: 799.99
 *         stock_quantity:
 *           type: integer
 *           example: 50
 *         image_url:
 *           type: string
 *           format: url
 *           example: "/uploads/products/1234567890-smartphone.jpg"
 *         category_id:
 *           type: integer
 *           example: 1
 *         views_count:
 *           type: integer
 *           example: 120
 *         sold_count:
 *           type: integer
 *           example: 10
 *         slug:
 *           type: string
 *           example: smartphone-x
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock_quantity
 *               - category_id
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Laptop Model
 *               description:
 *                 type: string
 *                 example: A powerful new laptop with advanced features.
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 1200.50
 *               stock_quantity:
 *                 type: integer
 *                 example: 30
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               slug:
 *                 type: string
 *                 example: new-laptop-model
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 *       409:
 *         description: Product with this name or slug already exists
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  productController.upload.single('image'),
  productController.createProduct,
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with optional filters, search, sort, and pagination
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: brand_id
 *         schema:
 *           type: integer
 *         description: Filter by brand ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by product name
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum product price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum product price
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, stock_quantity, views_count, sold_count, createdAt]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sorting order (ascending or descending)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                         format: float
 *                       stock_quantity:
 *                         type: integer
 *                       image_url:
 *                         type: string
 *                       category_id:
 *                         type: integer
 *                       brand_id:
 *                         type: integer
 *                       slug:
 *                         type: string
 *                       views_count:
 *                         type: integer
 *                       sold_count:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       display_price:
 *                         type: number
 *                         format: float
 *                         description: Final price shown to user (campaign price if available)
 *                       original_price:
 *                         type: number
 *                         format: float
 *                         nullable: true
 *                         description: Original product price before campaign (used for discount calculation)
 *                       campaign_price:
 *                         type: number
 *                         format: float
 *                         nullable: true
 *                         description: Active campaign price if applicable
 *       500:
 *         description: Server error
 */
router.get('/', productController.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to get
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', productController.getProductById);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Smartphone X Plus
 *               description:
 *                 type: string
 *                 example: Updated description for the latest smartphone.
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 850.00
 *               stock_quantity:
 *                 type: integer
 *                 example: 45
 *               category_id:
 *                 type: integer
 *                 example: 2
 *               slug:
 *                 type: string
 *                 example: smartphone-x-plus
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product or category not found
 *       409:
 *         description: Product with this name or slug already exists
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  productController.upload.single('image'),
  productController.updateProduct,
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by ID (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:id',
  authMiddleware.authenticateToken,
  authMiddleware.authorizeRoles('admin'),
  productController.deleteProduct,
);

module.exports = router;
