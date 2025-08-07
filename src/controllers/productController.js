// src/controllers/productController.js

const productService = require('../services/productService');
const {logger} = require('../config/logger');
const multer = require('multer'); // Multer همچنان در کنترلر باقی می‌ماند




// تنظیم Multer برای ذخیره محلی فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // مسیر ذخیره تصاویر: در پوشه public/uploads/products
    // این پوشه رو باید دستی ایجاد کنید: your-project-backend/public/uploads/products
    cb(null, 'public/uploads/products/');
  },
  filename: (req, file, cb) => {
    // نام فایل: timestamp + نام اصلی فایل
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// فیلتر کردن نوع فایل (فقط تصاویر)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // حداکثر حجم فایل 5 مگابایت
});

// تابع برای ایجاد محصول جدید
exports.createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      image_url: req.file ? `/uploads/products/${req.file.filename}` : null
    };
    const newProduct = await productService.createProduct(productData, req.user.id);
    res.status(201).json({ message: 'Product created successfully!', product: newProduct });
  } catch (error) {
    logger.error(`Error in ProductController createProduct: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { products, total } = await productService.getAllProducts(req.query, req.query, req.query);
    res.status(200).json({
      total: total,
      limit: req.query.limit ? parseInt(req.query.limit) : total,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      products: products,
    });
  } catch (error) {
    logger.error(`Error in ProductController getAllProducts: ${error.message}`);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ product: product });
  } catch (error) {
    logger.error(`Error in ProductController getProductById: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      image_url: req.file ? `/uploads/products/${req.file.filename}` : undefined
    };
    const updatedProduct = await productService.updateProduct(req.params.id, updateData, req.user.id);
    res.status(200).json({ message: 'Product updated successfully!', product: updatedProduct });
  } catch (error) {
    logger.error(`Error in ProductController updateProduct: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    logger.error(`Error in ProductController deleteProduct: ${error.message}`);
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// Multer middleware برای استفاده در روت‌ها
exports.upload = upload;
