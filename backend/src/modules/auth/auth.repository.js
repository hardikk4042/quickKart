'use strict';

/**
 * src/modules/auth/auth.repository.js
 *
 * Data access layer for auth operations.
 * All database queries are here. Services never call Prisma directly.
 *
 * Safe fields constant defines what is safe to return from User.
 * passwordHash is NEVER included in any public-facing query result.
 */

const prisma = require('../../config/database');

/** Fields returned when representing a user to the outside world */
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  avatarUrl: true,
  isActive: true,
  isEmailVerified: true,
  createdAt: true,
  updatedAt: true,
  // passwordHash: false  ← intentionally excluded
};

const authRepository = {
  /**
   * Find a user by email, including passwordHash for verification.
   * Only used during login — the hash is never forwarded to clients.
   * @param {string} email
   */
  async findByEmailWithHash(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        ...SAFE_USER_SELECT,
        passwordHash: true, // needed for bcrypt comparison
      },
    });
  },

  /**
   * Find a user by ID, excluding passwordHash.
   * Safe for public/client use.
   * @param {string} id
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  },

  /**
   * Check whether an email address already exists.
   * @param {string} email
   * @returns {boolean}
   */
  async emailExists(email) {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  },

  /**
   * Create a new user.
   * Role is always set to CUSTOMER — never trust client input for role.
   * @param {{ name: string, email: string, passwordHash: string, phone?: string }} data
   */
  async createUser({ name, email, passwordHash, phone }) {
    return prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone: phone ?? null,
        role: 'CUSTOMER', // hardcoded — clients cannot assign privileged roles
      },
      select: SAFE_USER_SELECT,
    });
  },
};

module.exports = { authRepository, SAFE_USER_SELECT };
