// src/controllers/productVariantController.js

const productVariantService = require('../services/productVariantService');
const { logger } = require('../config/logger');

exports.getVariantsForProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const variants = await productVariantService.getVariantsForProduct(productId);
        res.status(200).json({ variants });
    } catch (error) {
        logger.error(`GetVariants Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.createVariantForProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const variant = await productVariantService.createVariantForProduct(productId, req.body);
        res.status(201).json({ message: 'Product variant created successfully!', variant });
    } catch (error) {
        logger.error(`CreateVariant Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
exports.updateVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const updatedVariant = await productVariantService.updateVariant(variantId, req.body);
        res.status(200).json({ message: 'Product variant updated successfully!', variant: updatedVariant });
    } catch (error) {
        logger.error(`UpdateVariant Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.deleteVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const result = await productVariantService.deleteVariant(variantId);
        res.status(200).json(result);
    } catch (error) {
        logger.error(`DeleteVariant Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};
