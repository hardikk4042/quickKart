'use strict';

/**
 * src/modules/storeManager/storeManager.routes.js
 *
 * Store Manager role-protected routes demonstration.
 * Requires STORE_MANAGER or ADMIN role.
 */

const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { sendSuccess } = require('../../utils/response');

const router = Router();

// Routes accessible by STORE_MANAGER or ADMIN
router.use(authenticate, authorize('STORE_MANAGER', 'ADMIN'));

router.get('/dashboard', (req, res) => {
  return sendSuccess(res, {
    message: 'Welcome to Store Manager Portal',
    user: req.user,
  }, 'Store manager access granted');
});

module.exports = router;
