// src/controllers/orderController.js

const orderService = require('../services/orderService');
const { logger } = require('../config/logger');

exports.placeOrder = async (req, res) => {
  try {
    const newOrder = await orderService.placeOrder(req.user.id, req.body);
    res.status(201).json({
      message: 'Order placed successfully. Awaiting payment.',
      orderId: newOrder.id,
      totalAmount: newOrder.total_amount
    });
  } catch (error) {
    logger.error(`PlaceOrder Controller Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders(req.query, req.user);
    res.status(200).json({ orders });
  } catch (error) {
    logger.error(`GetAllOrders Controller Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    res.status(200).json({ order });
  } catch (error) {
    logger.error(`GetOrderById Controller Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user.id);
    res.status(200).json({ message: 'Order status updated successfully!', order });
  } catch (error) {
    logger.error(`UpdateOrderStatus Controller Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user);
    res.status(200).json({ message: 'Order cancelled successfully!', order });
  } catch (error) {
    logger.error(`CancelOrder Controller Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};