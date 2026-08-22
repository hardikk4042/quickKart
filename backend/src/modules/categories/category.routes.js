'use strict';

/**
 * src/modules/categories/category.routes.js
 *
 * Category API routes.
 *
 * Public (no auth required):
 *   GET  /api/categories            — list active categories (customers see active only)
 *   GET  /api/categories/slug/:slug — get by slug
 *   GET  /api/categories/:id        — get by ID
 *
 * Admin-only (require ADMIN role):
 *   POST   /api/categories           — create category
 *   PATCH  /api/categories/:id       — update category
 *   PATCH  /api/categories/:id/status — activate/deactivate
 */

const express = require('express');
const { categoryController } = require('./category.controller');
const {
  createCategorySchema,
  updateCategorySchema,
  setCategoryStatusSchema,
} = require('./category.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// ── Optional auth helper ──────────────────────────────────────
// Attaches req.user if token is present, but does NOT reject unauthenticated requests.
// Used on public read routes so admins/managers see all categories while customers see active only.
function optionalAuth(req, _res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // no token — proceed as guest
  }
  return authenticate(req, _res, next);
}

// ── Public read routes (optional auth) ───────────────────────
router.get('/', optionalAuth, categoryController.getCategories);
router.get('/slug/:slug', optionalAuth, categoryController.getCategoryBySlug);
router.get('/:id', optionalAuth, categoryController.getCategoryById);

// ── Admin-only write routes ───────────────────────────────────
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  validate(createCategorySchema),
  categoryController.createCategory,
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(updateCategorySchema),
  categoryController.updateCategory,
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validate(setCategoryStatusSchema),
  categoryController.setCategoryStatus,
);

module.exports = router;
