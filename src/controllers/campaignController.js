// src/controllers/campaignController.js

const db = require('../../models');
const Campaign = db.Campaign;
const Product = db.Product; // برای ارتباط با محصولات در کمپین
const CampaignProduct = db.CampaignProduct; // برای مدیریت ارتباط Many-to-Many
const Sequelize = db.Sequelize;
const { sanitizeString } = require('../utils/sanitizer');
const moment = require('moment'); // برای کار با تاریخ‌ها
const logger = require('../config/logger'); // برای لاگ‌گیری

// تابع برای ایجاد کمپین جدید
exports.createCampaign = async (req, res) => {
    let {
        title, description, slug, banner_image_url, campaign_type,
        start_date, end_date, show_countdown, priority, cta_link,
        is_active, product_ids // لیست محصولات مرتبط با کمپین
    } = req.body;

    // پاکسازی ورودی‌ها
    title = sanitizeString(title);
    description = sanitizeString(description);
    slug = sanitizeString(slug);
    campaign_type = sanitizeString(campaign_type);
    cta_link = sanitizeString(cta_link);

    const t = await db.sequelize.transaction();

    try {
        // اعتبارسنجی: وجود slug تکراری
        const existingCampaign = await Campaign.findOne({ where: { slug: slug }, transaction: t });
        if (existingCampaign) {
            await t.rollback();
            return res.status(409).json({ message: 'Campaign with this slug already exists.' });
        }

        // اعتبارسنجی تاریخ
        if (moment(start_date).isAfter(moment(end_date))) {
            await t.rollback();
            return res.status(400).json({ message: 'Start date cannot be after end date.' });
        }

        // ایجاد کمپین جدید
        const newCampaign = await Campaign.create({
            title, // 👈 استفاده از title به جای name
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

        // ارتباط کمپین با محصولات از طریق جدول میانی CampaignProduct
        if (product_ids && product_ids.length > 0) {
            const products = await Product.findAll({ where: { id: product_ids }, transaction: t });
            if (products.length !== product_ids.length) {
                await t.rollback();
                return res.status(404).json({ message: 'One or more specified products for campaign not found.' });
            }
            // ایجاد ورودی‌ها در جدول CampaignProduct
            const campaignProducts = product_ids.map(productId => ({
                campaign_id: newCampaign.id,
                product_id: productId
            }));
            await CampaignProduct.bulkCreate(campaignProducts, { transaction: t });

            // به‌روزرسانی campaign_id در جدول Product (اگر نیاز باشد)
            // این فیلد برای ارتباط یک به چند استفاده می‌شود، در حالی که CampaignProduct برای Many-to-Many است.
            // اگر یک محصول فقط می‌تواند در یک کمپین باشد، این منطق را حفظ می‌کنیم.
            // اگر یک محصول بتواند در چندین کمپین باشد، این قسمت را حذف می‌کنیم و فقط به CampaignProduct تکیه می‌کنیم.
            // با توجه به Migration قبلی که campaign_id را به Product اضافه کردیم، فرض می‌کنیم یک محصول می‌تواند به یک کمپین اصلی لینک شود.
            for (const prod of products) {
                prod.campaign_id = newCampaign.id;
                await prod.save({ transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ message: 'Campaign created successfully!', campaign: newCampaign });

    } catch (error) {
        if (t && !t.finished) { await t.rollback(); }
        logger.error(`Error creating campaign: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error creating campaign', error: error.message });
    }
};

// تابع برای به‌روزرسانی کمپین
exports.updateCampaign = async (req, res) => {
    const { id } = req.params;
    let {
        title, description, slug, banner_image_url, campaign_type,
        start_date, end_date, show_countdown, priority, cta_link,
        is_active, product_ids
    } = req.body;

    // پاکسازی ورودی‌ها
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

        // اعتبارسنجی slug تکراری (در صورت تغییر)
        if (slug && slug !== campaign.slug) {
            const existingCampaign = await Campaign.findOne({
                where: { slug: slug, id: { [Sequelize.Op.ne]: id } },
                transaction: t
            });
            if (existingCampaign) {
                await t.rollback();
                return res.status(409).json({ message: 'Campaign with this slug already exists.' });
            }
        }

        // اعتبارسنجی تاریخ
        if (start_date && end_date && moment(start_date).isAfter(moment(end_date))) {
            await t.rollback();
            return res.status(400).json({ message: 'Start date cannot be after end date.' });
        }

        // به‌روزرسانی فیلدهای کمپین
        campaign.title = title || campaign.title;
        campaign.description = description || campaign.description;
        campaign.slug = slug || campaign.slug;
        campaign.banner_image_url = banner_image_url || campaign.banner_image_url;
        campaign.campaign_type = campaign_type || campaign.campaign_type;
        campaign.start_date = start_date ? new Date(start_date) : campaign.start_date;
        campaign.end_date = end_date ? new Date(end_date) : campaign.end_date;
        campaign.show_countdown = show_countdown !== undefined ? (show_countdown === 'true' || show_countdown === true) : campaign.show_countdown;
        campaign.priority = priority !== undefined ? parseInt(priority) : campaign.priority;
        campaign.cta_link = cta_link || campaign.cta_link;
        campaign.is_active = is_active !== undefined ? (is_active === 'true' || is_active === true) : campaign.is_active;

        await campaign.save({ transaction: t });

        // به‌روزرسانی ارتباط با محصولات (Many-to-Many از طریق CampaignProduct)
        if (product_ids !== undefined) { // اگر product_ids ارسال شد (حتی خالی)
            // حذف تمام ارتباطات قبلی این کمپین با محصولات
            await CampaignProduct.destroy({ where: { campaign_id: campaign.id }, transaction: t });

            // همچنین campaign_id محصولات قدیمی را null می‌کنیم (اگر از طریق Product.campaign_id هم لینک شده باشند)
            await Product.update({ campaign_id: null }, { where: { campaign_id: campaign.id }, transaction: t });

            if (product_ids && product_ids.length > 0) {
                const productsToAssign = await Product.findAll({ where: { id: product_ids }, transaction: t });
                if (productsToAssign.length !== product_ids.length) {
                    await t.rollback();
                    return res.status(404).json({ message: 'One or more specified products for campaign not found.' });
                }
                // ایجاد ارتباطات جدید در CampaignProduct
                const newCampaignProducts = product_ids.map(productId => ({
                    campaign_id: campaign.id,
                    product_id: productId
                }));
                await CampaignProduct.bulkCreate(newCampaignProducts, { transaction: t });

                // به‌روزرسانی campaign_id در جدول Product برای محصولات جدید
                for (const prod of productsToAssign) {
                    prod.campaign_id = campaign.id;
                    await prod.save({ transaction: t });
                }
            }
        }

        await t.commit();
        res.status(200).json({ message: 'Campaign updated successfully!', campaign: campaign });

    } catch (error) {
        if (t && !t.finished) { await t.rollback(); }
        logger.error(`Error updating campaign ${id}: ${error.message}`, { stack: error.stack });
        res.status(500).json({ message: 'Server error updating campaign', error: error.message });
    }
};

// تابع برای دریافت لیست همه کمپین‌ها (پنل ادمین)
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({
            include: [{ model: Product, as: 'products', attributes: ['id', 'name', 'slug'] }], // شامل محصولات مرتبط
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
            include: [{ model: Product, as: 'products', attributes: ['id', 'name', 'slug'] }]
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