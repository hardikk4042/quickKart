'use strict';

/**
 * src/utils/errors.js
 *
 * Custom operational error class for QuickKart.
 * Provides consistent error shape across the application.
 */

class AppError extends Error {
  /**
   * @param {string} message  - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} [code]   - Machine-readable error code (e.g. 'INVALID_CREDENTIALS')
   * @param {*}      [details] - Optional validation details / field errors
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // distinguishes operational vs programming errors

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// ── Convenience factory functions ────────────────────────────

AppError.badRequest = (message, details = null) =>
  new AppError(message, 400, 'BAD_REQUEST', details);

AppError.unauthorized = (message = 'Unauthorized') =>
  new AppError(message, 401, 'UNAUTHORIZED');

AppError.forbidden = (message = 'Forbidden') =>
  new AppError(message, 403, 'FORBIDDEN');

AppError.notFound = (message = 'Resource not found') =>
  new AppError(message, 404, 'NOT_FOUND');

AppError.conflict = (message) =>
  new AppError(message, 409, 'CONFLICT');

AppError.internal = (message = 'Internal server error') =>
  new AppError(message, 500, 'INTERNAL_ERROR');

module.exports = AppError;
