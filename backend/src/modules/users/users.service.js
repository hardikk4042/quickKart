'use strict';

/**
 * src/modules/users/users.service.js
 *
 * Business logic for user profile management.
 */

const { usersRepository } = require('./users.repository');
const AppError = require('../../utils/errors');

const usersService = {
  /**
   * Get user profile by ID.
   * @param {string} userId
   */
  async getProfile(userId) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User profile not found');
    }
    return user;
  },

  /**
   * Update user profile fields.
   * Prevents updates to email, password, role, or id.
   * @param {string} userId
   * @param {Object} updates
   */
  async updateProfile(userId, updates) {
    const existing = await usersRepository.findById(userId);
    if (!existing) {
      throw AppError.notFound('User profile not found');
    }

    // Explicit whitelist of modifiable profile fields
    const safeUpdates = {};
    if (updates.name !== undefined) safeUpdates.name = updates.name;
    if (updates.phone !== undefined) safeUpdates.phone = updates.phone;
    if (updates.avatarUrl !== undefined) safeUpdates.avatarUrl = updates.avatarUrl;

    const updatedUser = await usersRepository.updateUser(userId, safeUpdates);
    return updatedUser;
  },
};

module.exports = { usersService };
