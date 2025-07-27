const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API documentation for the Lamora online store.',
      version: '1.6.2',
      description:
        'API documentation for the Lamora online e-commerce platform.',
      contact: {
        name: 'Alireza Doosti',
        email: 'alirezadoosti0@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token in format: Bearer <token>',
        },
        sessionId: {
          type: 'apiKey',
          in: 'cookie',
          name: 'session_id',
          description: 'Session ID for guest users (obtained via cookie)',
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF token for POST, PUT, DELETE requests',
        },
      },
      schemas: {
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated ID of the category',
            },
            name: {
              type: 'string',
              description: 'The unique name of the category',
            },
            description: {
              type: 'string',
              description:
                'A brief description of the category. It can be null.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the category was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description:
                'The date and time when the category was last updated',
            },
          },
          example: {
            id: 1,
            name: 'آرایشی صورت',
            description: 'محصولات آرایشی صورت برای زیبا سازی و اصلاح پوست.',
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated ID of the product',
            },
            name: {
              type: 'string',
              description: 'Name of the product',
            },
            description: {
              type: 'string',
              description:
                'Detailed description of the product. It can be null.',
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Price of the product',
            },
            stock_quantity: {
              type: 'integer',
              description: 'Current stock quantity',
            },
            image_url: {
              type: 'string',
              format: 'url',
              description: 'URL of the product image',
            },
            category_id: {
              type: 'integer',
              description: "ID of the product's category",
            },
            views_count: {
              type: 'integer',
              description: 'Number of times the product has been viewed',
            },
            sold_count: {
              type: 'integer',
              description: 'Number of units sold',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly unique identifier for the product',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the product was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description:
                'The date and time when the product was last updated',
            },
          },
          example: {
            id: 1,
            name: 'رژ لب',
            description: 'رژ لب 24 ساعته برند چنل',
            price: 799.99,
            stock_quantity: 50,
            image_url: '/Uploads/products/1234567890-lipStick.jpg',
            category_id: 1,
            views_count: 100,
            sold_count: 5,
            slug: 'lipStick',
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
          },
        },
        CartItemInput: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'integer',
              description: 'The ID of the product to add to the cart',
              example: 1,
            },
            quantity: {
              type: 'integer',
              description: 'The quantity of the product',
              example: 1,
            },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            cartItemId: {
              type: 'integer',
              description: 'The ID of the cart item',
              example: 1,
            },
            productId: {
              type: 'integer',
              description: 'The ID of the product',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Name of the product',
              example: 'Smartphone X',
            },
            quantity: {
              type: 'integer',
              description: 'Quantity of the product in the cart',
              example: 2,
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Price of the product',
              example: 799.99,
            },
            image_url: {
              type: 'string',
              description: 'URL of the product image',
              example: '/Uploads/products/123.jpg',
            },
            stock_available: {
              type: 'integer',
              description: 'Current stock available for the product',
              example: 48,
            },
            status: {
              type: 'string',
              description:
                'Stock status of the item (e.g., available, out_of_stock_partial, out_of_stock_full)',
              example: 'available',
            },
          },
        },
        CartDetails: {
          type: 'object',
          properties: {
            cartId: {
              type: 'integer',
              description: 'The ID of the shopping cart',
              example: 1,
            },
            userId: {
              type: 'integer',
              nullable: true,
              description: 'ID of the logged-in user if applicable',
              example: 101,
            },
            sessionId: {
              type: 'string',
              nullable: true,
              description: 'Session ID for guest users',
              example: 'guest_session_12345',
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'Expiration date of the cart',
            },
            totalItems: {
              type: 'integer',
              description: 'Total number of distinct items in the cart',
              example: 2,
            },
            totalAmount: {
              type: 'number',
              format: 'float',
              description: 'Total monetary value of all items in the cart',
              example: 1599.98,
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CartItem',
              },
            },
          },
        },
        OrderInput: {
          type: 'object',
          required: ['shippingAddressId'],
          properties: {
            shippingAddressId: {
              type: 'integer',
              description: 'The ID of the shipping address for the order',
              example: 1,
            },
            couponCode: {
              type: 'string',
              description: 'Optional coupon code to apply to the order',
              example: 'SUMMER20',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated ID of the order',
            },
            user_id: {
              type: 'integer',
              description: 'ID of the user who placed the order',
            },
            total_amount: {
              type: 'number',
              format: 'float',
              description: 'Total amount of the order after discounts',
            },
            status: {
              type: 'string',
              description:
                'Current status of the order (e.g., pending, processing, shipped, delivered, cancelled, refunded)',
            },
            shipping_address_id: {
              type: 'integer',
              description: 'ID of the shipping address used for the order',
            },
            payment_status: {
              type: 'string',
              description:
                'Status of the payment for the order (e.g., unpaid, paid, refunded)',
            },
            coupon_id: {
              type: 'integer',
              nullable: true,
              description: 'ID of the coupon used for the order (if any)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the order was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the order was last updated',
            },
          },
          example: {
            id: 1,
            user_id: 1,
            total_amount: 12500000,
            status: 'pending',
            shipping_address_id: 1,
            payment_status: 'unpaid',
            coupon_id: null,
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
          },
        },
        OrderWithDetails: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/Order' },
            {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserBasic' },
                shippingAddress: { $ref: '#/components/schemas/Address' },
                coupon: { $ref: '#/components/schemas/CouponBasic' },
                orderItems: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/OrderItem',
                  },
                },
              },
            },
          ],
          example: {
            id: 1,
            user_id: 1,
            total_amount: 799.99,
            status: 'delivered',
            shipping_address_id: 1,
            payment_status: 'paid',
            coupon_id: null,
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
            user: {
              username: 'adminuser',
              email: 'admin@example.com',
            },
            shippingAddress: {
              id: 1,
              street: '123 Test Street',
              city: 'Tehran',
            },
            coupon: {
              code: 'SUMMER20',
              discount_type: 'percentage',
              discount_value: 20.0,
            },
            orderItems: [
              {
                id: 1,
                order_id: 1,
                product_id: 1,
                quantity: 1,
                price_at_purchase: 799.99,
                product: {
                  name: 'Smartphone X',
                  price: 799.99,
                  image_url: '/Uploads/products/default_smartphone.jpg',
                },
              },
            ],
          },
        },
        OrderStatusUpdate: {
          type: 'object',
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              description: 'New status for the order',
              example: 'shipped',
            },
          },
        },
        UserBasic: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            email: { type: 'string' },
          },
          example: {
            username: 'adminuser',
            email: 'admin@example.com',
          },
        },
        Address: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            street: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip_code: { type: 'string' },
            country: { type: 'string' },
          },
          example: {
            id: 1,
            street: '123 Test Street',
            city: 'Tehran',
            state: 'Tehran',
            zip_code: '12345',
            country: 'Iran',
          },
        },
        CouponBasic: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            discount_type: { type: 'string' },
            discount_value: {
              type: 'number',
              format: 'float',
            },
          },
          example: {
            code: 'SUMMER20',
            discount_type: 'percentage',
            discount_value: 20.0,
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            order_id: { type: 'integer' },
            product_id: { type: 'integer' },
            quantity: { type: 'integer' },
            price_at_purchase: {
              type: 'number',
              format: 'float',
            },
            product: { $ref: '#/components/schemas/ProductBasic' },
          },
          example: {
            id: 1,
            order_id: 1,
            product_id: 1,
            quantity: 1,
            price_at_purchase: 799.99,
            product: {
              name: 'ماسک صورت ضدجوش',
              price: 250000,
              image_url: '/Uploads/products/default_image.jpg',
            },
          },
        },
        ProductBasic: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: {
              type: 'number',
              format: 'float',
            },
            image_url: { type: 'string' },
          },
          example: {
            name: 'ماسک صورت ضدجوش',
            price: 250000,
            image_url: '/Uploads/products/default_image.jpg',
          },
        },
        UserAdminView: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated ID of the user',
            },
            username: {
              type: 'string',
              description: 'Unique username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Unique email address',
            },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone_number: { type: 'string' },
            role_id: {
              type: 'integer',
              description: "ID of the user's role",
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            role: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  example: 'admin',
                },
              },
            },
          },
          example: {
            id: 1,
            username: 'adminuser',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            phone_number: '09000000000',
            role_id: 2,
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
            role: {
              name: 'admin',
            },
          },
        },
        ReviewInput: {
          type: 'object',
          required: ['product_id', 'rating'],
          properties: {
            product_id: {
              type: 'integer',
              description: 'ID of the product being reviewed',
              example: 1,
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              description: 'Rating given to the product (1-5)',
              example: 5,
            },
            comment: {
              type: 'string',
              nullable: true,
              description: 'Optional text comment for the review',
              example: 'این محصول واقعا فوق العادس!',
            },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated ID of the review',
              example: 1,
            },
            user_id: {
              type: 'integer',
              description: 'ID of the user who posted the review',
              example: 1,
            },
            product_id: {
              type: 'integer',
              description: 'ID of the product reviewed',
              example: 1,
            },
            rating: {
              type: 'integer',
              description: 'Rating given (1-5)',
              example: 5,
            },
            comment: {
              type: 'string',
              nullable: true,
              description: 'Text comment',
              example: 'به شدت توصیه میشه!',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the review was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the review was last updated',
            },
          },
          example: {
            id: 1,
            user_id: 1,
            product_id: 1,
            rating: 5,
            comment: 'این محصول فوق العادس !',
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
          },
        },
        ReviewWithUser: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/Review' },
            {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    first_name: { type: 'string' },
                    last_name: { type: 'string' },
                  },
                  example: {
                    username: 'testuser',
                    first_name: 'Test',
                    last_name: 'User',
                  },
                },
              },
            },
          ],
        },
        CouponInput: {
          type: 'object',
          required: ['code', 'discount_type', 'discount_value'],
          properties: {
            code: {
              type: 'string',
              description: 'Unique code for the coupon',
              example: 'NEWYEAR2025',
            },
            discount_type: {
              type: 'string',
              enum: ['percentage', 'fixed_amount'],
              description: 'Type of discount (percentage or fixed_amount)',
              example: 'percentage',
            },
            discount_value: {
              type: 'number',
              format: 'float',
              description:
                'Value of the discount (e.g., 10 for 10% or 20 for $20)',
              example: 10,
            },
            min_amount: {
              type: 'number',
              format: 'float',
              description: 'Minimum order amount to apply the coupon',
              example: 50.0,
            },
            usage_limit: {
              type: 'integer',
              nullable: true,
              description:
                'Maximum number of times this coupon can be used overall',
              example: 100,
            },
            expiry_date: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expiration date of the coupon (YYYY-MM-DD)',
              example: '2025-12-31',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the coupon is currently active',
              example: true,
            },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated ID of the coupon',
              example: 1,
            },
            code: {
              type: 'string',
              description: 'Unique code for the coupon',
              example: 'NEWYEAR2025',
            },
            discount_type: {
              type: 'string',
              description: 'Type of discount',
              example: 'percentage',
            },
            discount_value: {
              type: 'number',
              format: 'float',
              description: 'Value of the discount',
              example: 10.0,
            },
            min_amount: {
              type: 'number',
              format: 'float',
              description: 'Minimum order amount',
              example: 50.0,
            },
            usage_limit: {
              type: 'integer',
              nullable: true,
              description: 'Maximum overall usage',
              example: 100,
            },
            used_count: {
              type: 'integer',
              description: 'Number of times this coupon has been used',
              example: 5,
            },
            expiry_date: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Expiration date',
              example: '2025-12-31',
            },
            isActive: {
              type: 'boolean',
              description: 'Is coupon active',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          example: {
            id: 1,
            code: 'NEWYEAR2025',
            discount_type: 'percentage',
            discount_value: 10.0,
            min_amount: 50.0,
            usage_limit: 100,
            used_count: 5,
            expiry_date: '2025-12-31',
            isActive: true,
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
          },
        },
        OnlineShoppingAdvice: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The auto-generated ID of the advice record',
              example: 1,
            },
            user_id: {
              type: 'integer',
              nullable: true,
              description:
                'ID of the user who initiated the advice (null for AI responses or guests without user_id)',
              example: 1,
            },
            session_id: {
              type: 'string',
              nullable: true,
              description:
                'Session ID for guest users or to link AI responses to a session',
              example: 'guest_session_xyz',
            },
            chat_text: {
              type: 'string',
              description: 'The text content of the chat message',
              example: 'من نیاز به یک رژ لب برای استفاده روزمره دارم',
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'The timestamp of the message',
              example: '2025-07-12T12:00:00.000Z',
            },
            object: {
              type: 'string',
              nullable: true,
              description:
                'Related topic or object of the advice (e.g., product name, category)',
              example: 'پیشنهاد رژ لب',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
          example: {
            id: 1,
            user_id: 1,
            session_id: null,
            chat_text: 'سلام ، من نیاز به یک رژ لب برای استفاده روزمره دارم',
            date: '2025-07-12T12:00:00.000Z',
            object: 'پیشنهاد رژ لب',
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
          },
        },
        OnlineShoppingAdviceWithUser: {
          type: 'object',
          allOf: [
            { $ref: '#/components/schemas/OnlineShoppingAdvice' },
            {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/UserBasic' },
              },
            },
          ],
          example: {
            id: 1,
            user_id: 1,
            session_id: null,
            chat_text: 'سلام ، من نیاز به یک رژ لب برای استفاده روزمره دارم',
            date: '2025-07-12T12:00:00.000Z',
            object: 'پیشنهاد رژ لب',
            createdAt: '2025-07-12T12:00:00.000Z',
            updatedAt: '2025-07-12T12:00:00.000Z',
            user: {
              username: 'testuser',
              email: 'test@example.com',
            },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'The auto-generated ID of the campaign' },
            title: { type: 'string', description: 'Campaign title', example: 'Summer Sale' },
            description: { type: 'string', description: 'Campaign description', example: 'Big discounts for summer products.' },
            slug: { type: 'string', description: 'Unique URL-friendly identifier', example: 'summer-sale' },
            banner_image_url: { type: 'string', format: 'url', description: 'URL of the campaign banner image', example: '/banners/summer_sale.jpg' },
            campaign_type: { type: 'string', description: 'Type of campaign (e.g., seasonal, bestsellers, clearance)', example: 'seasonal' },
            start_date: { type: 'string', format: 'date-time', description: 'Campaign start date', example: '2025-07-01T00:00:00Z' },
            end_date: { type: 'string', format: 'date-time', description: 'Campaign end date', example: '2025-07-31T23:59:59Z' },
            show_countdown: { type: 'boolean', description: 'Whether to show a countdown timer', example: true },
            priority: { type: 'integer', description: 'Display priority (lower number for higher priority)', example: 100 },
            cta_link: { type: 'string', format: 'url', description: 'Call to action link', example: '/products/summer-collection' },
            is_active: { type: 'boolean', description: 'Whether the campaign is currently active', example: true },
            createdAt: { type: 'string', format: 'date-time', description: 'Record creation timestamp', example: '2025-06-25T12:00:00Z' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Record last update timestamp', example: '2025-06-30T09:00:00Z' }
          },
          example: {
            id: 1,
            title: 'Summer Sale',
            description: 'Big discounts for summer products.',
            slug: 'summer-sale',
            banner_image_url: '/banners/summer_sale.jpg',
            campaign_type: 'seasonal',
            start_date: '2025-07-01T00:00:00Z',
            end_date: '2025-07-31T23:59:59Z',
            show_countdown: true,
            priority: 100,
            cta_link: '/products/summer-collection',
            is_active: true,
            createdAt: '2025-06-25T12:00:00Z',
            updatedAt: '2025-06-30T09:00:00Z'
          }
        }

      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
