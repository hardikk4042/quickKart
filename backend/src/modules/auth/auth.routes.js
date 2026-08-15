'use strict';

/**
 * src/modules/auth/auth.routes.js
 *
 * Authentication route definitions.
 *
 * Public routes (no authentication required):
 *   POST /api/auth/register
 *   POST /api/auth/login
 *
 * Protected routes (JWT required):
 *   GET  /api/auth/me
 */

const { Router } = require('express');
const { authController } = require('./auth.controller');
const { validate } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');

const router = Router();

// ── Public ───────────────────────────────────────────────────

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);

// ── Protected ────────────────────────────────────────────────

router.get('/me', authenticate, authController.me);

module.exports = router;
