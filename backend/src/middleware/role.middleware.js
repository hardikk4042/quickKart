'use strict';

/**
 * src/middleware/role.middleware.js
 *
 * Role-Based Access Control (RBAC) & Ownership Authorization Middleware.
 *
 * Assumes `authenticate` middleware has already run and populated `req.user`.
 * Returns 401 if req.user is missing (unauthenticated).
 * Returns 403 if req.user.role is not in allowed roles (unauthorized).
 *
 * Never trusts role or userId provided in request body, query, or params.
 */

const AppError = require('../utils/errors');

/**
 * Authorize requests based on allowed user roles.
 *
 * Usage:
 *   router.get('/admin/dashboard', authenticate, authorize('ADMIN'), controller);
 *   router.get('/store/orders', authenticate, authorize('ADMIN', 'STORE_MANAGER'), controller);
 *
 * @param {...(string|string[])} allowedRoles - Roles permitted to access the route
 * @returns {import('express').RequestHandler}
 */
function authorize(...allowedRoles) {
  const roles = allowedRoles.flat();

  return (req, _res, next) => {
    if (!req.user || !req.user.userId) {
      return next(AppError.unauthorized('Authentication required before authorization'));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`));
    }

    return next();
  };
}

/**
 * Resource-level ownership authorization middleware.
 *
 * Verifies that the authenticated user (`req.user.userId`) matches the resource owner,
 * or that the user has an allowed bypass role (e.g. ADMIN).
 *
 * @param {Object} options
 * @param {Function} options.getResourceOwnerId - Async fn (req) => ownerUserId (from trusted DB lookup)
 * @param {Array<string>} [options.allowBypassRoles=['ADMIN']] - Roles permitted to bypass ownership checks
 * @returns {import('express').RequestHandler}
 */
function authorizeOwnership({ getResourceOwnerId, allowBypassRoles = ['ADMIN'] }) {
  return async (req, _res, next) => {
    try {
      if (!req.user || !req.user.userId) {
        return next(AppError.unauthorized('Authentication required'));
      }

      // Privileged roles (e.g., ADMIN) can bypass ownership checks if allowed by policy
      if (allowBypassRoles && allowBypassRoles.includes(req.user.role)) {
        return next();
      }

      const ownerId = await getResourceOwnerId(req);

      if (!ownerId) {
        return next(AppError.notFound('Requested resource not found'));
      }

      // Strict equality check between authenticated user ID and resource owner ID
      if (req.user.userId !== ownerId) {
        return next(AppError.forbidden('You do not have permission to access this resource'));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { authorize, authorizeOwnership };
