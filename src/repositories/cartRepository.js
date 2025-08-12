// src/repositories/cartRepository.js

const { Cart, CartItem, ProductVariant, Product, AttributeValue, Attribute } = require('../../models');

class CartRepository {

    async findByUserId(userId, options = {}) {
        return await Cart.findOne({ where: { user_id: userId }, ...options });
    }

    async findBySessionId(sessionId, options = {}) {
        return await Cart.findOne({ where: { session_id: sessionId }, ...options });
    }

    async create(data, options = {}) {
        return await Cart.create(data, options);
    }

    async getCartDetails(cartId, options = {}) {
        return await Cart.findByPk(cartId, {
            include: [{
                model: CartItem,
                as: 'cartItems',
                include: [{
                    model: ProductVariant,
                    as: 'variant',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'slug']
                        },
                        {

                            model: AttributeValue,
                            as: 'values',
                            attributes: ['value'],
                            include: [{
                                model: Attribute,
                                as: 'attribute',
                                attributes: ['name']
                            }],
                            through: { attributes: [] }
                        }
                    ]
                }]
            }],
            ...options
        });
    }

    async deleteCart(id, options = {}) {
        return await Cart.destroy({ where: { id }, ...options });
    }


}

module.exports = new CartRepository();