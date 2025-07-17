// server.js

require('dotenv').config(); // بارگذاری متغیرهای محیطی از .env

const express = require('express');
const http = require('http'); // برای ایجاد سرور HTTP (مورد نیاز Socket.IO)
const { Server } = require('socket.io'); // برای WebSocket
const cors = require('cors'); // برای Cross-Origin Resource Sharing
const helmet = require('helmet'); // برای امنیت HTTP headers
const cookieParser = require('cookie-parser'); // برای پردازش کوکی‌ها
const csrf = require('csurf'); // برای محافظت CSRF
const { v4: uuidv4 } = require('uuid');
const path = require('path'); // برای کار با مسیرهای فایل
const authMiddleware = require('./src/middlewares/authMiddleware');

require('global-agent/bootstrap');

process.env.GLOBAL_AGENT_HTTP_PROXY = 'http://127.0.0.1:10809';

// ایمپورت Swagger (برای مستندات API)
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// ایمپورت روت‌های API HTTP (HTTP Routes)
const userRoutes = require('./src/routes/userRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const couponRoutes = require('./src/routes/couponRoutes');
const searchRoutes = require('./src/routes/searchRoutes');

// ایمپورت Logger (برای لاگ‌گیری)
const logger = require('./src/config/logger');
const expressWinston = require('express-winston');

// ایمپورت مدل‌ها و ابزارهای مورد نیاز برای WebSocket و Gemini
const db = require('./models'); // آبجکت حاوی همه مدل‌های Sequelize
const { sanitizeString } = require('./src/utils/sanitizer'); // برای پاکسازی ورودی‌های XSS
//const { getGeminiResponse } = require('./src/utils/geminiService'); // برای ارتباط با Gemini API
const { getAIResponse } = require('./src/utils/aiService');
const { startBackupScheduler, manualBackup } = require('./src/utils/backupService');

const app = express();
const server = http.createServer(app); // ساخت سرور HTTP از اپ Express

// تنظیمات CORS برای Socket.IO (جدا از CORS Express)
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001', // آدرس فرانت‌اند شما (مثلاً http://localhost:3001)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // برای اجازه ارسال کوکی‌ها در درخواست‌های Cross-Origin
  },
});

// ** Middleware های عمومی Express **
app.use(helmet()); // اعمال محافظت‌های امنیتی از طریق هدرها
app.use(
  cors({
    // CORS برای درخواست‌های HTTP
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  }),
);
app.use(express.json()); // Body parser برای درخواست‌های JSON
app.use(express.urlencoded({ extended: true })); // Body parser برای درخواست‌های URL-encoded
const parseCookies = cookieParser(); // نمونه‌ای از cookie-parser
app.use(parseCookies); // اعمال cookie-parser به عنوان Middleware

app.use((req, res, next) => {
  // اگر session_id در کوکی‌ها وجود نداشت و کاربر لاگین نکرده بود (فعلا فرض می‌کنیم لاگین نیست)
  // در آینده می‌توانید این را با بررسی JWT یا session کاربر لاگین شده ترکیب کنید
  if (!req.cookies.session_id) {
    const sessionId = uuidv4(); // تولید یک UUID جدید
    res.cookie('session_id', sessionId, {
      httpOnly: true, // کوکی فقط از طریق HTTP قابل دسترسی است
      secure: process.env.NODE_ENV === 'production', // در production فقط از HTTPS استفاده شود
      maxAge: 7 * 24 * 60 * 60 * 1000, // انقضای کوکی: 7 روز
    });
    req.cookies.session_id = sessionId; // برای استفاده در درخواست فعلی
    logger.info(`New session_id generated and set: ${sessionId}`);
  }
  next();
});

// ** لاگ‌گیری درخواست‌های HTTP با Express-Winston ** (قبل از روت‌ها)
app.use(
  expressWinston.logger({
    winstonInstance: logger, // استفاده از logger سفارشی ما
    meta: true, // شامل کردن متادیتای درخواست
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms', // فرمت پیام لاگ
    expressFormat: false, // غیرفعال کردن فرمت Express پیش‌فرض
    colorize: true, // رنگی کردن لاگ‌ها در کنسول
    ignoreRoute: function (req, res) {
      return false;
    }, // تابع برای نادیده گرفتن روت‌ها (فعلا همه را لاگ می‌کند)
  }),
);

// ** CSRF Protection **
const csrfProtection = csrf({ cookie: true }); // تعریف CSRF Protection با استفاده از کوکی

// ** روت برای دریافت CSRF Token ** (این روت خودش نیازی به CSRF Protection از قبل ندارد)
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ** سرویس دهی فایل‌های استاتیک **
// برای دسترسی به تصاویر آپلود شده
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ** روت‌های مستندات Swagger **
// این روت باید قبل از اعمال csrfProtection به روت‌های API قرار گیرد
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ** روت‌های API HTTP (با اعمال انتخابی CSRF Protection) **
// CSRF Protection فقط به روت‌هایی اعمال می‌شود که وضعیت را تغییر می‌دهند (POST, PUT, DELETE)
// و نیازمند محافظت هستند.
// روت‌های forgot-password و reset-password در userRoutes از csrfProtection مستثنی شده‌اند.
app.get('/', (req, res) => {
  res.send('Welcome to the E-commerce Backend API!');
});
app.use('/api/users', userRoutes); // تمام روت‌های userRoutes (به جز مستثنی شده‌ها)
app.use('/api/categories', csrfProtection, categoryRoutes);
app.use('/api/products', csrfProtection, productRoutes);
app.use('/api/cart', csrfProtection, cartRoutes);
app.use('/api/orders', csrfProtection, orderRoutes);
app.use('/api/admin', csrfProtection, adminRoutes);
app.use('/api/reviews', csrfProtection, reviewRoutes);
app.use('/api/coupons', csrfProtection, couponRoutes);
app.use('/api/search', searchRoutes);
app.post('/api/admin/backup', authMiddleware.authenticateToken, authMiddleware.authorizeRoles('admin'), manualBackup);

