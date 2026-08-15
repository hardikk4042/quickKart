'use strict';

/**
 * src/modules/users/users.validation.js
 *
 * Zod validation schemas for User profile management.
 * Strictly prevents updating privileged fields (role, passwordHash, email, id).
 */

const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Please provide a valid phone number')
    .optional()
    .nullable(),

  avatarUrl: z
    .string()
    .trim()
    .url('Please provide a valid URL for avatar')
    .optional()
    .nullable(),
});

module.exports = { updateProfileSchema };
