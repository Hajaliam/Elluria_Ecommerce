// src/controllers/reviewController.js

const db = require('../../models');
const Review = db.Review;
const User = db.User;
const Product = db.Product;
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer'); // برای پاکسازی کامنت‌ها

// ایجاد یک بررسی (Review) جدید
exports.createReview = async (req, res) => {
  // user_id از توکن احراز هویت شده (req.user.id) می‌آید
  const user_id = req.user.id;
  const { product_id, rating, comment } = req.body;

  // 👈 پاکسازی فیلد comment
  const sanitizedComment = comment ? sanitizeString(comment) : null;

  try {
    // بررسی وجود محصول
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // بررسی اینکه آیا کاربر قبلاً برای این محصول بررسی ثبت کرده است (به خاطر UNIQUE INDEX در مدل)
    const existingReview = await Review.findOne({
      where: { user_id, product_id },
    });
    if (existingReview) {
      return res
        .status(409)
        .json({ message: 'You have already reviewed this product.' });
    }

    const newReview = await Review.create({
      user_id,
      product_id,
      rating,
      comment: sanitizedComment,
    });

    res
      .status(201)
      .json({ message: 'Review created successfully!', review: newReview });
  } catch (error) {
    console.error('Error creating review:', error);
    res
      .status(500)
      .json({ message: 'Server error creating review', error: error.message });
  }
};

// دریافت همه بررسی‌ها برای یک محصول خاص
exports.getReviewsByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'first_name', 'last_name'], // فقط اطلاعات عمومی کاربر را برمی‌گردانیم
        },
      ],
      order: [['createdAt', 'DESC']], // جدیدترین بررسی‌ها اول باشند
    });

    res.status(200).json({ reviews: reviews });
  } catch (error) {
    console.error('Error fetching reviews by product ID:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching reviews', error: error.message });
  }
};

// به‌روزرسانی یک بررسی (فقط توسط مالک بررسی یا ادمین)
exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id; // ID کاربر از توکن
  const userRole = await db.Role.findByPk(req.user.role_id); // نقش کاربر از توکن

  // 👈 پاکسازی فیلد comment
  const sanitizedComment = comment ? sanitizeString(comment) : null;

  try {
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // فقط صاحب بررسی یا ادمین می‌تواند آن را به‌روزرسانی کند
    if (review.user_id !== userId && userRole.name !== 'admin') {
      return res
        .status(403)
        .json({
          message:
            'Access Denied: You are not authorized to update this review.',
        });
    }

    review.rating = rating || review.rating;
    review.comment = sanitizedComment || review.comment;
    await review.save();

    res
      .status(200)
      .json({ message: 'Review updated successfully!', review: review });
  } catch (error) {
    console.error('Error updating review:', error);
    res
      .status(500)
      .json({ message: 'Server error updating review', error: error.message });
  }
};

// حذف یک بررسی (فقط توسط مالک بررسی یا ادمین)
exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // ID کاربر از توکن
  const userRole = await db.Role.findByPk(req.user.role_id); // نقش کاربر از توکن

  try {
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // فقط صاحب بررسی یا ادمین می‌تواند آن را حذف کند
    if (review.user_id !== userId && userRole.name !== 'admin') {
      return res
        .status(403)
        .json({
          message:
            'Access Denied: You are not authorized to delete this review.',
        });
    }

    await review.destroy();
    res.status(200).json({ message: 'Review deleted successfully!' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res
      .status(500)
      .json({ message: 'Server error deleting review', error: error.message });
  }
};
