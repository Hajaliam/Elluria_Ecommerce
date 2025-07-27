// src/controllers/productController.js

const db = require('../../models');
const Product = db.Product;
const Category = db.Category; // برای بررسی وجود دسته‌بندی
const Brand = db.Brand;
const Sequelize = db.Sequelize;
const multer = require('multer'); // برای آپلود فایل
const path = require('path'); // برای کار با مسیرهای فایل
const { sanitizeString } = require('../utils/sanitizer'); // 👈 این خط باید وجود داشته باشد و استفاده شود
// const fs = require('fs'); // اگر می‌خواهید حذف فایل‌های قدیمی را فعال کنید، این خط را اضافه کنید




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
  // Multer فایل را در req.file قرار می‌دهد و بقیه فیلدها در req.body
  let {
    name,
    description,
    price,
    stock_quantity,
    category_id,
    slug,
    brand_id,
    buy_price,
  } = req.body; // 👈 از let استفاده کنید

  // 👈 اعمال پاکسازی به فیلدهای متنی
  name = sanitizeString(name);
  description = sanitizeString(description);
  slug = sanitizeString(slug);

  const image_url = req.file ? `/uploads/products/${req.file.filename}` : null; // مسیر ذخیره شده در سرور

  try {
    // 1. بررسی وجود دسته‌بندی
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    // 1. بررسی وجود برند
    const brand = await Brand.findByPk(brand_id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found.' });
    }

    // 2. بررسی وجود محصول با نام یا slug تکراری
    const existingProduct = await Product.findOne({
      where: {
        [Sequelize.Op.or]: [{ name: name }, { slug: slug }],
      },
    });
    if (existingProduct) {
      // اگر محصولی با این نام یا slug وجود داشت، تصویر آپلود شده را حذف کن
      if (req.file) {
        // اگر fs ایمپورت شده باشد: fs.unlinkSync(req.file.path);
      }
      return res
        .status(409)
        .json({ message: 'Product with this name or slug already exists.' });
    }

    // 3. ایجاد محصول جدید
    const newProduct = await Product.create({
      name,
      description,
      price,
      stock_quantity,
      image_url,
      category_id,
      slug,
      brand_id,
      buy_price: buy_price ? parseFloat(buy_price) : 0 // 👈 ذخیره buy_price
    });
    await db.InventoryLog.create({
      product_id: newProduct.id,
      change_type: 'Adding_New_Product',
      quantity_change: newProduct.stock_quantity,
      old_stock_quantity: 0,
      new_stock_quantity: newProduct.stock_quantity,
      changed_by_user_id: req.user.id, // کاربر تغییر دهنده
      description: `Product ${newProduct.id} Created - Added  ${stock_quantity} units .`
    });
    res
      .status(201)
      .json({ message: 'Product created successfully!', product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    // اگر خطایی رخ داد و فایلی آپلود شده بود، آن را حذف کنید
    if (req.file) {
      // اگر fs ایمپورت شده باشد: fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      message: 'Server error during product creation',
      error: error.message,
    });
  }
};

