'use strict';

const express = require('express');
const { storesController } = require('./stores.controller');
const { createStoreSchema, updateStoreSchema } = require('./stores.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// Require authentication for all store routes
router.use(authenticate);

// Store Manager and Admin can list and get by ID
router.get('/', authorize('ADMIN', 'STORE_MANAGER'), storesController.getStores);
router.get('/:id', authorize('ADMIN', 'STORE_MANAGER'), storesController.getStoreById);

// Update store (Admin can update everything, Store Manager restricted via service layer)
router.patch('/:id', authorize('ADMIN', 'STORE_MANAGER'), validate(updateStoreSchema), storesController.updateStore);

// Only Admin can create and delete stores
router.post('/', authorize('ADMIN'), validate(createStoreSchema), storesController.createStore);
router.delete('/:id', authorize('ADMIN'), storesController.deleteStore);

module.exports = router;
