// src/routes/campaignRoutes.js

const express = require('express');
const campaignController = require('../controllers/campaignController');
const authMiddleware = require('./../middlewares/authMiddleware'); // 👈 مسیر صحیح authMiddleware
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Campaigns
 *     description: عملیات مدیریتی مربوط به کمپین‌های تبلیغاتی (Promotional Campaigns)
 */


// روت‌های مدیریت کمپین (Admin only)
/**
 * @swagger
 * /api/admin/campaigns:
 *   post:
 *     summary: Create a new campaign (Admin only)
 *     tags: [Campaigns]
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
 *               - title
 *               - slug
 *               - campaign_type
 *               - start_date
 *               - end_date
 *             properties:
 *               title:
 *                 type: string
 *                 example: Summer Sale
 *               description:
 *                 type: string
 *                 example: Big discounts for summer products.
 *               slug:
 *                 type: string
 *                 example: summer-sale
 *               banner_image_url:
 *                 type: string
 *                 example: /banners/summer_sale.jpg
 *               campaign_type:
 *                 type: string
 *                 example: seasonal
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-07-01T00:00:00Z
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-07-31T23:59:59Z
 *               show_countdown:
 *                 type: boolean
 *                 example: true
 *               priority:
 *                 type: integer
 *                 example: 100
 *               cta_link:
 *                 type: string
 *                 example: /products/summer-collection
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               product_ids:
 *                 type: array
 *                 description: List of product IDs to associate with this campaign
 *                 items:
 *                   type: integer
 *                 example: [1, 5, 10]
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Bad Request (validation errors)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: One or more products not found
 *       409:
 *         description: Conflict (slug already exists)
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), campaignController.createCampaign);

/**
 * @swagger
 * /api/admin/campaigns/{id}:
 *   put:
 *     summary: Update an existing campaign (Admin only)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the campaign to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Campaign title
 *                 example: Fall Collection
 *               description:
 *                 type: string
 *                 example: Discounts on fall products.
 *               slug:
 *                 type: string
 *                 example: fall-collection
 *               banner_image_url:
 *                 type: string
 *                 example: /banners/fall_sale.jpg
 *               campaign_type:
 *                 type: string
 *                 example: seasonal
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-09-01T00:00:00Z
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-11-30T23:59:59Z
 *               show_countdown:
 *                 type: boolean
 *                 example: false
 *               priority:
 *                 type: integer
 *                 example: 50
 *               cta_link:
 *                 type: string
 *                 example: /products/fall-collection
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               product_ids:
 *                 type: array
 *                 description: List of product IDs to associate with this campaign (send empty array to remove all)
 *                 items:
 *                   type: integer
 *                 example: [2, 4]
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *       400:
 *         description: Bad Request (validation errors)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign or Product not found
 *       409:
 *         description: Conflict (slug already exists)
 *       500:
 *         description: Server error
 */

router.put('/:id', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), campaignController.updateCampaign);

/**
 * @swagger
 * /api/admin/campaigns/{id}:
 *   delete:
 *     summary: Delete a campaign (Admin only)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the campaign to delete
 *     responses:
 *       200:
 *         description: Campaign deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */

router.delete('/:id', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), campaignController.deleteCampaign);

/**
 * @swagger
 * /api/admin/campaigns:
 *   get:
 *     summary: Get all campaigns for admin panel (Admin only)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all campaigns
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   campaign_type:
 *                     type: string
 *                   start_date:
 *                     type: string
 *                     format: date-time
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                   is_active:
 *                     type: boolean
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         slug:
 *                           type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

router.get('/', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), campaignController.getAllCampaigns);

/**
 * @swagger
 * /api/admin/campaigns/{id}:
 *   get:
 *     summary: Get a campaign by ID (Admin only)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the campaign to retrieve
 *     responses:
 *       200:
 *         description: Campaign details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 slug:
 *                   type: string
 *                 campaign_type:
 *                   type: string
 *                 start_date:
 *                   type: string
 *                   format: date-time
 *                 end_date:
 *                   type: string
 *                   format: date-time
 *                 is_active:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Campaign not found
 *       500:
 *         description: Server error
 */

router.get('/:id', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), campaignController.getCampaignById);

// روت برای کمپین‌های فعال (برای صفحه اول سایت) - عمومی
/**
 * @swagger
 * /api/campaigns/active:
 *   get:
 *     summary: Get active campaigns for website display
 *     tags: [Campaigns]
 *     security: []  # این روت عمومی است (بدون نیاز به احراز هویت)
 *     responses:
 *       200:
 *         description: A list of active campaigns with their products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   banner_image_url:
 *                     type: string
 *                   campaign_type:
 *                     type: string
 *                   start_date:
 *                     type: string
 *                     format: date-time
 *                   end_date:
 *                     type: string
 *                     format: date-time
 *                   show_countdown:
 *                     type: boolean
 *                   priority:
 *                     type: integer
 *                   cta_link:
 *                     type: string
 *                   is_active:
 *                     type: boolean
 *                   products:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 */

router.get('/active', campaignController.getActiveCampaigns);


module.exports = router;