'use strict';

/**
 * src/modules/admin/admin.routes.js
 *
 * Admin role-protected routes demonstration.
 * All routes require authentication and ADMIN role authorization.
 */

const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { sendSuccess } = require('../../utils/response');

const router = Router();

// All routes in this router require ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', (req, res) => {
  return sendSuccess(res, {
    message: 'Welcome to Admin Dashboard',
    user: req.user,
  }, 'Admin access granted');
});

module.exports = router;