// تابع برای دریافت لیست همه محصولات (با قابلیت فیلتر، جستجو، مرتب‌سازی و صفحه‌بندی)
exports.getAllProducts = async (req, res) => {
  const {
    categoryId,
    brand_id,
    search,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
    limit,
    offset,
  } = req.query;
  const whereClause = {};
  let orderClause = [];

  if (categoryId) {
    whereClause.category_id = categoryId;
  }
  if (brand_id) {
    whereClause.brand_id = brand_id;
  }
  if (search) {
    whereClause.name = { [Sequelize.Op.iLike]: `%${sanitizeString(search)}%` }; // 👈 جستجو هم پاکسازی شود
  }
  if (minPrice && maxPrice) {
    whereClause.price = { [Sequelize.Op.between]: [minPrice, maxPrice] };
  } else if (minPrice) {
    whereClause.price = { [Sequelize.Op.gte]: minPrice };
  } else if (maxPrice) {
    whereClause.price = { [Sequelize.Op.lte]: maxPrice };
  }

  // مرتب‌سازی
  if (sortBy) {
    // اطمینان از اینکه sortBy یک ستون معتبر است
    const validSortFields = [
      'name',
      'price',
      'stock_quantity',
      'views_count',
      'sold_count',
      'createdAt',
    ];
    if (validSortFields.includes(sortBy)) {
      orderClause.push([
        sortBy,
        sortOrder && sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
      ]);
    }
  } else {
    orderClause.push(['createdAt', 'DESC']); // مرتب‌سازی پیش‌فرض بر اساس جدیدترین
  }

  try {
    const products = await Product.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: limit ? parseInt(limit) : undefined, // صفحه‌بندی
      offset: offset ? parseInt(offset) : undefined, // صفحه‌بندی
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    });
    res.status(200).json({
      total: products.count,
      limit: limit ? parseInt(limit) : products.count,
      offset: offset ? parseInt(offset) : 0,
      products: products.rows,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Server error fetching products',
      error: error.message,
    });
  }
};

// تابع برای دریافت یک محصول بر اساس ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    // افزایش تعداد بازدید (optional)
    product.views_count += 1;
    await product.save();

    res.status(200).json({ product: product });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res
      .status(500)
      .json({ message: 'Server error fetching product', error: error.message });
  }
};

