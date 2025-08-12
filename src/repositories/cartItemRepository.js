// src/repositories/cartItemRepository.js

const { CartItem } = require('../../models');

class CartItemRepository {
    async findItemInCart(cartId, variantId, options = {}) {
        return await CartItem.findOne({ where: { cart_id: cartId, variant_id: variantId }, ...options });
    }

    async create(data, options = {}) {
        return await CartItem.create(data, options);
    }

    async save(instance, options = {}) {
        return await instance.save(options);
    }

    async findById(id, options = {}) {
        return await CartItem.findByPk(id, options);
    }

    async delete(instance, options = {}) {
        return await instance.destroy(options);
    }

    async deleteAllFromCart(cartId, options = {}) {
        return await CartItem.destroy({ where: { cart_id: cartId }, ...options });
    }
}

module.exports = new CartItemRepository();