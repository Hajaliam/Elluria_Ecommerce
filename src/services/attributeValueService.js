// src/services/attributeValueService.js

const attributeRepository = require('../repositories/attributeRepository');
const attributeValueRepository = require('../repositories/attributeValueRepository');
const { sanitizeString } = require('../utils/sanitizer');

class AttributeValueService {
    constructor(attrRepo, attrValueRepo) {
        this.attributeRepository = attrRepo;
        this.attributeValueRepository = attrValueRepo;
    }

    async getValuesForAttribute(attributeId) {
        const attribute = await this.attributeRepository.findById(attributeId);
        if (!attribute) {
            const error = new Error('Parent attribute not found.');
            error.statusCode = 404;
            throw error;
        }
        return await this.attributeValueRepository.findAllByAttributeId(attributeId);
    }

    async createValueForAttribute(attributeId, data) {
        const { value } = data;
        const sanitizedValue = sanitizeString(value);

        const attribute = await this.attributeRepository.findById(attributeId);
        if (!attribute) {
            const error = new Error('Parent attribute not found.');
            error.statusCode = 404;
            throw error;
        }

        const existingValue = await this.attributeValueRepository.findByValue(attributeId, sanitizedValue);
        if (existingValue) {
            const error = new Error('This value already exists for this attribute.');
            error.statusCode = 409;
            throw error;
        }

        return await this.attributeValueRepository.create({
            attribute_id: attributeId,
            value: sanitizedValue
        });
    }

    async updateValue(valueId, data) {
        const { value } = data;
        const valueInstance = await this.attributeValueRepository.findById(valueId);
        if (!valueInstance) {
            const error = new Error('Attribute value not found.');
            error.statusCode = 404;
            throw error;
        }

        const sanitizedValue = sanitizeString(value);
        const existingValue = await this.attributeValueRepository.findByValue(valueInstance.attribute_id, sanitizedValue);
        if (existingValue && existingValue.id !== parseInt(valueId)) {
            const error = new Error('This value already exists for this attribute.');
            error.statusCode = 409;
            throw error;
        }

        valueInstance.value = sanitizedValue;
        return await valueInstance.save(); // Note: we need to add a .save method to our repo
    }

    async deleteValue(valueId) {
        const valueInstance = await this.attributeValueRepository.findById(valueId);
        if (!valueInstance) {
            const error = new Error('Attribute value not found.');
            error.statusCode = 404;
            throw error;
        }
        return await this.attributeValueRepository.delete(valueId);
    }


}

module.exports = new AttributeValueService(attributeRepository, attributeValueRepository);
