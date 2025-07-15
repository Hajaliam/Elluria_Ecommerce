// src/controllers/onlineShoppingAdviceController.js

const db = require('../../models');
const OnlineShoppingAdvice = db.OnlineShoppingAdvice;
const User = db.User;
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer');

// تابع برای دریافت همه درخواست‌های مشاوره (فقط ادمین)
exports.getAllAdvice = async (req, res) => {
  try {
    const adviceRequests = await OnlineShoppingAdvice.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email', 'first_name', 'last_name'],
        },
      ],
      order: [['date', 'DESC']],
    });
    res.status(200).json({ advice_requests: adviceRequests });
  } catch (error) {
    console.error('Error fetching all advice requests:', error);
    res
      .status(500)
      .json({
        message: 'Server error fetching advice requests',
        error: error.message,
      });
  }
};

// تابع برای دریافت یک درخواست مشاوره بر اساس ID (فقط ادمین یا مالک درخواست)
exports.getAdviceById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = await db.Role.findByPk(req.user.role_id);

  try {
    const advice = await OnlineShoppingAdvice.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email'],
        },
      ],
    });
    if (!advice) {
      return res.status(404).json({ message: 'Advice request not found.' });
    }

    // فقط ادمین یا مالک درخواست می‌تواند آن را ببیند
    if (advice.user_id !== userId && userRole.name !== 'admin') {
      return res
        .status(403)
        .json({
          message:
            'Access Denied: You are not authorized to view this request.',
        });
    }

    res.status(200).json({ advice: advice });
  } catch (error) {
    console.error('Error fetching advice request by ID:', error);
    res
      .status(500)
      .json({
        message: 'Server error fetching advice request',
        error: error.message,
      });
  }
};

// تابع برای به‌روزرسانی یک درخواست مشاوره (فقط ادمین)
exports.updateAdvice = async (req, res) => {
  const { id } = req.params;
  const { chat_text, object } = req.body;

  const sanitizedChatText = chat_text ? sanitizeString(chat_text) : null;
  const sanitizedObject = object ? sanitizeString(object) : null;

  try {
    const advice = await OnlineShoppingAdvice.findByPk(id);
    if (!advice) {
      return res.status(404).json({ message: 'Advice request not found.' });
    }

    advice.chat_text = sanitizedChatText || advice.chat_text;
    advice.object = sanitizedObject || advice.object;
    await advice.save();

    res
      .status(200)
      .json({
        message: 'Advice request updated successfully!',
        advice: advice,
      });
  } catch (error) {
    console.error('Error updating advice request:', error);
    res
      .status(500)
      .json({
        message: 'Server error updating advice request',
        error: error.message,
      });
  }
};

// تابع برای حذف یک درخواست مشاوره (فقط ادمین)
exports.deleteAdvice = async (req, res) => {
  const { id } = req.params;
  try {
    const advice = await OnlineShoppingAdvice.findByPk(id);
    if (!advice) {
      return res.status(404).json({ message: 'Advice request not found.' });
    }
    await advice.destroy();
    res.status(200).json({ message: 'Advice request deleted successfully!' });
  } catch (error) {
    console.error('Error deleting advice request:', error);
    res
      .status(500)
      .json({
        message: 'Server error deleting advice request',
        error: error.message,
      });
  }
};
