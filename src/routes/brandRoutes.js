// src/routes/brandRoutes.js

const express = require('express');
const brandController = require('../controllers/brandController');
const authMiddleware = require('./../middlewares/authMiddleware'); // 👈 مسیر صحیح authMiddleware

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Brands
 *     description: Management of product brands
 */


// تمام روت‌های برند فقط برای ادمین مجاز هستند (به جز GET عمومی)
router.post('/', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), brandController.createBrand);
router.put('/:id', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), brandController.updateBrand);
router.delete('/:id', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), brandController.deleteBrand);

// روت‌های GET عمومی هستند
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);

module.exports = router;