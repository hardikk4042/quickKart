'use strict';

/**
 * src/app.js
 *
 * Express application setup.
 * Registers middleware, routes, and the global error handler.
 * Does NOT start the HTTP server — that is server.js's job.
 */

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const env                = require('./config/env');
const errorMiddleware    = require('./middleware/error.middleware');
const authRoutes         = require('./modules/auth/auth.routes');
const usersRoutes        = require('./modules/users/users.routes');
const addressesRoutes    = require('./modules/addresses/addresses.routes');
const adminRoutes        = require('./modules/admin/admin.routes');
const storesRoutes       = require('./modules/stores/stores.routes');
const storeManagerRoutes = require('./modules/storeManager/storeManager.routes');
const deliveryRoutes     = require('./modules/delivery/delivery.routes');
const categoriesRoutes   = require('./modules/categories/category.routes');
const productsRoutes     = require('./modules/products/product.routes');
const inventoryRoutes    = require('./modules/inventory/inventory.routes');

const app = express();

// ── Security headers ─────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Request logging (development only) ───────────────────────
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/users',      usersRoutes);
app.use('/api/addresses',  addressesRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/stores',     storesRoutes);
app.use('/api/store',      storeManagerRoutes);
app.use('/api/delivery',   deliveryRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products',   productsRoutes);
app.use('/api/inventory',  inventoryRoutes);

// ── 404 for unknown routes ───────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: { code: 'NOT_FOUND' },
  });
});

// ── Global error handler (must be last) ──────────────────────
app.use(errorMiddleware);

module.exports = app;
