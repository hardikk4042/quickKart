'use strict';

/**
 * src/modules/addresses/addresses.service.js
 *
 * Business logic for delivery address management.
 * Reverse geocoding uses OpenStreetMap Nominatim (free, no API key required).
 *
 * Nominatim usage policy:
 *   - Maximum 1 request/second
 *   - Must set a descriptive User-Agent
 *   - No bulk/automated geocoding
 *   https://operations.osmfoundation.org/policies/nominatim/
 */

const https = require('https');
const { addressesRepository } = require('./addresses.repository');
const AppError = require('../../utils/errors');
const logger = require('../../utils/logger');

const NOMINATIM_USER_AGENT = 'QuickKart/1.0 (grocery-delivery; contact@quickkart.dev)';

/**
 * Helper — HTTPS GET that returns parsed JSON.
 * Works for both Nominatim and any other HTTPS endpoint.
 */
function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': NOMINATIM_USER_AGENT,
        'Accept-Language': 'en',
        ...headers,
      },
    };
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (err) { reject(err); }
      });
    });

    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('HTTP request timeout'));
    });

    req.on('error', (err) => reject(err));
  });
}

const addressesService = {
  /**
   * Create a new address for the authenticated user.
   * Strips any client-supplied userId from payload.
   */
  async createAddress(userId, data) {
    // eslint-disable-next-line no-unused-vars
    const { userId: _, ...safeData } = data;
    return addressesRepository.createAddress(userId, safeData);
  },

  /**
   * List all addresses for the authenticated user.
   */
  async getUserAddresses(userId) {
    return addressesRepository.findAddressesByUserId(userId);
  },

  /**
   * Get a single address by ID.
   */
  async getAddressById(id) {
    const address = await addressesRepository.findAddressById(id);
    if (!address) throw AppError.notFound('Address not found');
    return address;
  },

  /**
   * Update an address by ID.
   * Strips any client-supplied userId from payload.
   */
  async updateAddress(id, userId, updates) {
    const existing = await addressesRepository.findAddressById(id);
    if (!existing) throw AppError.notFound('Address not found');
    // eslint-disable-next-line no-unused-vars
    const { userId: _, id: __, ...safeUpdates } = updates;
    return addressesRepository.updateAddress(id, userId, safeUpdates);
  },

  /**
   * Delete an address by ID.
   */
  async deleteAddress(id, userId) {
    const existing = await addressesRepository.findAddressById(id);
    if (!existing) throw AppError.notFound('Address not found');
    return addressesRepository.deleteAddress(id, userId);
  },

  /**
   * Set an address as the default for the user.
   */
  async setDefaultAddress(userId, addressId) {
    const existing = await addressesRepository.findAddressById(addressId);
    if (!existing) throw AppError.notFound('Address not found');
    return addressesRepository.setDefaultAddress(userId, addressId);
  },

  /**
   * Reverse-geocode latitude/longitude → readable address components.
   *
   * Uses OpenStreetMap Nominatim (free, no API key required).
   * Nominatim returns an `address` object with well-known fields:
   *   house_number, road, suburb, neighbourhood, city, town, village,
   *   state, postcode, country
   *
   * @param {number} latitude
   * @param {number} longitude
   * @returns {Promise<{configured: boolean, formattedAddress: string, address: object}>}
   */
  async reverseGeocode(latitude, longitude) {
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse` +
        `?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`;

      const response = await fetchJson(url);

      if (response.error || !response.address) {
        logger.warn('Nominatim reverse geocoding returned no result', { latitude, longitude });
        return buildFallback(latitude, longitude);
      }

      const a = response.address;

      // City: pick the most specific populated-place field available
      const city =
        a.city || a.town || a.village || a.municipality ||
        a.county || a.suburb || '';

      const state   = a.state   || '';
      const pincode = a.postcode || '';
      const country = a.country  || 'India';

      // line1: road + house number (or formatted address if unavailable)
      const roadParts = [a.house_number, a.road || a.pedestrian].filter(Boolean);
      const line1 =
        roadParts.length > 0
          ? roadParts.join(', ')
          : response.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      // line2: neighbourhood / suburb / area
      const line2 =
        [a.neighbourhood, a.suburb, a.quarter].filter(Boolean).join(', ') || '';

      return {
        configured: true,
        formattedAddress: response.display_name || line1,
        address: {
          line1,
          line2,
          city,
          state,
          pincode,
          country,
          latitude,
          longitude,
        },
      };
    } catch (err) {
      logger.error('Nominatim reverse geocoding failed', { error: err.message });
      // Graceful fallback — do NOT crash
      return buildFallback(latitude, longitude);
    }
  },
  /**
   * Forward-geocode a text address → latitude + longitude.
   *
   * Uses Nominatim /search endpoint. Returns null when no result found
   * rather than throwing — callers should handle the null case gracefully.
   *
   * @param {string} query  Full or partial address text
   * @returns {Promise<{latitude: number, longitude: number, address: object}|null>}
   */
  async forwardGeocode(query) {
    /**
     * Forward-geocode a text address → latitude + longitude.
     *
     * Tries up to 3 progressively simpler queries so that even if Nominatim
     * can't find the specific street address it can at least locate the city.
     *
     * Expected query format from frontend:
     *   "line1, city, state, pincode, country"
     *
     * Fallback chain:
     *   1. Full query as received
     *   2. Without line1: "city, state, pincode, country"
     *   3. City+state only: "city, state, country"
     */
    const nominatimSearch = async (q) => {
      if (!q || q.trim().length < 3) return [];
      const url =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(q.trim())}&format=json&limit=1&addressdetails=1`;
      const results = await fetchJson(url);
      return Array.isArray(results) ? results : [];
    };

    const buildResult = (r) => {
      const a = r.address || {};
      const city = a.city || a.town || a.village || a.municipality || a.county || a.suburb || '';
      const roadParts = [a.house_number, a.road || a.pedestrian].filter(Boolean);
      const line1 = roadParts.length > 0
        ? roadParts.join(', ')
        : (r.display_name || '').split(',')[0] || '';
      return {
        latitude:  parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        address: {
          line1,
          line2:   [a.neighbourhood, a.suburb].filter(Boolean).join(', ') || '',
          city,
          state:   a.state   || '',
          pincode: a.postcode || '',
          country: a.country  || 'India',
        },
      };
    };

    try {
      // Attempt 1 — full query
      let results = await nominatimSearch(query);
      if (results.length) return buildResult(results[0]);

      // Attempt 2 — strip line1 (first comma-separated segment)
      const parts = query.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length > 2) {
        const fallback2 = parts.slice(1).join(', ');
        results = await nominatimSearch(fallback2);
        if (results.length) return buildResult(results[0]);
      }

      // Attempt 3 — city + state + country only (last 2-3 segments)
      if (parts.length > 3) {
        // pick city (index 1 after stripping line1) + state + country
        const fallback3 = parts.slice(1, 3).join(', ');
        results = await nominatimSearch(fallback3);
        if (results.length) return buildResult(results[0]);
      }

      logger.warn('Nominatim forward geocoding returned no results for any fallback', { query });
      return null;
    } catch (err) {
      logger.error('Nominatim forward geocoding failed', { error: err.message, query });
      return null;
    }
  },
};

/**
 * Fallback address when Nominatim is unreachable or returns nothing.
 * Returns coordinates so the user can still fill in the form manually.
 */
function buildFallback(latitude, longitude) {
  return {
    configured: false,
    message: 'Reverse geocoding unavailable. Please fill in address details manually.',
    address: {
      line1: '',
      line2: '',
      city:  '',
      state: '',
      pincode: '',
      country: 'India',
      latitude,
      longitude,
    },
  };
}

module.exports = { addressesService };
