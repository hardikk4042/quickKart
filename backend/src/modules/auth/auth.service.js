'use strict';

/**
 * src/modules/auth/auth.service.js
 *
 * Business logic for authentication.
 * Coordinates hashing, JWT generation, and repository calls.
 * Does NOT handle HTTP concerns (status codes, request/response).
 *
 * Security rules enforced here:
 *  - Passwords are hashed with bcrypt before persistence
 *  - Passwords and hashes are never logged
 *  - JWT payload is minimal: { userId, role }
 *  - Role is embedded in JWT to avoid a DB round-trip on every request
 *    (for Phase 1 only; roles don't change frequently for customers)
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AppError = require('../../utils/errors');
const logger = require('../../utils/logger');
const { authRepository } = require('./auth.repository');

const BCRYPT_SALT_ROUNDS = 12;

/**
 * Strip passwordHash from a user object before any return.
 * Belt-and-suspenders safety in addition to repository-level selection.
 */
function safeUser(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * Generate a signed JWT for the given user.
 * Payload: { userId, role }
 * Expiry: from JWT_EXPIRES_IN env var
 *
 * @param {{ id: string, role: string }} user
 * @returns {string} signed JWT — never log this value
 */
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

const authService = {
  /**
   * Register a new customer.
   *
   * @param {{ name: string, email: string, password: string, phone?: string }} data
   * @returns {{ user: SafeUser }}
   * @throws {AppError} 409 if email already registered
   */
  async register({ name, email, password, phone }) {
    // email is already normalised (lowercased, trimmed) by Zod schema
    const exists = await authRepository.emailExists(email);
    if (exists) {
      throw AppError.conflict('An account with this email already exists');
    }

    // Hash the password — never store the plain-text value
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await authRepository.createUser({ name, email, passwordHash, phone });

    logger.info('User registered', { userId: user.id, email: user.email });

    return { user: safeUser(user) };
  },

  /**
   * Authenticate a user with email + password.
   *
   * Returns a safe user object and a signed JWT on success.
   * Always returns the same generic error for invalid credentials
   * to prevent user-enumeration attacks.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {{ user: SafeUser, token: string }}
   * @throws {AppError} 401 on invalid credentials
   */
  async login({ email, password }) {
    // Fetch user WITH hash — only for comparison, never returned
    const userWithHash = await authRepository.findByEmailWithHash(email);

    // Generic message — does not reveal whether the email exists
    if (!userWithHash) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (!userWithHash.isActive) {
      throw AppError.unauthorized('This account has been suspended. Please contact support.');
    }

    const passwordMatches = await bcrypt.compare(password, userWithHash.passwordHash);
    if (!passwordMatches) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = generateToken(userWithHash);

    logger.info('User logged in', { userId: userWithHash.id });

    // Strip hash before returning
    const user = safeUser(userWithHash);
    return { user, token };
  },

  /**
   * Retrieve a safe user record by ID.
   * Used by the /me endpoint after JWT verification.
   *
   * @param {string} userId
   * @returns {SafeUser}
   * @throws {AppError} 401 if user no longer exists (e.g. deleted after token was issued)
   */
  async getMe(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw AppError.unauthorized('User account no longer exists');
    }
    if (!user.isActive) {
      throw AppError.unauthorized('This account has been suspended');
    }
    return { user: safeUser(user) };
  },
};

module.exports = { authService, generateToken };
