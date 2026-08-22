'use strict';

/**
 * src/modules/products/product.routes.js
 *
 * Product API routes.
 *
 * Public (optional auth — active-only filter applied for guests):
 *   GET /api/products                — list with filters & pagination
 *   GET /api/products/search         — search
 *   GET /api/products/slug/:slug     — get by slug
 *   GET /api/products/:id            — get by ID
 *   GET /api/products/:id/similar    — similar products
 *
 * ADMIN + STORE_MANAGER (require auth; ownership enforced in service layer):
 *   POST   /api/products             — create product
 *   PATCH  /api/products/:id         — update product
 *   PATCH  /api/products/:id/status  — activate / deactivate
 *
 * Fine-grained RBAC rules (enforced in service, NOT here):
 *   STORE_MANAGER create  → must supply storeId; verified against Store.managerId in DB
 *   STORE_MANAGER update  → product must be in their store's Inventory
 *   STORE_MANAGER status  → product must be in their store's Inventory
 *   ADMIN               → unrestricted on all products
 */

const express = require('express');
const { productController } = require('./product.controller');
const {
  createProductSchema,
  updateProductSchema,
  setProductStatusSchema,
} = require('./product.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// ── Optional auth helper ──────────────────────────────────────
// Attaches req.user if a valid token is present, but does NOT reject unauthenticated requests.
function optionalAuth(req, _res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return authenticate(req, _res, next);
}

// ── Public read routes (optional auth) ───────────────────────
// NOTE: /search and /slug/:slug MUST come before /:id to avoid route shadowing
router.get('/search', optionalAuth, productController.searchProducts);
router.get('/slug/:slug', optionalAuth, productController.getProductBySlug);
router.get('/:id/similar', optionalAuth, productController.getSimilarProducts);
router.get('/:id', optionalAuth, productController.getProductById);
router.get('/', optionalAuth, productController.getProducts);

// ── ADMIN + STORE_MANAGER write routes ────────────────────────
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'STORE_MANAGER'),
  validate(createProductSchema),
  productController.createProduct,
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'STORE_MANAGER'),
  validate(updateProductSchema),
  productController.updateProduct,
);

// ── ADMIN + STORE_MANAGER — status toggle (ownership enforced in service) ───
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN', 'STORE_MANAGER'),
  validate(setProductStatusSchema),
  productController.setProductStatus,
);

module.exports = router;
