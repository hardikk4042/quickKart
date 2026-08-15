'use strict';

/**
 * src/modules/delivery/delivery.routes.js
 *
 * Delivery Partner role-protected routes demonstration.
 * Requires DELIVERY_PARTNER or ADMIN role.
 */

const { Router } = require('express');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { sendSuccess } = require('../../utils/response');

const router = Router();

// Routes accessible by DELIVERY_PARTNER or ADMIN
router.use(authenticate, authorize('DELIVERY_PARTNER', 'ADMIN'));

router.get('/dashboard', (req, res) => {
  return sendSuccess(res, {
    message: 'Welcome to Delivery Partner Portal',
    user: req.user,
  }, 'Delivery partner access granted');
});

module.exports = router;
