// src/controllers/couponController.js

const couponService = require('../services/couponService');
const {logger} = require('../config/logger');

exports.createCoupon = async (req, res) => {
  try {
    const newCoupon = await couponService.createCoupon(req.body);
    res.status(201).json({ message: 'Coupon created successfully!', coupon: newCoupon });
  } catch (error) {
    logger.error(`Error in CouponController createCoupon: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.status(200).json({ coupons: coupons });
  } catch (error) {
    logger.error(`Error in CouponController getAllCoupons: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
};

exports.getCouponByCode = async (req, res) => {
  try {
    const coupon = await couponService.getCouponByCode(req.params.code);
    res.status(200).json({ coupon: coupon });
  } catch (error) {
    logger.error(`Error in CouponController getCouponByCode: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const updatedCoupon = await couponService.updateCoupon(req.params.id, req.body);
    res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    logger.error(`Error in CouponController updateCoupon: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await couponService.deleteCoupon(req.params.code);
    res.status(200).json({ message: 'Coupon deleted successfully!' });
  } catch (error) {
    logger.error(`Error in CouponController deleteCoupon: ${error.message}`);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Cannot delete coupon: Associated orders exist.' });
    }
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};