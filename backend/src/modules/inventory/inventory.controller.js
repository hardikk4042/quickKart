'use strict';

const { inventoryService } = require('./inventory.service');
const { sendSuccess } = require('../../utils/response');

const inventoryController = {
  // GET /api/inventory/store/:storeId
  async getStoreInventory(req, res, next) {
    try {
      const { storeId } = req.params;
      const data = await inventoryService.getStoreInventory(storeId, req.user, req.query);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/inventory
  async getGlobalInventory(req, res, next) {
    try {
      const data = await inventoryService.getGlobalInventory(req.user, req.query);
      return sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/inventory/:id
  async getInventoryById(req, res, next) {
    try {
      const { id } = req.params;
      const inventory = await inventoryService.getInventoryById(id, req.user);
      return sendSuccess(res, { inventory });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/inventory/:id/adjust
  async adjustStock(req, res, next) {
    try {
      const { id } = req.params;
      const inventory = await inventoryService.adjustStock(id, req.user, req.body);
      return sendSuccess(res, { inventory }, 'Stock adjusted successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { inventoryController };
