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
 *     description: Create a new promotional campaign with optional product assignments. You can either provide product list directly or later import products via file.
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
 *                 description: Campaign title
 *                 example: Summer Sale
 *               description:
 *                 type: string
 *                 description: Optional campaign description
 *                 example: Big discounts for summer products.
 *               slug:
 *                 type: string
 *                 description: Unique, URL-friendly identifier
 *                 example: summer-sale
 *               banner_image_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the campaign banner image
 *                 example: /banners/summer_sale.jpg
 *               campaign_type:
 *                 type: string
 *                 description: Type of campaign (e.g. seasonal, clearance, bestsellers)
 *                 example: seasonal
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Campaign start date (you may also use JavaScript Date values like `new Date()` or `moment().subtract(1, 'days').toDate()`)
 *                 example: 2025-07-01T00:00:00Z
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: Campaign end date (e.g., `moment().add(7, 'days').toDate()`)
 *                 example: 2025-07-31T23:59:59Z
 *               show_countdown:
 *                 type: boolean
 *                 description: Whether to display countdown timer
 *                 example: true
 *               priority:
 *                 type: integer
 *                 description: Display priority; lower values appear first
 *                 example: 100
 *               cta_link:
 *                 type: string
 *                 format: uri
 *                 description: Optional CTA link shown on banners or campaign section
 *                 example: /products/summer-collection
 *               is_active:
 *                 type: boolean
 *                 description: Whether the campaign is active and visible
 *                 example: true
 *               products:
 *                 type: array
 *                 description: Optional array of products with campaign pricing (if not provided, campaign will be created without products)
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       description: ID of the product to include in the campaign
 *                       example: 1
 *                     campaign_price:
 *                       type: number
 *                       description: Special price during the campaign (must be ≤ original_price)
 *                       example: 19900
 *                     original_price:
 *                       type: number
 *                       description: Optional reference price (defaults to product’s current price if not provided)
 *                       example: 25000
 *     responses:
 *       201:
 *         description: Campaign created successfully
 *       400:
 *         description: Bad Request (validation errors or logical issues like start_date > end_date)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (insufficient permissions)
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
 * /api/admin/campaigns/{campaignId}/import-products:
 *   post:
 *     summary: Import products to a campaign from CSV or Excel file (Admin only)
 *     description: Upload a CSV or Excel file to bulk-import campaign product assignments. Each row must include product_slug, campaign_price, and (optionally) original_price.
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the campaign to import products into
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - format
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV or Excel file containing campaign products. Each row should include product_slug, campaign_price, and optionally original_price.
 *               format:
 *                 type: string
 *                 enum: [csv, excel]
 *                 description: File format being uploaded (csv or excel)
 *                 example: csv
 *     responses:
 *       200:
 *         description: Campaign products imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campaign products imported successfully!
 *                 importedCount:
 *                   type: integer
 *                   example: 10
 *                 updatedCount:
 *                   type: integer
 *                   example: 0
 *                 errors:
 *                   type: array
 *                   description: Array of records with import errors
 *                   items:
 *                     type: object
 *                     properties:
 *                       record:
 *                         type: object
 *                         description: The original record that failed
 *                       error:
 *                         type: string
 *                         description: Error message for the failed record
 *       400:
 *         description: Bad Request (e.g., missing file or format, invalid content)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (e.g., role not allowed or CSRF token missing)
 *       404:
 *         description: Campaign not found or one of the product slugs is invalid
 *       500:
 *         description: Server error (e.g., database error, file parsing failure)
 */
router.post('/:campaignId/import-products', campaignController.uploadImport.single('file'), campaignController.importCampaignProducts);

/**
 * @swagger
 * /api/admin/campaigns/{id}:
 *   put:
 *     summary: Update a campaign by ID (Admin only)
 *     tags: [Campaigns]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Numeric ID of the campaign to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Summer Sale Updated
 *               description:
 *                 type: string
 *                 example: Updated description for summer sale campaign.
 *               slug:
 *                 type: string
 *                 example: summer-sale-updated
 *               banner_image_url:
 *                 type: string
 *                 example: /banners/summer_sale_updated.jpg
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
 *                 example: 50
 *               cta_link:
 *                 type: string
 *                 example: /products/summer-collection
 *               is_active:
 *                 type: boolean
 *                 example: true
 *               products:
 *                 type: array
 *                 description: List of products with optional campaign pricing
 *                 items:
 *                   type: object
 *                   required:
 *                     - product_id
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 1
 *                     campaign_price:
 *                       type: number
 *                       nullable: true
 *                       example: 79.99
 *                     original_price:
 *                       type: number
 *                       nullable: true
 *                       example: 99.99
 *     responses:
 *       200:
 *         description: Campaign updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Campaign updated successfully.
 *                 campaign:
 *                   $ref: '#/components/schemas/Campaign'
 *       400:
 *         description: Invalid input or date validation error
 *       404:
 *         description: Campaign or one or more products not found
 *       409:
 *         description: Slug already in use by another campaign
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
 * /api/admin/campaigns/{campaignId}/products/{productId}:
 *   delete:
 *     summary: Remove a product from a specific campaign (Admin only)
 *     tags:
 *       - Campaigns
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the campaign
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the product to remove from the campaign
 *     responses:
 *       200:
 *         description: Product removed from campaign successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Product removed from campaign successfully.
 *       404:
 *         description: Campaign or product not found
 *         content:
 *           application/json:
 *             example:
 *               message: Campaign not found.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.delete('/:campaignId/products/:productId', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), campaignController.removeProductFromCampaign);

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