'use strict';

/**
 * src/modules/auth/auth.validation.js
 *
 * Zod schemas for authentication request validation.
 * Schemas are strict — unknown keys are stripped, not passed through.
 */

const { z } = require('zod');

// ── Register ─────────────────────────────────────────────────

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .max(255, 'Email is too long'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),

  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Please provide a valid phone number')
    .optional(),
});

// ── Login ────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

module.exports = { registerSchema, loginSchema };
