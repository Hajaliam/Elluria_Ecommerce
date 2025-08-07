// src/services/attributeService.js

const attributeRepository = require('../repositories/attributeRepository');
const { sanitizeString } = require('../utils/sanitizer');

class AttributeService {
    constructor(repo) {
        this.attributeRepository = repo;
    }

    async createAttribute(data) {
        const { name } = data;
        const sanitizedName = sanitizeString(name);

        const existingAttribute = await this.attributeRepository.findByName(sanitizedName);
        if (existingAttribute) {
            const error = new Error('Attribute with this name already exists.');
            error.statusCode = 409; // Conflict
            throw error;
        }

        return await this.attributeRepository.create({ name: sanitizedName });
    }

    async getAllAttributes() {
        // ویژگی‌ها را به همراه مقادیرشان برمی‌گردانیم که برای پنل ادمین کاربردی‌تر است
        return await this.attributeRepository.findAll({
            include: [{
                association: 'values',
                attributes: ['id', 'value']
            }]
        });
    }

    async getAttributeById(id) {
        const attribute = await this.attributeRepository.findById(id, {
            include: [{
                association: 'values',
                attributes: ['id', 'value']
            }]
        });
        if (!attribute) {
            const error = new Error('Attribute not found.');
            error.statusCode = 404;
            throw error;
        }
        return attribute;
    }

    async updateAttribute(id, data) {
        const attribute = await this.attributeRepository.findById(id);
        if (!attribute) {
            const error = new Error('Attribute not found.');
            error.statusCode = 404;
            throw error;
        }

        if (data.name) {
            const sanitizedName = sanitizeString(data.name);
            if (sanitizedName !== attribute.name) {
                const existing = await this.attributeRepository.findByName(sanitizedName);
                if (existing && existing.id !== parseInt(id)) {
                    const error = new Error('Attribute with this name already exists.');
                    error.statusCode = 409;
                    throw error;
                }
            }
            attribute.name = sanitizedName;
        }

        return await this.attributeRepository.save(attribute);
    }

    async deleteAttribute(id) {
        const attribute = await this.attributeRepository.findById(id);
        if (!attribute) {
            const error = new Error('Attribute not found.');
            error.statusCode = 404;
            throw error;
        }
        // به لطف onDelete: CASCADE در مایگریشن، مقادیر وابسته (AttributeValues) نیز خودکار حذف می‌شوند.
        return await this.attributeRepository.delete(id);
    }
}

module.exports = new AttributeService(attributeRepository);