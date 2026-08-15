'use strict';

/**
 * src/modules/users/users.routes.js
 *
 * User profile routes.
 *
 * Protected routes (JWT required):
 *   GET   /api/users/me
 *   PATCH /api/users/me
 */

const { Router } = require('express');
const { usersController } = require('./users.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { updateProfileSchema } = require('./users.validation');

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.patch('/me', validate(updateProfileSchema), usersController.updateMe);

module.exports = router;
