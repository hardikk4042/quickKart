'use strict';

/**
 * src/modules/addresses/addresses.repository.js
 *
 * Data access layer for Address entity operations.
 */

const prisma = require('../../config/database');

const addressesRepository = {
  /**
   * Create a new address for a user.
   * If isDefault is true, unsets any existing default address first.
   * @param {string} userId
   * @param {Object} data
   */
  async createAddress(userId, data) {
    if (data.isDefault) {
      return prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
        return tx.address.create({
          data: {
            ...data,
            userId,
          },
        });
      });
    }

    // Check if this is the user's first address — if so, automatically make it default
    const count = await prisma.address.count({ where: { userId } });
    const isDefault = count === 0 ? true : (data.isDefault || false);

    return prisma.address.create({
      data: {
        ...data,
        userId,
        isDefault,
      },
    });
  },

  /**
   * List all addresses for a specific user.
   * @param {string} userId
   */
  async findAddressesByUserId(userId) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  },

  /**
   * Find a single address by ID.
   * @param {string} id
   */
  async findAddressById(id) {
    return prisma.address.findUnique({
      where: { id },
    });
  },

  /**
   * Update an address by ID.
   * If isDefault is set to true, unsets other default addresses for that user.
   * @param {string} id
   * @param {string} userId
   * @param {Object} data
   */
  async updateAddress(id, userId, data) {
    if (data.isDefault) {
      return prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
        return tx.address.update({
          where: { id },
          data,
        });
      });
    }

    return prisma.address.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete an address by ID.
   * If deleting the default address, assigns default status to another existing address if any.
   * @param {string} id
   * @param {string} userId
   */
  async deleteAddress(id, userId) {
    return prisma.$transaction(async (tx) => {
      const deleted = await tx.address.delete({
        where: { id },
      });

      if (deleted.isDefault) {
        const firstRemaining = await tx.address.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        if (firstRemaining) {
          await tx.address.update({
            where: { id: firstRemaining.id },
            data: { isDefault: true },
          });
        }
      }

      return deleted;
    });
  },

  /**
   * Atomically set an address as the default address for a user.
   * @param {string} userId
   * @param {string} addressId
   */
  async setDefaultAddress(userId, addressId) {
    return prisma.$transaction(async (tx) => {
      // 1. Reset all addresses for this user to isDefault = false
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      // 2. Set target address to isDefault = true
      return tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });
  },
};

module.exports = { addressesRepository };
