'use strict';

const { storesRepository } = require('./stores.repository');
const AppError = require('../../utils/errors');
const logger = require('../../utils/logger');

const storesService = {
  async createStore(data) {
    // If managerId is provided, verify they are a STORE_MANAGER
    if (data.managerId) {
      const manager = await storesRepository.findManagerById(data.managerId);
      if (!manager) {
        throw AppError.badRequest('Invalid managerId: User is not a STORE_MANAGER or does not exist');
      }
      
      // Also ensure the manager is not already assigned to another store
      const existingStore = await storesRepository.findStoreByManagerId(data.managerId);
      if (existingStore) {
         throw AppError.conflict('Manager is already assigned to another store');
      }
    }

    const store = await storesRepository.createStore(data);
    logger.info('Store created', { storeId: store.id });
    return store;
  },

  async getAllStores(user) {
    // Admin can see all stores
    if (user.role === 'ADMIN') {
      return storesRepository.findAllStores();
    }
    
    // Store Manager can only see their assigned store (returned as array for consistency)
    if (user.role === 'STORE_MANAGER') {
      const store = await storesRepository.findStoreByManagerId(user.userId);
      return store ? [store] : [];
    }
    
    throw AppError.forbidden('Access denied');
  },

  async getStoreById(id, user) {
    const store = await storesRepository.findStoreById(id);
    if (!store) {
      throw AppError.notFound('Store not found');
    }

    if (user.role === 'STORE_MANAGER') {
      if (store.managerId !== user.userId) {
        throw AppError.forbidden('You can only access your assigned store');
      }
    }

    return store;
  },

  async updateStore(id, data, user) {
    const store = await storesRepository.findStoreById(id);
    if (!store) {
      throw AppError.notFound('Store not found');
    }

    if (user.role === 'STORE_MANAGER') {
      if (store.managerId !== user.userId) {
        throw AppError.forbidden('You can only update your assigned store');
      }
      // Store managers cannot reassign manager or change active status
      if (data.managerId !== undefined || data.isActive !== undefined) {
        throw AppError.forbidden('You cannot change manager assignment or store status');
      }
    }

    if (user.role === 'ADMIN' && data.managerId) {
      if (data.managerId !== store.managerId) {
        const manager = await storesRepository.findManagerById(data.managerId);
        if (!manager) {
          throw AppError.badRequest('Invalid managerId: User is not a STORE_MANAGER or does not exist');
        }
        const existingStore = await storesRepository.findStoreByManagerId(data.managerId);
        if (existingStore && existingStore.id !== id) {
           throw AppError.conflict('Manager is already assigned to another store');
        }
      }
    }

    const updatedStore = await storesRepository.updateStore(id, data);
    logger.info('Store updated', { storeId: id });
    return updatedStore;
  },

  async deleteStore(id, user) {
    if (user.role !== 'ADMIN') {
      throw AppError.forbidden('Only admins can delete stores');
    }
    const store = await storesRepository.findStoreById(id);
    if (!store) {
      throw AppError.notFound('Store not found');
    }
    await storesRepository.deleteStore(id);
    logger.info('Store deleted', { storeId: id });
    return true;
  },
};

module.exports = { storesService };
