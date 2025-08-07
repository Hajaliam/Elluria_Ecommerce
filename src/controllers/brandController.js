// src/controllers/brandController.js

const brandService = require('../services/brandService');
const {logger} = require('../config/logger');

// کنترلر حالا فقط مسئول دریافت درخواست، فراخوانی سرویس و ارسال پاسخ است.

exports.createBrand = async (req, res) => {
    try {
        const newBrand = await brandService.createBrand(req.body);
        res.status(201).json({ message: 'Brand created successfully!', brand: newBrand });
    } catch (error) {
        logger.error(`Error in BrandController createBrand: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getAllBrands = async (req, res) => {
    try {
        const brands = await brandService.getAllBrands();
        res.status(200).json({ brands: brands });
    } catch (error) {
        logger.error(`Error in BrandController getAllBrands: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching brands' , error: error.message});
    }
};

exports.getBrandById = async (req, res) => {
    try {
        const brandData = await brandService.getBrandById(req.params.id);
        res.status(200).json(brandData);
    } catch (error) {
        logger.error(`Error in BrandController getBrandById: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const updatedBrand = await brandService.updateBrand(req.params.id, req.body);
        res.status(200).json({ message: 'Brand updated successfully!', brand: updatedBrand });
    } catch (error) {
        logger.error(`Error in BrandController updateBrand: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        await brandService.deleteBrand(req.params.id);
        res.status(200).json({ message: 'Brand deleted successfully!' });
    } catch (error) {
        logger.error(`Error in BrandController deleteBrand: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};