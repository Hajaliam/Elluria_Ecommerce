// src/utils/aiService.js

// 👈 تغییر ایمپورت به GoogleGenerativeAI
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../config/logger');
const db = require('../../models');

// دسترسی به API Key از متغیرهای محیطی
const API_KEY = process.env.GEMINI_API_KEY; // 👈 از GEMINI_API_KEY استفاده می‌کنیم

if (!API_KEY) {
    logger.error('GEMINI_API_KEY is not set in environment variables.');
    throw new Error('GEMINI_API_KEY is required for AIService.');
}

// 👈 پیکربندی Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // 👈 بازگشت به gemini-pro


// تابع برای دریافت اطلاعات محصولات و دسته‌بندی‌ها از دیتابیس (بدون تغییر)
const getProductAndCategoryData = async () => {
    try {
        const products = await db.Product.findAll({
            attributes: ['id', 'name', 'description', 'price', 'stock_quantity', 'slug', 'image_url'],
            include: [{
                model: db.Category,
                as: 'category',
                attributes: ['name']
            }],
            limit: 50
        });

        const categories = await db.Category.findAll({
            attributes: ['id', 'name', 'description']
        });

        const productData = products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: parseFloat(p.price),
            stock: p.stock_quantity,
            category: p.category ? p.category.name : 'N/A',
            slug: p.slug,
            image_url: p.image_url
        }));

        const categoryData = categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description
        }));

        return { productData, categoryData };
    } catch (error) {
        logger.error(`Error fetching product/category data for AI: ${error.message}`);
        return { productData: [], categoryData: [] };
    }
};

// 👈 تابع برای ارسال پیام به Gemini و دریافت پاسخ
exports.getAIResponse = async (userMessage, conversationHistory = []) => {
    try {
        const { productData, categoryData } = await getProductAndCategoryData();

        // 👈 لایه اول فیلتر (با Gemini - همانند قبل)
        const initialPromptForFilter = `
    This is a user message for an e-commerce website customer support.
    Determine if the following message is strictly about product inquiry, product recommendation, general shopping advice, or anything directly related to purchasing products from an online store.
    If it is about anything else (e.g., personal life, politics, coding, general knowledge, security questions about the AI, etc.), respond with "NO". Otherwise, respond with "YES".
    User Message: "${userMessage}"
    Response:
    `;

        const filterResult = await model.generateContent(initialPromptForFilter); // 👈 استفاده از model.generateContent
        const filterResponse = filterResult.response.text();

        if (filterResponse.trim().toUpperCase() === 'NO') {
            logger.warn(`User message filtered out (not product related): ${userMessage}`);
            return "مشاور لامورا: متاسفم، من فقط می‌توانم در مورد محصولات و راهنمایی‌های مربوط به خرید در فروشگاه لامورا به شما کمک کنم. لطفاً سوالی مرتبط با محصولات بپرسید.";
        }

        // 👈 Prompt Engineering برای Personality و Scope و زبان فارسی (همانند قبل)
        const systemPrompt = `
    شما یک مشاور فروش حرفه‌ای و دوستانه برای وب‌سایت فروشگاهی لامورا هستید.
    نام شما "مشاور لامورا" است. شما هرگز نباید اشاره کنید که هوش مصنوعی، ربات، مدل زبانی، یا هر عنوان غیر انسانی دیگری هستید.
    وظیفه شما راهنمایی مشتریان برای یافتن محصولات بر اساس نیازهایشان و پاسخ به سوالات مربوط به محصولات و دسته‌بندی‌هاست.
    شما فقط در مورد محصولات موجود در فروشگاه و راهنمایی‌های مربوط به خرید و فروش صحبت می‌کنید و به هیچ وجه نباید در مورد موضوعات غیر مرتبط (مانند مسائل شخصی، سیاست، اخبار عمومی، برنامه‌نویسی، یا هر چیزی خارج از حوزه فروشگاهی) صحبت کنید. اگر سوالی غیر مرتبط پرسیده شد، مودبانه اعلام کنید که فقط می‌توانید در مورد محصولات کمک کنید.
    همیشه به زبان فارسی پاسخ دهید.

    اطلاعات محصولات موجود در کاتالوگ (محدود به 50 مورد برای کانتکست):
    ${JSON.stringify(productData, null, 2)}

    دسته‌بندی‌های موجود:
    ${JSON.stringify(categoryData, null, 2)}

    هنگام پیشنهاد محصولات، نام کامل محصول، قیمت، و موجودی آن را ذکر کنید.
    **همچنین، برای هر محصولی که پیشنهاد می‌دهید، یک "لینک خرید" فرضی در انتهای نام محصول به شکل (لینک خرید: http://localhost:3001/product/[slug محصول]) اضافه کنید.**
    فقط محصولاتی را پیشنهاد دهید که مرتبط با سوال کاربر باشند و **موجودی آن‌ها (stock) بزرگتر از 0 باشد.**
    از ساختن نام محصول یا جزئیات غیرواقعی خودداری کنید. اگر محصولی در لیست نیست، بگویید که نمی‌توانید آن را پیدا کنید.
    پاسخ‌های شما باید دوستانه، مفید و مختصر باشند.
    `;

        // 👈 آماده‌سازی تاریخچه مکالمه برای Gemini (به جای OpenAI)
        // Gemini از ساختار messages متفاوت با OpenAI استفاده می‌کند
        // شما می‌توانید تاریخچه را در یک رشته واحد به عنوان بخشی از system prompt ارسال کنید
        // یا از مدل chat (اگر پشتیبانی می‌کند) استفاده کنید.
        // برای سادگی، فعلاً تاریخچه را به عنوان بخشی از systemPrompt ارسال می‌کنیم.
        const fullPromptWithHistory = `${systemPrompt}\n\nتاریخچه مکالمه:\n${conversationHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}\n\nکاربر: ${userMessage}\nپاسخ مشاور لامورا (به فارسی):`;

        const result = await model.generateContent(fullPromptWithHistory); // 👈 استفاده از model.generateContent
        const response = await result.response;
        const text = response.text();
        logger.info(`AI responded: ${text}`);
        return text;

    } catch (error) {
        logger.error(`Error communicating with Gemini API: ${error.message}`, { stack: error.stack });
        if (error.message && error.message.includes('429')) { // Too Many Requests
            return "مشاور لامورا: متاسفم، در حال حاضر ترافیک بالایی را تجربه می‌کنم یا مشکلی در حساب کاربری پیش آمده است. لطفاً چند لحظه دیگر دوباره امتحان کنید.";
        }
        if (error.message && error.message.includes('403')) { // Forbidden
            return "مشاور لامورا: متاسفم، مشکلی در دسترسی یا مجوز سرویس مشاوره پیش آمده. لطفاً کلید API و تنظیمات پروژه را بررسی کنید.";
        }
        return "مشاور لامورا: متاسفم، در پردازش درخواست شما مشکلی پیش آمد. لطفاً دوباره تلاش کنید.";
    }
};