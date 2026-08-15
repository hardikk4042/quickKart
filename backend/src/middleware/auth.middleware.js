'use strict';

/**
 * src/middleware/auth.middleware.js
 *
 * JWT Authentication Middleware.
 *
 * Reads the Authorization: Bearer <token> header.
 * Verifies the JWT using JWT_SECRET from env.
 * Attaches { userId, role } to req.user on success.
 * Returns 401 on missing / invalid / expired tokens.
 *
 * Does NOT perform role-based authorization.
 * Authorization is a separate phase.
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/errors');

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * On success: populates req.user = { userId, role }
 * On failure: calls next(AppError.unauthorized(...))
 *
 * @type {import('express').RequestHandler}
 */
function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Authentication token is required'));
    }

    const token = authHeader.slice(7); // strip "Bearer "

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(AppError.unauthorized('Authentication token has expired'));
      }
      return next(AppError.unauthorized('Invalid authentication token'));
    }

    if (!payload.userId) {
      return next(AppError.unauthorized('Invalid token payload'));
    }

    // Attach verified identity to request — controllers use this
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { authenticate };
