'use strict';

/**
 * src/middleware/validation.middleware.js
 *
 * Reusable Zod validation runner.
 * Usage:
 *   router.post('/register', validate(registerSchema), controller.register);
 *
 * Validates req.body against the provided Zod schema.
 * Passes a clean 400 error to next() on failure.
 */

const { z } = require('zod');
const AppError = require('../utils/errors');

/**
 * @param {z.ZodSchema} schema  - Zod schema to validate against
 * @param {string} source - 'body' | 'query' | 'params'
 * @returns {import('express').RequestHandler}
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(AppError.badRequest('Validation failed', details));
    }

    // Replace the source with the parsed/coerced Zod output (strips unknown keys)
    req[source] = result.data;
    return next();
  };
}

module.exports = { validate };
