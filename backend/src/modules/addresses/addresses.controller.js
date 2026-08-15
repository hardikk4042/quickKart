'use strict';

/**
 * src/modules/addresses/addresses.controller.js
 *
 * HTTP controllers for Address management and Reverse Geocoding.
 */

const { addressesService } = require('./addresses.service');
const { sendSuccess, sendCreated } = require('../../utils/response');

const addressesController = {
  /**
   * POST /api/addresses
   */
  async createAddress(req, res, next) {
    try {
      const address = await addressesService.createAddress(req.user.userId, req.body);
      return sendCreated(res, { address }, 'Address created successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/addresses
   */
  async getAddresses(req, res, next) {
    try {
      const addresses = await addressesService.getUserAddresses(req.user.userId);
      return sendSuccess(res, { addresses }, 'Addresses retrieved successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * GET /api/addresses/:id
   */
  async getAddressById(req, res, next) {
    try {
      const address = await addressesService.getAddressById(req.params.id);
      return sendSuccess(res, { address }, 'Address retrieved successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PATCH /api/addresses/:id
   */
  async updateAddress(req, res, next) {
    try {
      const address = await addressesService.updateAddress(req.params.id, req.user.userId, req.body);
      return sendSuccess(res, { address }, 'Address updated successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * DELETE /api/addresses/:id
   */
  async deleteAddress(req, res, next) {
    try {
      await addressesService.deleteAddress(req.params.id, req.user.userId);
      return sendSuccess(res, null, 'Address deleted successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * PATCH /api/addresses/:id/default
   */
  async setDefaultAddress(req, res, next) {
    try {
      const address = await addressesService.setDefaultAddress(req.user.userId, req.params.id);
      return sendSuccess(res, { address }, 'Default address updated successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/addresses/reverse-geocode
   */
  async reverseGeocode(req, res, next) {
    try {
      const { latitude, longitude } = req.body;
      const result = await addressesService.reverseGeocode(latitude, longitude);
      return sendSuccess(res, result, 'Location resolved successfully');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * POST /api/addresses/forward-geocode
   */
  async forwardGeocode(req, res, next) {
    try {
      const { query } = req.body;
      const result = await addressesService.forwardGeocode(query);
      return sendSuccess(res, { result }, 'Address geocoded successfully');
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = { addressesController };