// ** WebSocket (Socket.IO) Logic for Online Advice (AI Chat) **
// Map برای ذخیره موقت تاریخچه مکالمه هر نشست (برای AI با حافظه کوتاه مدت)
const conversationHistoryMap = new Map();

io.on('connection', (socket) => {
  logger.info(`A user connected via WebSocket: ${socket.id}`);

  // 👈 این خطوط مربوط به parse کردن کوکی‌ها در WebSocket حذف می‌شوند
  // parseCookies(socket.request, {}, () => {});
  // if (socket.request.headers.cookie) { /* ... */ } else { /* ... */ }

  socket.on('sendAdviceMessage', async (data) => {
    // 👈 حالا userId و sessionId مستقیماً از data می‌آیند
    const { userId, sessionId, message, topic } = data;

    const sanitizedMessage = sanitizeString(message);
    const sanitizedTopic = topic ? sanitizeString(topic) : 'General';

    logger.info(
      `Received advice message from ${userId ? 'User ID: ' + userId : 'Session ID: ' + sessionId}: ${sanitizedMessage}`,
    );

    try {
      let finalUserId = userId || null;
      let finalSessionId = sessionId || null;

      // اگر userId ارسال شده (کاربر لاگین شده) بود، session_id را null می‌کنیم
      if (finalUserId) {
        finalSessionId = null;
      } else if (!finalSessionId) {
        // این بلاک همچنان به عنوان یک fallback باقی می‌ماند اگر کلاینت session_id را ارسال نکند
        logger.warn(
          'Neither User ID nor Session ID found in message payload. Rejecting message.',
        );
        socket.emit('receiveAdviceMessage', {
          sender: 'AI',
          message: 'Please refresh the page to start a new chat session.',
        });
        return;
      }

      const chatKey = finalUserId
        ? `user:${finalUserId}`
        : `session:${finalSessionId}`;
      let currentConversationHistory =
        conversationHistoryMap.get(chatKey) || [];

      const userMessageRecord = await db.OnlineShoppingAdvice.create({
        user_id: finalUserId,
        session_id: finalSessionId,
        chat_text: sanitizedMessage,
        date: new Date(),
        object: sanitizedTopic,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info(`User message saved: ID ${userMessageRecord.id}`);

      currentConversationHistory.push({
        sender: 'user',
        message: sanitizedMessage,
      });
      conversationHistoryMap.set(chatKey, currentConversationHistory);

      const aiResponseText = await getAIResponse(
        sanitizedMessage,
        currentConversationHistory,
      );

      currentConversationHistory.push({
        sender: 'AI',
        message: aiResponseText,
      });
      conversationHistoryMap.set(chatKey, currentConversationHistory);

      const aiMessageRecord = await db.OnlineShoppingAdvice.create({
        user_id: null,
        session_id: finalSessionId,
        chat_text: aiResponseText,
        date: new Date(),
        object: sanitizedTopic,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      logger.info(`AI response saved: ID ${aiMessageRecord.id}`);

      socket.emit('receiveAdviceMessage', {
        sender: 'مشاور فروش لامورا',
        message: aiResponseText,
      });
    } catch (error) {
      logger.error(
        `Error processing or saving advice message/response: ${error.message}`,
        { stack: error.stack, userId: finalUserId, sessionId: finalSessionId },
      );
      socket.emit('receiveAdviceMessage', {
        sender: 'مشاور فروش لامورا ',
        message:
          'Sorry, I am unable to process your request at the moment. Please try again later.',
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected from WebSocket: ${socket.id}`);
  });

  socket.on('error', (error) => {
    logger.error(`WebSocket error for ${socket.id}: ${error.message}`);
  });
});

// ** لاگ‌گیری خطاها با Express-Winston ** (بعد از روت‌ها و قبل از Middleware نهایی خطا)
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP Error {{req.method}} {{req.url}} {{res.statusCode}} {{err.message}}',
    colorize: true,
  }),
);

// ** Middleware نهایی برای مدیریت خطاها **
// هر خطایی که به این Middleware برسد (که توسط هیچ روت یا Middleware قبلی هندل نشده باشد)
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    ip: req.ip,
  });
  // اگر خطا مربوط به CSRF باشد، یک پاسخ 403 (Forbidden) برگردان
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ message: 'Invalid CSRF token.' });
  }
  // در غیر این صورت، یک پاسخ 500 (Internal Server Error) برگردان
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}, // در محیط توسعه، جزئیات Stack Trace را برمی‌گرداند
  });
});

// ** راه‌اندازی سرور **
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // سرور HTTP (که Socket.IO روی آن فعال است) را listen می‌کند
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Database User: ${process.env.DB_USER}`);

  ///بکاپ Scheduler راه اندازی
  startBackupScheduler();
});
