// src/controllers/attributeController.js

const attributeService = require('../services/attributeService');
const logger = require('../config/logger');

exports.createAttribute = async (req, res) => {
    try {
        const attribute = await attributeService.createAttribute(req.body);
        res.status(201).json({ message: 'Attribute created successfully!', attribute });
    } catch (error) {
        logger.error(`CreateAttribute Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.getAllAttributes = async (req, res) => {
    try {
        const attributes = await attributeService.getAllAttributes();
        res.status(200).json({ attributes });
    } catch (error) {
        logger.error(`GetAllAttributes Error: ${error.message}`);
        res.status(500).json({ message: 'Server error fetching attributes' });
    }
};

exports.getAttributeById = async (req, res) => {
    try {
        const attribute = await attributeService.getAttributeById(req.params.id);
        res.status(200).json({ attribute });
    } catch (error) {
        logger.error(`GetAttributeById Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.updateAttribute = async (req, res) => {
    try {
        const attribute = await attributeService.updateAttribute(req.params.id, req.body);
        res.status(200).json({ message: 'Attribute updated successfully!', attribute });
    } catch (error) {
        logger.error(`UpdateAttribute Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.deleteAttribute = async (req, res) => {
    try {
        await attributeService.deleteAttribute(req.params.id);
        res.status(200).json({ message: 'Attribute deleted successfully!' });
    } catch (error) {
        logger.error(`DeleteAttribute Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};