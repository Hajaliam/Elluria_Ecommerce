'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const expressWinston = require('express-winston');
const authMiddleware = require('./middlewares/authMiddleware');
const swaggerSpec = require('./config/swagger');
const { logger } = require('./config/logger');
const { sanitizeString } = require('./utils/sanitizer');
const defaultDatabase = require('../models');
const userService = require('./services/userService');
const backupService = require('./utils/backupService');

const routes = {
  users: require('./routes/userRoutes'),
  categories: require('./routes/categoryRoutes'),
  products: require('./routes/productRoutes'),
  cart: require('./routes/cartRoutes'),
  orders: require('./routes/orderRoutes'),
  admin: require('./routes/adminRoutes'),
  reviews: require('./routes/reviewRoutes'),
  coupons: require('./routes/couponRoutes'),
  search: require('./routes/searchRoutes'),
  settings: require('./routes/settingRoutes'),
  payments: require('./routes/paymentRoutes'),
  shipping: require('./routes/shippingRoutes'),
  brands: require('./routes/brandRoutes'),
  campaigns: require('./routes/campaignRoutes'),
  attributes: require('./routes/attributeRoutes'),
  attributeValues: require('./routes/attributeValueRoutes'),
  productVariants: require('./routes/productVariantRoutes'),
};

const COMPOSITION_ROUTE_MANIFEST = Object.freeze([
  { method: 'get', path: '/api/csrf-token', handlers: ['csrf', 'csrfToken'] },
  { method: 'use', path: '/uploads', handlers: ['uploads'] },
  { method: 'use', path: '/api-docs', handlers: ['swaggerServe', 'swaggerSetup'] },
  { method: 'get', path: '/', handlers: ['root'] },
  { method: 'use', path: '/api/users', handlers: ['users'] },
  { method: 'use', path: '/api/categories', handlers: ['csrf', 'categories'] },
  { method: 'use', path: '/api/products', handlers: ['csrf', 'products'] },
  { method: 'use', path: '/api/cart', handlers: ['csrf', 'cart'] },
  { method: 'use', path: '/api/orders', handlers: ['csrf', 'orders'] },
  { method: 'use', path: '/api/admin', handlers: ['csrf', 'admin'] },
  { method: 'use', path: '/api/reviews', handlers: ['csrf', 'reviews'] },
  { method: 'use', path: '/api/coupons', handlers: ['csrf', 'coupons'] },
  { method: 'use', path: '/api/search', handlers: ['search'] },
  { method: 'post', path: '/api/admin/backup', handlers: ['authenticateToken', 'authorizeAdmin', 'manualBackup'] },
  { method: 'use', path: '/api/payments', handlers: ['payments'] },
  { method: 'use', path: '/api/settings', handlers: ['settings'] },
  { method: 'use', path: '/api/shipping', handlers: ['shipping'] },
  { method: 'use', path: '/api/admin/brands', handlers: ['authenticateToken', 'authorizeAdmin', 'brands'] },
  { method: 'use', path: '/api/brands', handlers: ['brands'] },
  { method: 'use', path: '/api/admin/campaigns', handlers: ['campaigns'] },
  { method: 'use', path: '/api/campaigns', handlers: ['campaigns'] },
  { method: 'use', path: '/api/admin/attributes', handlers: ['attributes'] },
  { method: 'use', path: '/api/admin/attributes/:attributeId/values', handlers: ['attributeValues'] },
  { method: 'use', path: '/api/attributes/:attributeId/values', handlers: ['attributeValues'] },
  { method: 'use', path: '/api/admin/products/:productId/variants', handlers: ['productVariants'] },
  { method: 'use', path: '/api/products/:productId/variants', handlers: ['productVariants'] },
].map(Object.freeze));

function requireAdapter(adapters, name) {
  if (!adapters || !adapters[name]) {
    throw new Error(`Composition root must provide the ${name} adapter.`);
  }
  return adapters[name];
}

