// src/routes/searchRoutes.js

const express = require('express');
const searchController = require('../controllers/searchController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Search
 *     description: Global search functionality across the website
 */

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Perform a global search for products and categories
 *     tags: [Search]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The search term (e.g., "phone", "book", "laptop")
 *         example: gaming laptop
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Filter products with a minimum price
 *         example: 500
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Filter products with a maximum price
 *         example: 1500
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter for products that are currently in stock (default is true)
 *         example: true
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Filter products with a minimum average rating
 *         example: 4
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: number
 *         description: Filter products with a maximum average rating
 *         example: 5
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: integer
 *         description: Filter products by brand ID
 *         example: 1
 *       - in: query
 *         name: brandName
 *         schema:
 *           type: string
 *         description: Filter products by brand name
 *         example: Apple
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return (default is all)
 *         example: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of results to skip
 *         example: 0
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, most_popular, best_selling, newest, oldest]
 *         description: Field to sort by
 *         example: price
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order (ASC or DESC)
 *         example: DESC
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       400:
 *         description: Bad Request (missing search query)
 *       500:
 *         description: Server error
 */

router.get('/', searchController.globalSearch);

module.exports = router;
