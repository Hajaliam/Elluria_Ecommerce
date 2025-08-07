// src/repositories/addressRepository.js

const { Address } = require('../../models');

class AddressRepository {
    async create(data, options = {}) {
        return await Address.create(data, options);
    }

    async findAllByUserId(userId, options = {}) {
        const finalOptions = {
            ...options,
            where: {
                user_id: userId,
                ...(options.where || {}),
            },
        };
        return await Address.findAll(finalOptions);
    }


    async clearDefault(userId, options = {}) {

        if (options.where?.user_id || options.where?.is_default) {
            throw new Error("Overriding 'user_id' or 'is_default' is not allowed in options.where");
        }

        const finalOptions = {
            ...options,
            where: {
                user_id: userId,
                is_default: true,
                ...(options.where || {}),
            },
        };
        return await Address.update(
            { is_default: false },
            finalOptions
        );
    }

}

module.exports = new AddressRepository();