function createApplication({ adapters, database = defaultDatabase } = {}) {
  const ai = requireAdapter(adapters, 'ai');
  const email = requireAdapter(adapters, 'email');
  const sms = requireAdapter(adapters, 'sms');
  const payment = requireAdapter(adapters, 'payment');
  const backup = requireAdapter(adapters, 'backup');
  userService.configureExternalAdapters({ email, sms });
  backupService.configureBackupExecution(backup);

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });
  app.locals.adapters = { ai, email, sms, payment, backup };
  app.locals.database = database;

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001', credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    if (!req.cookies.session_id) {
      const sessionId = uuidv4();
      res.cookie('session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      req.cookies.session_id = sessionId;
      logger.info(`New session_id generated and set: ${sessionId}`);
    }
    next();
  });
  app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: false,
    colorize: true,
    ignoreRoute: () => false,
  }));

  const routeHandlers = {
    csrf: csrf({ cookie: true }),
    csrfToken: (req, res) => res.json({ csrfToken: req.csrfToken() }),
    uploads: express.static(path.join(__dirname, '..', 'public', 'uploads')),
    swaggerServe: swaggerUi.serve,
    swaggerSetup: swaggerUi.setup(swaggerSpec),
    root: (req, res) => res.send('Welcome to the E-commerce Backend API!'),
    ...routes,
    authenticateToken: authMiddleware.authenticateToken,
    authorizeAdmin: authMiddleware.authorizeRoles('admin'),
    manualBackup: backupService.manualBackup,
  };
  for (const mount of COMPOSITION_ROUTE_MANIFEST) {
    app[mount.method](mount.path, ...mount.handlers.map((name) => routeHandlers[name]));
  }

  const conversationHistoryMap = new Map();
  io.on('connection', (socket) => {
    logger.info(`A user connected via WebSocket: ${socket.id}`);
    socket.on('sendAdviceMessage', async (data) => {
      const { userId, sessionId, message, topic } = data;
      const sanitizedMessage = sanitizeString(message);
      const sanitizedTopic = topic ? sanitizeString(topic) : 'General';
      try {
        let finalUserId = userId || null;
        let finalSessionId = sessionId || null;
        if (finalUserId) finalSessionId = null;
        else if (!finalSessionId) {
          logger.warn('Neither User ID nor Session ID found in message payload. Rejecting message.');
          socket.emit('receiveAdviceMessage', { sender: 'AI', message: 'Please refresh the page to start a new chat session.' });
          return;
        }
        const chatKey = finalUserId ? `user:${finalUserId}` : `session:${finalSessionId}`;
        const history = conversationHistoryMap.get(chatKey) || [];
        const userRecord = await database.OnlineShoppingAdvice.create({
          user_id: finalUserId, session_id: finalSessionId, chat_text: sanitizedMessage,
          date: new Date(), object: sanitizedTopic, createdAt: new Date(), updatedAt: new Date(),
        });
        logger.info(`User message saved: ID ${userRecord.id}`);
        history.push({ sender: 'user', message: sanitizedMessage });
        conversationHistoryMap.set(chatKey, history);
        const aiResponseText = await ai.getResponse(sanitizedMessage, history);
        history.push({ sender: 'AI', message: aiResponseText });
        conversationHistoryMap.set(chatKey, history);
        const aiRecord = await database.OnlineShoppingAdvice.create({
          user_id: null, session_id: finalSessionId, chat_text: aiResponseText,
          date: new Date(), object: sanitizedTopic, createdAt: new Date(), updatedAt: new Date(),
        });
        logger.info(`AI response saved: ID ${aiRecord.id}`);
        socket.emit('receiveAdviceMessage', { sender: 'مشاور فروش لامورا', message: aiResponseText });
      } catch (error) {
        logger.error(`Error processing or saving advice message/response: ${error.message}`, {
          stack: error.stack, userId: finalUserId, sessionId: finalSessionId,
        });
        socket.emit('receiveAdviceMessage', {
          sender: 'مشاور فروش لامورا ',
          message: 'Sorry, I am unable to process your request at the moment. Please try again later.',
        });
      }
    });
    socket.on('disconnect', () => logger.info(`User disconnected from WebSocket: ${socket.id}`));
    socket.on('error', (error) => logger.error(`WebSocket error for ${socket.id}: ${error.message}`));
  });

  app.use(expressWinston.errorLogger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP Error {{req.method}} {{req.url}} {{res.statusCode}} {{err.message}}',
    colorize: true,
  }));
  app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, path: req.path, ip: req.ip });
    if (err.code === 'EBADCSRFTOKEN') return res.status(403).json({ message: 'Invalid CSRF token.' });
    res.status(err.status || 500).json({
      message: err.message || 'An unexpected error occurred.',
      error: process.env.NODE_ENV === 'development' ? err.stack : {},
    });
  });

  async function close() {
    if (!server.listening) {
      io.close();
      return;
    }
    await new Promise((resolve) => io.close(resolve));
  }
  return { app, server, io, close };
}

module.exports = { COMPOSITION_ROUTE_MANIFEST, createApplication };
