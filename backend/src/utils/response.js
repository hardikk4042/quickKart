'use strict';

/**
 * src/utils/response.js
 *
 * Standard API response helpers.
 * All API responses follow this shape:
 *
 *   { success: true,  data: {...},   message: "..." }
 *   { success: false, error: {...},  message: "..." }
 */

/**
 * Send a successful API response.
 * @param {import('express').Response} res
 * @param {*}      data
 * @param {string} [message]
 * @param {number} [statusCode]
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send a successful creation response (201).
 */
function sendCreated(res, data = null, message = 'Created successfully') {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send an error API response.
 * Never exposes stack traces or sensitive info.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode]
 * @param {string} [code]
 * @param {*}      [details]
 */
function sendError(res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
  const body = {
    success: false,
    message,
    error: { code },
  };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendCreated, sendError };
