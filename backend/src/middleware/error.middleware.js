'use strict';

/**
 * src/middleware/error.middleware.js
 *
 * Global Express error handler.
 * Must be the LAST middleware registered in app.js.
 *
 * Handles:
 *  - AppError (operational errors)
 *  - Zod validation errors (from validation middleware)
 *  - Prisma known request errors
 *  - Unhandled programming errors (log but don't expose internals)
 */

const { sendError } = require('../utils/response');
const AppError = require('../utils/errors');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, _next) {
  // 1. Operational errors we threw intentionally
  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // 2. Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] ?? 'field';
    return sendError(res, `A record with this ${field} already exists.`, 409, 'CONFLICT');
  }

  // 3. Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'Record not found.', 404, 'NOT_FOUND');
  }

  // 4. Programming / unexpected errors — log fully, return generic message
  logger.error('Unhandled server error', {
    path: req.path,
    method: req.method,
    errorName: err.name,
    errorMessage: err.message,
    // Stack trace logged server-side only, never sent to client
    stack: err.stack,
  });

  return sendError(res, 'An unexpected error occurred. Please try again later.', 500, 'INTERNAL_ERROR');
}

module.exports = errorMiddleware;
