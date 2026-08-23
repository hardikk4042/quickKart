'use strict';

const express = require('express');
const { inventoryController } = require('./inventory.controller');
const { inventoryQuerySchema, adjustStockSchema } = require('./inventory.validation');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/role.middleware');
const { validate } = require('../../middleware/validation.middleware');

const router = express.Router();

// All inventory routes require authentication
router.use(authenticate);

// Store Manager and Admin routes
router.get('/store/:storeId', authorize('ADMIN', 'STORE_MANAGER'), validate(inventoryQuerySchema, 'query'), inventoryController.getStoreInventory);
router.get('/:id', authorize('ADMIN', 'STORE_MANAGER'), inventoryController.getInventoryById);
router.patch('/:id/adjust', authorize('ADMIN', 'STORE_MANAGER'), validate(adjustStockSchema), inventoryController.adjustStock);

// Admin only routes
router.get('/', authorize('ADMIN'), validate(inventoryQuerySchema, 'query'), inventoryController.getGlobalInventory);

module.exports = router;
