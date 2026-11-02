// src/services/cartService.js

const db = require('../../models');
const cartRepository = require('../repositories/cartRepository');
const cartItemRepository = require('../repositories/cartItemRepository');
const productVariantRepository = require('../repositories/productVariantRepository');
const { logger } = require('../config/logger');

class CartService {
    constructor() {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productVariantRepository = productVariantRepository;
    }

    /**
     * @description Gets or creates a cart, handling guest-to-user merging.
     */
    async _getOrCreateCart(userId, sessionId, options = {}) {
        let userCart = null;
        let guestCart = null;

        if (userId) {
            userCart = await this.cartRepository.findByUserId(userId, options);
        }
        if (sessionId) {
            guestCart = await this.cartRepository.findBySessionId(sessionId, options);
        }

        // سناریو ۱: کاربر لاگین کرده و سبد خرید دارد
        if (userCart) {
            // اگر سبد مهمان هم وجود داشت، آیتم‌ها را ادغام کن
            if (guestCart) {
                const guestItems = await guestCart.getCartItems(options);
                for (const item of guestItems) {
                    await this.addItemToCart(
                        userId,
                        null,
                        { variantId: item.variant_id, quantity: item.quantity },
                        options
                    );
                }
                await this.cartRepository.deleteCart(guestCart.id, options);
            }
            return userCart;
        }

        // سناریو ۲: کاربر لاگین کرده ولی سبد خرید ندارد، اما سبد مهمان دارد
        if (userId && guestCart) {
            guestCart.user_id = userId;
            guestCart.session_id = null; // این سبد دیگر برای کاربر است
            await guestCart.save(options);
            return guestCart;
        }

        // سناریو ۳: کاربر مهمان است و سبد خرید دارد
        if (guestCart) {
            return guestCart;
        }

        // سناریو ۴: هیچ سبد خریدی وجود ندارد، یکی جدید بساز
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        return await this.cartRepository.create({
            user_id: userId,
            session_id: userId ? null : sessionId,
            expires_at: expiresAt
        }, options);
    }

    async addItemToCart(userId, sessionId, itemData, options = {}) {
        const { variantId, quantity } = itemData;

        const variant = await this.productVariantRepository.findById(variantId, options);
        if (!variant) {
            const error = new Error('Product variant not found.');
            error.statusCode = 404;
            throw error;
        }
        if (variant.stock_quantity < quantity) {
            const error = new Error('Not enough product in stock.');
            error.statusCode = 400;
            throw error;
        }

        const cart = await this._getOrCreateCart(userId, sessionId, options);

        let cartItem = await this.cartItemRepository.findItemInCart(cart.id, variantId, options);
        if (cartItem) {
            cartItem.quantity += quantity;
            await this.cartItemRepository.save(cartItem, options);
        } else {
            cartItem = await this.cartItemRepository.create({
                cart_id: cart.id,
                variant_id: variantId,
                quantity: quantity,
            }, options);
        }
        return cartItem;
    }

    async getCart(userId, sessionId, options = {}) {
        const cart = await this._getOrCreateCart(userId, sessionId, options);
        if (!cart) return { cartId: null, totalAmount: "0.00", totalItems: 0, items: [] };

        const cartDetails = await this.cartRepository.getCartDetails(cart.id, options);
        if (!cartDetails) return { cartId: cart.id, totalAmount: "0.00", totalItems: 0, items: [] };

        let totalAmount = 0;
        const itemsList = cartDetails.cartItems || [];

        const items = itemsList.map(item => {
            if (!item.variant || !item.variant.product) {
                logger.warn(`Cart item ID ${item.id} has a missing variant or product relation.`);
                return null;
            }

            const price = item.variant.price ?? item.variant.product.price;
            totalAmount += item.quantity * parseFloat(price);

            // 💎 تغییر: مقدار پیش‌فرض برای values
            const variantValues = item.variant.values || [];

            return {
                cartItemId: item.id,
                variantId: item.variant.id,
                productId: item.variant.product.id,
                name: item.variant.product.name,
                sku: item.variant.sku,
                imageUrl: item.variant.image_url || item.variant.product.image_url,
                quantity: item.quantity,
                price: price,
                stockAvailable: item.variant.stock_quantity,
                values: variantValues.map(v => ({ attribute: v.attribute.name, value: v.value }))
            };
        }).filter(item => item !== null);

        return {
            cartId: cart.id,
            totalAmount: totalAmount.toFixed(2),
            totalItems: items.length,
            items: items
        };
    }

    async getCartForOrderFinalization(userId, sessionId, { transaction } = {}) {
        if (!transaction) {
            throw new Error('A caller transaction is required to finalize a cart.');
        }

        const cart = userId
            ? await this.cartRepository.findByUserId(userId, {
                transaction,
                lock: transaction.LOCK.UPDATE
            })
            : await this.cartRepository.findBySessionId(sessionId, {
                transaction,
                lock: transaction.LOCK.UPDATE
            });

        if (!cart) return null;

        const items = await this.cartItemRepository.findAllByCartId(cart.id, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        return { cart, items };
    }

    async updateItemQuantity(userId, sessionId, cartItemId, quantity) {
        if (quantity <= 0) {
            const error = new Error('Quantity must be positive. Use the delete endpoint to remove an item.');
            error.statusCode = 400;
            throw error;
        }


        const cart = await this._getOrCreateCart(userId, sessionId);


        const cartItem = await this.cartItemRepository.findById(cartItemId, {
            include: [{
                model: db.ProductVariant,
                as: 'variant'
            }]
        });

        if (!cartItem || cartItem.cart_id !== cart.id) {
            const error = new Error('Cart item not found or does not belong to your current cart.');
            error.statusCode = 404;
            throw error;
        }

        if (cartItem.variant.stock_quantity < quantity) {
            const error = new Error(`Not enough stock for this variant. Available: ${cartItem.variant.stock_quantity}`);
            error.statusCode = 400;
            throw error;
        }

        cartItem.quantity = quantity;
        await this.cartItemRepository.save(cartItem);

        return cartItem;
    }

    async removeItem(userId, sessionId, cartItemId) {
        const cart = await this._getOrCreateCart(userId, sessionId);

        const cartItem = await this.cartItemRepository.findById(cartItemId);
        if (!cartItem || cartItem.cart_id !== cart.id) {
            const error = new Error('Cart item not found or does not belong to your current cart.');
            error.statusCode = 404;
            throw error;
        }

        await this.cartItemRepository.delete(cartItem);

        cart.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await cart.save();
    }

    async clearCart(userId, sessionId, options = {}) {
        const cart = await this._getOrCreateCart(userId, sessionId, options);
        await this.cartItemRepository.deleteAllFromCart(cart.id, options);

        cart.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await cart.save(options);
    }

}

module.exports = new CartService();
