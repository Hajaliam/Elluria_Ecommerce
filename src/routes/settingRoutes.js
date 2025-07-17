// src/routes/settingRoutes.js

const express = require('express');
const settingController = require('../controllers/settingController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Settings
 *     description: Global application settings management (Admin only)
 */

// تمام روت‌های تنظیمات فقط برای ادمین مجاز هستند
router.use(authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'));

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create or update a global setting (Admin only)
 *     tags: [Settings]
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
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *                 description: Unique key for the setting (e.g., 'site_name', 'contact_email')
 *                 example: site_name
 *               value:
 *                 type: string
 *                 description: Value of the setting
 *                 example: Lamora Online Shop
 *     responses:
 *       200:
 *         description: Setting created or updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', settingController.setSetting);

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     summary: Get a specific setting by key (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Key of the setting to retrieve
 *         example: site_name
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */
router.get('/:key', settingController.getSetting);

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all global settings (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all settings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.get('/', settingController.getAllSettings);

/**
 * @swagger
 * /api/settings/{key}:
 *   delete:
 *     summary: Delete a setting by key (Admin only)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *       - csrfToken: []
 *     parameters:
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Key of the setting to delete
 *         example: site_name
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */
router.delete('/:key', settingController.deleteSetting);

module.exports = router;