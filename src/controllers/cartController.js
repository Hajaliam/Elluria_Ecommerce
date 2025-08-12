// src/controllers/cartController.js

const cartService = require('../services/cartService');
const { logger } = require('../config/logger');

exports.addItemToCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.cookies.session_id;
    const cartItem = await cartService.addItemToCart(userId, sessionId, req.body);
    res.status(200).json({ message: 'Item added to cart successfully!', cartItem });
  } catch (error) {
    logger.error(`AddItemToCart Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.cookies.session_id;
    const cartDetails = await cartService.getCart(userId, sessionId);
    res.status(200).json(cartDetails);
  } catch (error) {
    logger.error(`GetCart Error: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.cookies.session_id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const updatedItem = await cartService.updateItemQuantity(userId, sessionId, cartItemId, quantity);
    res.status(200).json({ message: 'Cart item quantity updated successfully!', cartItem: updatedItem });
  } catch (error) {
    logger.error(`UpdateCartItemQuantity Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.cookies.session_id;
    const { cartItemId } = req.params;

    await cartService.removeItem(userId, sessionId, cartItemId);
    res.status(200).json({ message: 'Item removed from cart successfully!' });
  } catch (error) {
    logger.error(`RemoveItemFromCart Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const sessionId = req.cookies.session_id;

    await cartService.clearCart(userId, sessionId);
    res.status(200).json({ message: 'Cart cleared successfully!' });
  } catch (error) {
    logger.error(`ClearCart Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


