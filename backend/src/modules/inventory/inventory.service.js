'use strict';

const { inventoryRepository } = require('./inventory.repository');
const { productRepository } = require('../products/product.repository');

/**
 * Normalizes an inventory record to include available stock
 */
function normalizeInventory(record) {
  if (!record) return null;
  const availableStock = Math.max(0, record.quantityOnHand - record.quantityReserved);
  
  let status = 'AVAILABLE';
  if (availableStock === 0) status = 'OUT_OF_STOCK';
  else if (availableStock <= record.lowStockThreshold) status = 'LOW_STOCK';

  return {
    ...record,
    availableStock,
    status
  };
}

function paginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

const inventoryService = {
  // Store Manager access control wrapper
  async verifyManagerAccess(user, storeId) {
    if (user.role === 'ADMIN') return true;
    
    if (user.role === 'STORE_MANAGER') {
      const assignedStore = await productRepository.findStoreByManagerId(user.userId);
      if (!assignedStore || assignedStore.id !== storeId) {
        const error = new Error('Not authorized to access this store\'s inventory');
        error.statusCode = 403;
        throw error;
      }
      return true;
    }
    
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  },

  async getStoreInventory(storeId, user, query) {
    await this.verifyManagerAccess(user, storeId);
    
    const { items, total } = await inventoryRepository.listByStore(storeId, query);
    
    return {
      inventory: items.map(normalizeInventory),
      pagination: paginationMeta(total, query.page || 1, query.limit || 20)
    };
  },

  async getGlobalInventory(user, query) {
    if (user.role !== 'ADMIN') {
      const error = new Error('Admin access required');
      error.statusCode = 403;
      throw error;
    }

    const { items, total } = await inventoryRepository.listGlobal(query);
    
    return {
      inventory: items.map(normalizeInventory),
      pagination: paginationMeta(total, query.page || 1, query.limit || 20)
    };
  },

  async getInventoryById(id, user) {
    const record = await inventoryRepository.findById(id);
    if (!record) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }

    await this.verifyManagerAccess(user, record.storeId);
    return normalizeInventory(record);
  },

  async adjustStock(id, user, data) {
    const record = await inventoryRepository.findById(id);
    if (!record) {
      const error = new Error('Inventory not found');
      error.statusCode = 404;
      throw error;
    }

    await this.verifyManagerAccess(user, record.storeId);

    const { quantityDelta, type, reason } = data;
    
    try {
      const result = await inventoryRepository.adjustStock(id, quantityDelta, type, reason);
      return normalizeInventory(result.inventory);
    } catch (err) {
      const error = new Error(err.message || 'Failed to adjust stock');
      error.statusCode = 400; // Bad request, usually due to negative stock
      throw error;
    }
  }
};

module.exports = { inventoryService };
