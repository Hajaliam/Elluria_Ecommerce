// src/errors/ValidationError.js
class ValidationError extends Error {
    /**
     * @param {string} message - توضیح خطا
     * @param {object} [options]
     * @param {number} [options.statusCode=400] - کد وضعیت HTTP
     * @param {string} [options.code='VALIDATION_ERROR'] - کد منطقی خطا
     * @param {Array|object} [options.errors] - جزئیات فیلدی/ولیدیشنی (آرایه یا آبجکت تکی)
     * @param {object} [options.details] - اطلاعات اضافی
     */
    constructor(message, options = {}) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = options.statusCode || 400;
        this.code = options.code || 'VALIDATION_ERROR';
        this.errors = Array.isArray(options.errors)
            ? options.errors
            : options.errors
                ? [options.errors]
                : [];
        this.details = options.details || null;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ValidationError);
        }
    }
}

module.exports = ValidationError;
