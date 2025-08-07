// src/controllers/campaignController.js

const db = require('../../models');
const Campaign = db.Campaign;
const Product = db.Product; // برای ارتباط با محصولات در کمپین
const CampaignProduct = db.CampaignProduct; // برای مدیریت ارتباط Many-to-Many
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer');
const moment = require('moment'); // برای کار با تاریخ‌ها
const {logger} = require('../config/logger'); // برای لاگ‌گیری
const ExcelJS = require('exceljs');
const { parse } = require('csv-parse');
const fs = require('fs/promises');
const multer = require('multer');

const upload = multer({
    dest: 'temp/', // فایل‌های آپلودی موقتاً در پوشه temp ذخیره می‌شوند
    limits: { fileSize: 1024 * 1024 * 10 } // حداکثر حجم فایل 10 مگابایت
});
exports.uploadImport = upload;



// تابع برای ایجاد کمپین جدید
exports.createCampaign = async (req, res) => {
    let {
        title, description, slug, banner_image_url, campaign_type,
        start_date, end_date, show_countdown, priority, cta_link,
        is_active, products // لیست محصولات مرتبط با کمپین به صورت [{product_id, campaign_price}]
    } = req.body;

    // استخراج فقط product_ids برای واکشی از دیتابیس
    const product_ids = products?.map(p => p.product_id) || [];

    // پاکسازی ورودی‌ها
    title = sanitizeString(title);
    description = sanitizeString(description);
    slug = sanitizeString(slug);
    campaign_type = sanitizeString(campaign_type);
    cta_link = sanitizeString(cta_link);

    const t = await db.sequelize.transaction();

    try {
        // بررسی slug تکراری
        const existingCampaign = await Campaign.findOne({ where: { slug }, transaction: t });
        if (existingCampaign) {
            await t.rollback();
            return res.status(409).json({ message: 'Campaign with this slug already exists.' });
        }

        // بررسی اعتبار تاریخ
        if (moment(start_date).isAfter(moment(end_date))) {
            await t.rollback();
            return res.status(400).json({ message: 'Start date cannot be after end date.' });
        }
        //  بررسی منطق قیمت برای کمتر بودن قیمت کمپین و یکپارچگی قیمت
        if (products && products.length > 0) {
            for (const p of products) {
                const product = await Product.findByPk(p.product_id, { transaction: t });
                if (!product) {
                    await t.rollback();
                    return res.status(404).json({ message: `Product with ID ${p.product_id} not found.` });
                }

                // ۱. بررسی اینکه قیمت کمپین از قیمت اصلی بیشتر نباشد (این منطق از قبل بود و عالی است)
                const originalPrice = p.original_price !== undefined ? p.original_price : product.price;
                if (p.campaign_price > originalPrice) {
                    await t.rollback();
                    return res.status(400).json({
                        message: `قیمت کمپین نباید بیشتر از قیمت اصلی باشد. محصول ID: ${p.product_id}`,
                    });
                }

                // ۲. بررسی وجود محصول در کمپین‌های فعال دیگر
                const existingActiveCampaignProduct = await CampaignProduct.findOne({
                    where: { product_id: p.product_id },
                    include: [{
                        model: Campaign,
                        as: 'campaign',
                        where: {
                            is_active: true,
                            end_date: { [Sequelize.Op.gte]: new Date() } // کمپین هنوز تمام نشده باشد
                        },
                        required: true
                    }],
                    transaction: t
                });

                // ۳. اگر محصول در کمپین فعال دیگری بود و قیمت جدید با قیمت فعلی آن مغایرت داشت، خطا بده
                if (existingActiveCampaignProduct && p.campaign_price !== undefined &&
                    parseFloat(existingActiveCampaignProduct.campaign_price) !== parseFloat(p.campaign_price)) {

                    await t.rollback();
                    return res.status(409).json({ // 409 Conflict
                        message: `محصول با ID ${p.product_id} در حال حاضر در کمپین فعال دیگری ('${existingActiveCampaignProduct.campaign.title}') با قیمت ${existingActiveCampaignProduct.campaign_price} حضور دارد. برای حفظ یکپارچگی، قیمت کمپین باید یکسان باشد.`,
                    });
                }
            }
        }
        // ایجاد کمپین
        const newCampaign = await Campaign.create({
            title,
            description,
            slug,
            banner_image_url,
            campaign_type,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            show_countdown: show_countdown === 'true' || show_countdown === true,
            priority: priority ? parseInt(priority) : 0,
            cta_link,
            is_active: is_active === 'true' || is_active === true
        }, { transaction: t });

        // ایجاد روابط محصولات کمپین
        if (products && products.length > 0) {
            const targetProducts = await Product.findAll({ where: { id: product_ids }, transaction: t });

            if (targetProducts.length !== product_ids.length) {
                await t.rollback();
                return res.status(404).json({ message: 'One or more specified products for campaign not found.' });
            }


            const campaignProducts = products.map(p => {
                const product = targetProducts.find(tp => tp.id === p.product_id);
                const originalPrice = p.original_price !== undefined ? p.original_price : product.price
                return {
                    campaign_id: newCampaign.id,
                    product_id: p.product_id,
                    campaign_price: p.campaign_price ?? product.price ,
                    original_price: originalPrice
                };
            });

            await CampaignProduct.bulkCreate(campaignProducts, { transaction: t });

            // به‌روزرسانی campaign_id در جدول Product
            for (const prod of targetProducts) {
                prod.campaign_id = newCampaign.id;
                await prod.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ message: 'Campaign created successfully!', campaign: newCampaign });

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        logger.error(`Error creating campaign: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error creating campaign', error: error.message });
    }
};

//  تابع برای واردات محصولات کمپین
exports.importCampaignProducts = async (req, res) => {
    const { campaignId } = req.params; // ID کمپین از URL
    const file = req.file;
    const { format } = req.body;
    const allowedFormats = ['csv', 'excel'];

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    if (!format || !allowedFormats.includes(format.toLowerCase())) {
        await fs.unlink(file.path);
        return res.status(400).json({ message: 'Invalid or missing format. Allowed formats are: csv, excel.' });
    }

    const t = await db.sequelize.transaction();

    try {
        const campaign = await Campaign.findByPk(campaignId, { transaction: t });
        if (!campaign) {
            await t.rollback();
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        let records = [];

        if (format.toLowerCase() === 'csv') {
            const fileContent = await fs.readFile(file.path, { encoding: 'utf8' });
            records = await new Promise((resolve, reject) => {
                parse(fileContent, { columns: true, skip_empty_lines: true }, (err, records) => {
                    if (err) reject(err);
                    resolve(records);
                });
            });
        } else if (format.toLowerCase() === 'excel') {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(file.path);
            const worksheet = workbook.getWorksheet(1);

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header row
                const rowData = {
                    product_slug: row.getCell(1).value, // یا product_id
                    campaign_price: row.getCell(2).value,
                    original_price: row.getCell(3).value // قیمت اصلی (اختیاری)
                };
                records.push(rowData);
            });
        }

        let importedCount = 0;
        let updatedCount = 0;
        const errors = [];

        // ابتدا تمام محصولات فعلی مرتبط با این کمپین را dissociated می‌کنیم
        const oldProductsInCampaign = await Product.findAll({ where: { campaign_id: campaignId }, transaction: t });
        for (const prod of oldProductsInCampaign) {
            prod.campaign_id = null;
            await prod.save({ transaction: t });
        }
        // و همچنین ورودی‌های مربوطه در CampaignProducts را حذف می‌کنیم
        await CampaignProduct.destroy({ where: { campaign_id: campaignId }, transaction: t });


        for (const record of records) {
            const { product_slug, campaign_price, original_price } = record;
            const sanitizedProductSlug = sanitizeString(product_slug);

            try {
                const product = await Product.findOne({ where: { slug: sanitizedProductSlug }, transaction: t });
                if (!product) {
                    errors.push({ record: record, error: `Product with slug '${sanitizedProductSlug}' not found.` });
                    continue;
                }
                //اعتبارسنجی قیمت هنگام ایمپورت
                const existingActiveCampaignProduct = await CampaignProduct.findOne({
                    where: {
                        product_id: product.id,
                        campaign_id: { [Sequelize.Op.ne]: campaignId } // 💎 مهم: کمپین فعلی را نادیده بگیر
                    },
                    include: [{
                            model: Campaign,
                            as: 'campaign',
                            where: {
                                is_active: true,
                                end_date: { [Sequelize.Op.gte]: new Date() }
                            },
                            required: true
                        }],
                    transaction: t
                });

                if (existingActiveCampaignProduct && campaign_price !== undefined &&
                    parseFloat(existingActiveCampaignProduct.campaign_price) !== parseFloat(campaign_price)) {

                    errors.push({ record, error: `Product is in another active campaign ('${existingActiveCampaignProduct.campaign.title}') with a different price (${existingActiveCampaignProduct.campaign_price}). Price must be the same.` });
                    continue; // برو به رکورد بعدی
                }

                const originalProductPrice = original_price ? parseFloat(original_price) : parseFloat(product.price);
                const campaignPriceFloat = parseFloat(campaign_price);

                if (campaignPriceFloat > originalProductPrice) {
                    errors.push({ record: record, error: `Campaign price ${campaignPriceFloat} for product '${product.name}' cannot be greater than original price ${originalProductPrice}.` });
                    continue;
                }

                // ایجاد ورودی در جدول CampaignProduct
                await CampaignProduct.create({
                    campaign_id: campaignId,
                    product_id: product.id,
                    campaign_price: campaignPriceFloat,
                    original_price: originalProductPrice
                }, { transaction: t });

                // به‌روزرسانی campaign_id در جدول Product
                product.campaign_id = campaign.id;
                await product.save({ transaction: t });
                importedCount++; // در اینجا فقط محصولات جدید به کمپین اضافه می‌شوند
                                 // اگر محصولی از قبل به کمپین دیگری مرتبط بود، campaign_id آن تغییر می‌کند
                                 // منطق "updatedCount" برای این حالت پیچیده‌تر است و فعلا فقط importedCount را افزایش می‌دهیم

            } catch (recordError) {
                errors.push({ record: record, error: recordError.message });
                logger.error(`Error importing campaign product record: ${recordError.message}`, { record: record });
            }
        }

        await t.commit();
        res.status(200).json({
            message: 'Campaign products imported successfully!',
            importedCount: importedCount,
            updatedCount: updatedCount, // در اینجا همیشه 0 خواهد بود مگر اینکه منطق update را اضافه کنیم
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        await t.rollback();
        logger.error(`Error importing campaign products: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error during import', error: error.message });
    } finally {
        if (file) {
            try { await fs.unlink(file.path); } catch (e) { logger.error(`Error deleting temp uploaded file ${file.path}: ${e.message}`); }
        }
    }
};

// تابع برای به‌روزرسانی کمپین
exports.updateCampaign = async (req, res) => {
    const { id } = req.params;
    let {
        title, description, slug, banner_image_url, campaign_type,
        start_date, end_date, show_countdown, priority, cta_link,
        is_active,
        products = []
    } = req.body;

    // پاکسازی
    title = sanitizeString(title);
    description = sanitizeString(description);
    slug = sanitizeString(slug);
    campaign_type = sanitizeString(campaign_type);
    cta_link = sanitizeString(cta_link);

    const t = await db.sequelize.transaction();

    try {
        const campaign = await Campaign.findByPk(id, { transaction: t });
        if (!campaign) {
            await t.rollback();
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        // بررسی slug تکراری
        if (slug && slug !== campaign.slug) {
            const existing = await Campaign.findOne({
                where: { slug, id: { [Sequelize.Op.ne]: id } },
                transaction: t
            });
            if (existing) {
                await t.rollback();
                return res.status(409).json({ message: 'Slug already in use.' });
            }
        }

        // اعتبارسنجی تاریخ
        if (start_date && end_date && moment(start_date).isAfter(moment(end_date))) {
            await t.rollback();
            return res.status(400).json({ message: 'Start date cannot be after end date.' });
        }

        //اعتبارسنجی یکپارچگی قیمت محصولات هنگام آپدی
        if (products && products.length > 0) {
            for (const p of products) {
                // از آبجکت محصول، فلگ force_price_update را استخراج می‌کنیم
                const { product_id, campaign_price, original_price, force_price_update = false } = p;

                const product = await Product.findByPk(product_id, { transaction: t });
                if (!product) {
                    await t.rollback();
                    return res.status(404).json({ message: `Product with ID ${product_id} not found.` });
                }

                // بررسی قیمت کمپین در برابر قیمت اصلی (بدون تغییر)
                const effectiveOriginalPrice = original_price !== undefined ? original_price : product.price;
                if (campaign_price > effectiveOriginalPrice) {
                    await t.rollback();
                    return res.status(400).json({ message: `قیمت کمپین برای محصول ID ${product_id} نمی‌تواند بیشتر از قیمت اصلی باشد.` });
                }

                // اگر force_price_update نبود، منطق قبلی را اجرا کن
                if (!force_price_update) {
                    const existingActiveCampaignProduct = await CampaignProduct.findOne({
                        where: {
                            product_id: product_id,
                            campaign_id: { [Sequelize.Op.ne]: id }
                        },
                        include: [{
                            model: Campaign,
                            as: 'campaign',
                            where: { is_active: true, end_date: { [Sequelize.Op.gte]: new Date() } },
                            required: true
                        }],
                        transaction: t
                    });

                    if (existingActiveCampaignProduct && campaign_price !== undefined &&
                        parseFloat(existingActiveCampaignProduct.campaign_price) !== parseFloat(campaign_price)) {
                        await t.rollback();
                        return res.status(409).json({ message: `محصول با ID ${product_id} در حال حاضر در کمپین فعال دیگری ('${existingActiveCampaignProduct.campaign.title}') با قیمت ${existingActiveCampaignProduct.campaign_price} حضور دارد. برای آپدیت سراسری قیمت، از فلگ force_price_update استفاده کنید.` });
                    }
                }

                // به‌روزرسانی یا ایجاد محصول در کمپین فعلی
                const [entry, created] = await CampaignProduct.findOrCreate({
                    where: { campaign_id: id, product_id: product_id },
                    defaults: { campaign_price, original_price: effectiveOriginalPrice },
                    transaction: t
                });

                if (!created) {
                    entry.campaign_price = campaign_price ?? entry.campaign_price;
                    entry.original_price = original_price ?? entry.original_price ?? product.price;
                    await entry.save({ transaction: t });
                }

                // اگر force_price_update بود، قیمت را در تمام کمپین‌های فعال دیگر نیز به‌روز کن
                if (force_price_update) {
                    // ۱. یافتن تمام کمپین‌های فعال دیگر که این محصول را دارند
                    const otherCampaignProducts = await CampaignProduct.findAll({
                        where: {
                            product_id: product_id,
                            campaign_id: { [Sequelize.Op.ne]: id }
                        },
                        include: [{
                            model: Campaign,
                            as: 'campaign',
                            where: { is_active: true, end_date: { [Sequelize.Op.gte]: new Date() } },
                            required: true
                        }],
                        transaction: t
                    });

                    const otherCampaignIds = otherCampaignProducts.map(cp => cp.campaign_id);

                    // ۲. آپدیت قیمت در تمام آن‌ها
                    if (otherCampaignIds.length > 0) {
                        await CampaignProduct.update(
                            { campaign_price: campaign_price },
                            {
                                where: {
                                    product_id: product_id,
                                    campaign_id: { [Sequelize.Op.in]: otherCampaignIds }
                                },
                                transaction: t
                            }
                        );
                    }
                }

                // آپدیت product.campaign_id (بدون تغییر)
                product.campaign_id = id;
                await product.save({ transaction: t });
            }
        }
        // به‌روزرسانی فیلدهای کمپین
        Object.assign(campaign, {
            title: title ?? campaign.title,
            description: description ?? campaign.description,
            slug: slug ?? campaign.slug,
            banner_image_url: banner_image_url ?? campaign.banner_image_url,
            campaign_type: campaign_type ?? campaign.campaign_type,
            start_date: start_date ? new Date(start_date) : campaign.start_date,
            end_date: end_date ? new Date(end_date) : campaign.end_date,
            show_countdown: show_countdown !== undefined ? show_countdown : campaign.show_countdown,
            priority: priority !== undefined ? priority : campaign.priority,
            cta_link: cta_link ?? campaign.cta_link,
            is_active: is_active !== undefined ? is_active : campaign.is_active
        });

        await campaign.save({ transaction: t });


        // اضافه یا به‌روزرسانی محصولات جدید
        if (products.length > 0) {
            const productIds = products?.map(p => p.product_id) || [];
            const dbProducts = await Product.findAll({ where: { id: productIds }, transaction: t });

            if (dbProducts.length !== productIds.length) {
                await t.rollback();
                return res.status(404).json({ message: 'One or more specified products not found.' });
            }

            for (const p of products) {
                const product = dbProducts.find(dp => dp.id === p.product_id);
                const [entry, created] = await CampaignProduct.findOrCreate({
                    where: { campaign_id: campaign.id, product_id: p.product_id },
                    defaults: {
                        campaign_price: p.campaign_price ?? null,
                        original_price: p.original_price ?? product.price
                    },
                    transaction: t
                });

                if (!created) {
                    // اگر قبلاً وجود داشته، مقادیر رو آپدیت کن
                    entry.campaign_price = p.campaign_price ?? entry.campaign_price;
                    entry.original_price = p.original_price ?? entry.original_price ?? product.price;
                    await entry.save({ transaction: t });
                }

                // همزمان campaign_id رو هم داخل جدول Product آپدیت کنیم
                product.campaign_id = campaign.id;
                await product.save({ transaction: t });
            }
        }

        await t.commit();
        return res.status(200).json({ message: 'Campaign updated successfully.', campaign });

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        logger.error(`Error updating campaign ${id}: ${error.message}`, { stack: error.stack });
        return res.status(500).json({ message: 'Server error updating campaign', error: error.message });
    }
};

// تابع برای دریافت لیست همه کمپین‌ها (پنل ادمین)
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            include: [{ model: Product, as: 'products', attributes: ['id', 'name', 'slug'] ,  through: { attributes: [] } }], // شامل محصولات مرتبط
            order: [['priority', 'ASC'], ['start_date', 'DESC']]
        });
        res.status(200).json({ campaigns: campaigns });
    } catch (error) {
        logger.error(`Error fetching all campaigns: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching campaigns', error: error.message });
    }
};

// تابع برای دریافت یک کمپین بر اساس ID
exports.getCampaignById = async (req, res) => {
    const { id } = req.params;
    try {
        const campaign = await Campaign.findByPk(id, {
            include: [{
                model: Product,
                as: 'products',
                attributes: ['id', 'name', 'slug'],
                through: { attributes: [] }
            }]
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        res.status(200).json({ campaign: campaign });
    } catch (error) {
        logger.error(`Error fetching campaign ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching campaign', error: error.message });
    }
};

