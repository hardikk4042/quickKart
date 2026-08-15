'use strict';

/**
 * src/modules/addresses/addresses.routes.js
 *
 * Delivery Address & Geocoding API Routes.
 * All routes require authentication.
 * Single-resource routes (:id) enforce resource ownership authorization.
 */

const { Router } = require('express');
const { addressesController } = require('./addresses.controller');
const { addressesService } = require('./addresses.service');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorizeOwnership } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createAddressSchema,
  updateAddressSchema,
  reverseGeocodeSchema,
  forwardGeocodeSchema,
} = require('./addresses.validation');

const router = Router();

// All address routes require JWT authentication
router.use(authenticate);

// ── Collection routes ────────────────────────────────────────

router.get('/', addressesController.getAddresses);
router.post('/', validate(createAddressSchema), addressesController.createAddress);
router.post('/reverse-geocode', validate(reverseGeocodeSchema), addressesController.reverseGeocode);
router.post('/forward-geocode', validate(forwardGeocodeSchema), addressesController.forwardGeocode);

// ── Resource ownership helper for :id routes ───────────────

const addressOwnershipCheck = authorizeOwnership({
  getResourceOwnerId: async (req) => {
    const address = await addressesService.getAddressById(req.params.id);
    return address ? address.userId : null;
  },
  allowBypassRoles: ['ADMIN'], // ADMIN can access/modify any address if required
});

// ── Single resource (:id) routes ─────────────────────────────

router.get('/:id', addressOwnershipCheck, addressesController.getAddressById);
router.patch('/:id', addressOwnershipCheck, validate(updateAddressSchema), addressesController.updateAddress);
router.delete('/:id', addressOwnershipCheck, addressesController.deleteAddress);
router.patch('/:id/default', addressOwnershipCheck, addressesController.setDefaultAddress);

module.exports = router;
