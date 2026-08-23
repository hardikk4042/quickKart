'use strict';

const prisma = require('../../config/database');

const inventoryRepository = {
  // Find inventory by store and product
  async findByStoreAndProduct(storeId, productId) {
    return prisma.inventory.findUnique({
      where: {
        storeId_productId: { storeId, productId },
      },
    });
  },

  // Find inventory record by ID
  async findById(id) {
    return prisma.inventory.findUnique({
      where: { id },
      include: {
        product: { select: { name: true, images: true, category: { select: { name: true } } } },
        store: { select: { name: true } }
      }
    });
  },

  // List inventory for a specific store
  async listByStore(storeId, { page = 1, limit = 20, q = '' } = {}) {
    const where = { storeId };
    
    if (q) {
      where.product = {
        name: { contains: q, mode: 'insensitive' }
      };
    }
    
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: { select: { name: true, images: true, category: { select: { name: true } } } },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.inventory.count({ where })
    ]);

    return { items, total };
  },

  // List inventory globally (Admin)
  async listGlobal({ storeId, productId, page = 1, limit = 20, q = '' } = {}) {
    const where = {};
    if (storeId) where.storeId = storeId;
    if (productId) where.productId = productId;
    
    if (q) {
      where.product = {
        name: { contains: q, mode: 'insensitive' }
      };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          product: { select: { name: true, images: true, category: { select: { name: true } } } },
          store: { select: { name: true } },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.inventory.count({ where })
    ]);

    return { items, total };
  },

  // Adjust stock safely using Prisma transactions
  async adjustStock(inventoryId, quantityDelta, type, reason, orderId = null) {
    // We use a Prisma interactive transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      // 1. Fetch current inventory
      const current = await tx.inventory.findUnique({
        where: { id: inventoryId }
      });

      if (!current) {
        throw new Error('Inventory record not found');
      }

      // 2. Calculate new quantities based on the transaction type
      let newQuantityOnHand = current.quantityOnHand;
      let newQuantityReserved = current.quantityReserved;

      switch (type) {
        case 'STOCK_IN':
          if (quantityDelta <= 0) throw new Error('Quantity delta must be positive for STOCK_IN');
          newQuantityOnHand += quantityDelta;
          break;
        case 'STOCK_OUT':
          if (quantityDelta <= 0) throw new Error('Quantity delta must be positive for STOCK_OUT');
          newQuantityOnHand -= quantityDelta;
          if (newQuantityOnHand < 0) throw new Error('Adjustment would result in negative stock');
          break;
        case 'ADJUSTMENT': // Allows negative or positive adjustments directly
          newQuantityOnHand += quantityDelta;
          if (newQuantityOnHand < 0) {
            throw new Error('Adjustment would result in negative stock');
          }
          break;
        case 'RESERVE':
          if (quantityDelta <= 0) throw new Error('Quantity delta must be positive for RESERVE');
          if (newQuantityOnHand - newQuantityReserved < quantityDelta) {
            throw new Error('Insufficient available stock to reserve');
          }
          newQuantityReserved += quantityDelta;
          break;
        case 'RELEASE':
          if (quantityDelta <= 0) throw new Error('Quantity delta must be positive for RELEASE');
          if (newQuantityReserved < quantityDelta) {
            throw new Error('Cannot release more than reserved quantity');
          }
          newQuantityReserved -= quantityDelta;
          break;
        case 'CONFIRM_RESERVATION':
          if (quantityDelta <= 0) throw new Error('Quantity delta must be positive for CONFIRM_RESERVATION');
          if (newQuantityReserved < quantityDelta) {
            throw new Error('Cannot confirm more than reserved quantity');
          }
          // Stock actually leaves the building
          newQuantityReserved -= quantityDelta;
          newQuantityOnHand -= quantityDelta;
          break;
        default:
          throw new Error(`Unknown transaction type: ${type}`);
      }

      // 3. Update the inventory
      const updatedInventory = await tx.inventory.update({
        where: { 
          id: inventoryId,
          version: current.version // Optimistic locking
        },
        data: {
          quantityOnHand: newQuantityOnHand,
          quantityReserved: newQuantityReserved,
          version: { increment: 1 }
        },
        include: {
          product: { select: { name: true } },
          store: { select: { name: true } }
        }
      });

      // 4. Record the transaction log
      const transaction = await tx.inventoryTransaction.create({
        data: {
          inventoryId,
          type,
          quantityDelta,
          reason,
          orderId
        }
      });

      return { inventory: updatedInventory, transaction };
    });
  }
};

module.exports = { inventoryRepository };
