'use strict';

/**
 * src/modules/users/users.repository.js
 *
 * Data access layer for User entity operations.
 * Explicit safe field selection ensures passwordHash is never returned.
 */

const prisma = require('../../config/database');
const { SAFE_USER_SELECT } = require('../auth/auth.repository');

const usersRepository = {
  /**
   * Find a user profile by ID.
   * @param {string} id
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Update user profile fields.
   * @param {string} id
   * @param {Object} updates - Sanitized fields (name, phone, avatarUrl)
   */
  async updateUser(id, updates) {
    return prisma.user.update({
      where: { id },
      data: updates,
      select: SAFE_USER_SELECT,
    });
  },
};

module.exports = { usersRepository };