// تابع برای حذف کمپین
exports.deleteCampaign = async (req, res) => {
    const { id } = req.params;
    const t = await db.sequelize.transaction();
    try {
        const campaign = await Campaign.findByPk(id, { transaction: t });
        if (!campaign) {
            await t.rollback();
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        // حذف ارتباطات در جدول CampaignProduct
        await CampaignProduct.destroy({ where: { campaign_id: id }, transaction: t });

        // campaign_id محصولات مرتبط را null می‌کنیم
        await db.Product.update({ campaign_id: null }, { where: { campaign_id: id }, transaction: t });

        await campaign.destroy({ transaction: t });
        await t.commit();
        res.status(200).json({ message: 'Campaign deleted successfully!' });
    } catch (error) {
        if (t && !t.finished) { await t.rollback(); }
        logger.error(`Error deleting campaign ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error deleting campaign', error: error.message });
    }
};

// 👈 تابع برای دریافت کمپین‌های فعال (برای صفحه اول سایت)
exports.getActiveCampaigns = async (req, res) => {
    const now = moment().toDate();
    try {
        const activeCampaigns = await Campaign.findAll({
            where: {
                is_active: true,
                start_date: { [Sequelize.Op.lte]: now }, // تاریخ شروع گذشته یا امروز
                end_date: { [Sequelize.Op.gte]: now }   // تاریخ پایان امروز یا آینده
            },
            include: [{
                model: Product,
                as: 'products',
                attributes: ['id', 'name', 'slug', 'image_url', 'price', 'buy_price']
            }],
            order: [['priority', 'ASC']] // مرتب‌سازی بر اساس اولویت نمایش
        });
        res.status(200).json({ campaigns: activeCampaigns });
    } catch (error) {
        logger.error(`Error fetching active campaigns: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error fetching active campaigns', error: error.message });
    }
};

// DELETE /api/admin/campaigns/:campaignId/products/:productId
exports.removeProductFromCampaign = async (req, res) => {
    const { campaignId, productId } = req.params;

    const t = await db.sequelize.transaction();

    try {
        // بررسی وجود کمپین و محصول
        const campaign = await Campaign.findByPk(campaignId, { transaction: t });
        if (!campaign) {
            await t.rollback();
            return res.status(404).json({ message: 'Campaign not found.' });
        }

        const product = await Product.findByPk(productId, { transaction: t });
        if (!product) {
            await t.rollback();
            return res.status(404).json({ message: 'Product not found.' });
        }

        // حذف ارتباط از CampaignProduct
        await CampaignProduct.destroy({
            where: {
                campaign_id: campaignId,
                product_id: productId
            },
            transaction: t
        });

        // اگر campaign_id این محصول همین کمپین بوده، null کن
        if (product.campaign_id === parseInt(campaignId)) {
            product.campaign_id = null;
            await product.save({ transaction: t });
        }

        await t.commit();
        res.status(200).json({ message: 'Product removed from campaign successfully.' });

    } catch (error) {
        if (t && !t.finished) await t.rollback();
        logger.error(`Error removing product ${productId} from campaign ${campaignId}: ${error.message}`);
        res.status(500).json({ message: 'Server error removing product from campaign', error: error.message });
    }
};


