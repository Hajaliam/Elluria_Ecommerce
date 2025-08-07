// src/controllers/attributeValueController.js

const attributeValueService = require('../services/attributeValueService');
const {logger} = require('../config/logger');

exports.getValuesForAttribute = async (req, res) => {
    try {
        const { attributeId } = req.params;
        const values = await attributeValueService.getValuesForAttribute(attributeId);
        res.status(200).json({ values });
    } catch (error) {
        logger.error(`GetValuesForAttribute Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.createValueForAttribute = async (req, res) => {
    try {
        const { attributeId } = req.params;
        const value = await attributeValueService.createValueForAttribute(attributeId, req.body);
        res.status(201).json({ message: 'Attribute value created successfully!', value });
    } catch (error) {
        logger.error(`CreateValueForAttribute Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.updateValue = async (req, res) => {
    try {
        const { valueId } = req.params;
        const value = await attributeValueService.updateValue(valueId, req.body);
        res.status(200).json({ message: 'Attribute value updated successfully!', value });
    } catch (error) {
        logger.error(`UpdateValue Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

exports.deleteValue = async (req, res) => {
    try {
        const { valueId } = req.params;
        await attributeValueService.deleteValue(valueId);
        res.status(200).json({ message: 'Attribute value deleted successfully!' });
    } catch (error) {
        logger.error(`DeleteValue Error: ${error.message}`);
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};