'use strict';

/**
 * src/modules/users/users.controller.js
 *
 * HTTP controller handlers for user profile endpoints.
 */

const { usersService } = require('./users.service');
const { sendSuccess } = require('../../utils/response');

const usersController = {
  /**
   * GET /api/users/me
   */
  async getMe(req, res, next) {
    try {
      const user = await usersService.getProfile(req.user.userId);
      return sendSuccess(res, { user }, 'User profile retrieved successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PATCH /api/users/me
   */
  async updateMe(req, res, next) {
    try {
      const user = await usersService.updateProfile(req.user.userId, req.body);
      return sendSuccess(res, { user }, 'Profile updated successfully');
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { usersController };
