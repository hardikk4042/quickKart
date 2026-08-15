'use strict';

const { storesService } = require('./stores.service');
const { sendSuccess, sendCreated } = require('../../utils/response');

const storesController = {
  async createStore(req, res, next) {
    try {
      const store = await storesService.createStore(req.body);
      return sendCreated(res, { store }, 'Store created successfully');
    } catch (err) {
      next(err);
    }
  },

  async getStores(req, res, next) {
    try {
      const stores = await storesService.getAllStores(req.user);
      return sendSuccess(res, { stores }, 'Stores retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async getStoreById(req, res, next) {
    try {
      const store = await storesService.getStoreById(req.params.id, req.user);
      return sendSuccess(res, { store }, 'Store retrieved successfully');
    } catch (err) {
      next(err);
    }
  },

  async updateStore(req, res, next) {
    try {
      const store = await storesService.updateStore(req.params.id, req.body, req.user);
      return sendSuccess(res, { store }, 'Store updated successfully');
    } catch (err) {
      next(err);
    }
  },

  async deleteStore(req, res, next) {
    try {
      await storesService.deleteStore(req.params.id, req.user);
      return sendSuccess(res, null, 'Store deleted successfully');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { storesController };