// تابع برای به‌روزرسانی یک محصول
exports.updateProduct = async (req, res) => {
  const t = await db.sequelize.transaction();
  const { id } = req.params;
  let {
    name,
    description,
    price,
    stock_quantity,
    category_id,
    slug,
    brand_id,
    buy_price
  } = req.body;

  // 👈 پاکسازی رشته‌ها
  if (name) name = sanitizeString(name);
  if (description) description = sanitizeString(description);
  if (slug) slug = sanitizeString(slug);

  const image_url = req.file ? `/uploads/products/${req.file.filename}` : null;

  try {
    const product = await Product.findByPk(id , { transaction: t });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // بررسی دسته‌بندی جدید (در صورت تغییر)
    if (category_id && category_id !== product.category_id) {
      const category = await Category.findByPk(category_id, { transaction: t });
      if (!category) {
        return res.status(404).json({ message: 'New category not found.' });
      }
    }


    // بررسی برند جدید (در صورت تغییر)
    if (brand_id && brand_id !== product.brand_id) {
      const brand = await db.Brand.findByPk(brand_id, { transaction: t }); // 👈 دریافت با تراکنش
      if (!brand) {
        await t.rollback();
        return res.status(404).json({ message: 'Brand not found.' });
      }
    }

    // بررسی نام یا اسلاگ تکراری (در صورت تغییر)
    if ((name && name !== product.name) || (slug && slug !== product.slug)) {
      const existingProduct = await Product.findOne({
        where: {
          [Sequelize.Op.or]: [
            { name: name || product.name },
            { slug: slug || product.slug },
          ],
          id: { [Sequelize.Op.ne]: id },
        }, transaction : t ,
      });
      if (existingProduct) {
        if (req.file) {
          // اگر لازم شد فایل رو پاک کن
          // fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({
          message: 'Product with this name or slug already exists.',
        });
      }
    }


    let oldStock = product.stock_quantity;
    let oldBuyPrice = product.buy_price; // 👈 قیمت خرید قبلی


    // آپدیت فیلدها به صورت ایمن و بدون نادیده گرفتن مقادیر ۰
    if (name) product.name = name;
    if (description) product.description = description;
    if (slug) product.slug = slug;
    if (brand_id) product.brand_id = brand_id;
    if (price !== undefined && price !== null) product.price = price;
    // if ('stock_quantity' in req.body) {
    //   let oldStock = product.stock_quantity;
    //   product.stock_quantity = stock_quantity;
    //   await db.InventoryLog.create({
    //     product_id: product.id,
    //     change_type: 'product_stock_update',
    //     quantity_change: -Number(oldStock)+Number(stock_quantity),
    //     old_stock_quantity: oldStock,
    //     new_stock_quantity: stock_quantity,
    //     changed_by_user_id: req.user.id, // کاربر تغییر دهنده
    //     description: `Product ${product.id} - Changed  ${stock_quantity} units.`
    //   });
    // }
    if (image_url) product.image_url = image_url;
    if (category_id) product.category_id = category_id;

    // 👈 منطق محاسبه میانگین وزنی buy_price
    if ('stock_quantity' in req.body && stock_quantity !== null && stock_quantity !== undefined) {
      const quantityChange = parseInt(stock_quantity, 10);
      const newStockQuantity = oldStock + quantityChange;

      //const newStockQuantity = parseInt(stock_quantity, 10);
      //const quantityAdded = newStockQuantity - oldStock;
      if (newStockQuantity < 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Stock quantity cannot be negative.' });
      }
      if (buy_price !== undefined && buy_price !== null) { // اگر buy_price جدیدی هم ارسال شده
        const newBuyPriceInput = parseFloat(buy_price);

        if (quantityChange > 0 && oldStock > 0 && oldBuyPrice > 0) { // افزایش موجودی و قبلاً هم موجودی داشته
          // محاسبه میانگین وزنی
          product.buy_price = ((oldStock * oldBuyPrice) + (quantityChange * newBuyPriceInput)) / (oldStock + quantityChange);
        } else if (quantityChange > 0) { // افزایش موجودی از صفر یا از موجودی بدون قیمت خرید
          product.buy_price = newBuyPriceInput;
        } else if (quantityChange <= 0 && newBuyPriceInput !== oldBuyPrice) { // کاهش موجودی یا تغییر بدون تغییر موجودی، اما قیمت خرید تغییر کرده
          product.buy_price = newBuyPriceInput;
        }
      } else { // اگر buy_price جدیدی ارسال نشده، اما موجودی تغییر کرده
        product.buy_price = oldBuyPrice; // قیمت خرید قبلی را حفظ کن
      }
      product.stock_quantity = newStockQuantity;

      // 👈 لاگ انبارداری برای تغییر موجودی (با جزئیات قیمت خرید)
      await db.InventoryLog.create({
        product_id: product.id,
        change_type: quantityChange > 0 ? 'restock' : (quantityChange < 0 ? 'manual_decrease' : 'manual_adjustment'),
        quantity_change: quantityChange,
        old_stock_quantity: oldStock,
        new_stock_quantity: newStockQuantity,
        changed_by_user_id: req.user.id, // کاربر تغییر دهنده
        description: `Product ${product.id} - Stock changed. Old Buy Price: ${oldBuyPrice}, New Buy Price: ${product.buy_price}`
      }, { transaction: t });

    } else if (buy_price !== undefined && buy_price !== null) { // فقط buy_price تغییر کرده، موجودی نه
      product.buy_price = parseFloat(buy_price);
      await db.InventoryLog.create({
        product_id: product.id,
        change_type: 'buy_price_update',
        quantity_change: 0,
        old_stock_quantity: oldStock,
        new_stock_quantity: oldStock,
        changed_by_user_id: req.user.id,
        description: `Product ${product.id} - Buy price updated from ${oldBuyPrice} to ${product.buy_price}`
      }, { transaction: t });
    }




    await product.save({ transaction: t });
    await t.commit();
    return res.status(200).json({
      message: 'Product updated successfully!',
      product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    if (req.file) {
      // fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      message: 'Server error updating product',
      error: error.message,
    });
  }
};

// تابع برای حذف یک محصول
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // حذف تصویر مرتبط با محصول (اختیاری و نیاز به fs)
    // if (product.image_url) {
    //   const imagePath = path.join(__dirname, '..', '..', 'public', product.image_url);
    //   fs.unlink(imagePath, (err) => {
    //     if (err) console.error('Error deleting product image:', err);
    //   });
    // }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res
      .status(500)
      .json({ message: 'Server error deleting product', error: error.message });
  }
};

// Multer middleware برای استفاده در روت‌ها
exports.upload = upload;
