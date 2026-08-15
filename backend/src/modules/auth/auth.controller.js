'use strict';

/**
 * src/modules/auth/auth.controller.js
 *
 * HTTP controller for authentication routes.
 * Handles request/response concerns only.
 * Delegates all business logic to authService.
 * Uses standard response helpers for consistent API shape.
 */

const { authService } = require('./auth.service');
const { sendSuccess, sendCreated } = require('../../utils/response');

const authController = {
  /**
   * POST /api/auth/register
   *
   * Creates a new customer account.
   * Validation is performed by middleware before this handler is called.
   */
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;
      const result = await authService.register({ name, email, password, phone });
      return sendCreated(res, result, 'Account created successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/auth/login
   *
   * Authenticates a user and returns a JWT + safe user data.
   * Validation is performed by middleware before this handler is called.
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      return sendSuccess(res, result, 'Logged in successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/auth/me
   *
   * Returns the currently authenticated user.
   * req.user is populated by the authenticate middleware.
   * Never returns passwordHash or other sensitive fields.
   */
  async me(req, res, next) {
    try {
      const result = await authService.getMe(req.user.userId);
      return sendSuccess(res, result, 'User retrieved successfully');
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { authController };
