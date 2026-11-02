'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { COMPOSITION_ROUTE_MANIFEST } = require('../../src/app');

test('composition root preserves the complete ordered 26-mount route contract', () => {
  assert.deepEqual(COMPOSITION_ROUTE_MANIFEST, [
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
  ]);
});
