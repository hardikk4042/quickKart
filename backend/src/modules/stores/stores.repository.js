'use strict';

const prisma = require('../../config/database');

const storesRepository = {
  async createStore(data) {
    return prisma.store.create({
      data,
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async findAllStores() {
    return prisma.store.findMany({
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findStoreById(id) {
    return prisma.store.findUnique({
      where: { id },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async findStoreByManagerId(managerId) {
    return prisma.store.findUnique({
      where: { managerId },
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async updateStore(id, data) {
    return prisma.store.update({
      where: { id },
      data,
      include: {
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  async deleteStore(id) {
    return prisma.store.delete({
      where: { id },
    });
  },

  // Helper to check if a user is a valid store manager
  async findManagerById(userId) {
    return prisma.user.findFirst({
      where: {
        id: userId,
        role: 'STORE_MANAGER',
      },
    });
  },
};

module.exports = { storesRepository };
