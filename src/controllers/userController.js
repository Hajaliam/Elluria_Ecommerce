// src/controllers/userController.js
const userService = require('../services/userService');
const {logger} = require('../config/logger');

// Auth
exports.register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ message: 'User registered successfully!', user });
  } catch (error) {
    logger.error(`Registration Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await userService.login(username, password);
    res.status(200).json({ message: 'Logged in successfully!', ...result });
  } catch (error) {
    logger.error(`Login Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.status(200).json({ message: 'User profile retrieved successfully!', user });
  } catch (error) {
    logger.error(`GetProfile Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.user.id, req.body);
    res.status(200).json({ message: 'User profile updated successfully!', user });
  } catch (error) {
    logger.error(`UpdateProfile Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Address
exports.createAddress = async (req, res) => {
  try {
    const address = await userService.createAddress(req.user.id, req.body);
    res.status(201).json({ message: 'Address created successfully!', address });
  } catch (error) {
    logger.error(`CreateAddress Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    // Authorization logic remains in the route/middleware, controller just gets the final user ID
    const addresses = await userService.getAddresses(req.params.userId);
    res.status(200).json({ addresses });
  } catch (error) {
    logger.error(`GetAddresses Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Password & OTP
exports.forgotPassword = async (req, res) => {
  try {
    await userService.forgotPassword(req.body.identifier);
    res.status(200).json({ message: 'If a user with this email or phone number exists, a recovery link/code has been sent.' });
  } catch (error) {
    logger.error(`ForgotPassword Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during password recovery.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await userService.resetPassword(req.params.token, req.body.newPassword);
    res.status(200).json({ message: 'Password has been successfully reset.' });
  } catch (error) {
    logger.error(`ResetPassword Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.requestOtp = async (req, res) => {
  try {
    await userService.requestOtp(req.body.phone_number);
    res.status(200).json({ message: 'OTP sent to your phone number.' });
  } catch (error) {
    logger.error(`RequestOtp Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.verifyOtpAndLogin = async (req, res) => {
  try {
    const result = await userService.verifyOtpAndLogin(req.body.phone_number, req.body.otp_code);
    res.status(200).json({ message: 'Logged in successfully!', ...result });
  } catch (error) {
    logger.error(`VerifyOtp Error: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};