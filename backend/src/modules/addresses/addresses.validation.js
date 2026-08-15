'use strict';

/**
 * src/modules/addresses/addresses.validation.js
 *
 * Zod validation schemas for Address management and Geocoding.
 */

const { z } = require('zod');

const createAddressSchema = z.object({
  label: z
    .string({ required_error: 'Address label is required' })
    .trim()
    .min(1, 'Label cannot be empty')
    .max(50, 'Label is too long'),

  line1: z
    .string({ required_error: 'Address line 1 is required' })
    .trim()
    .min(3, 'Address line 1 must be at least 3 characters')
    .max(255, 'Address line 1 is too long'),

  line2: z
    .string()
    .trim()
    .max(255, 'Address line 2 is too long')
    .optional()
    .nullable(),

  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City is required')
    .max(100, 'City is too long'),

  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State is required')
    .max(100, 'State is too long'),

  pincode: z
    .string({ required_error: 'Postal pincode is required' })
    .trim()
    .regex(/^[\d\s\-]{3,10}$/, 'Please provide a valid postal pincode'),

  country: z
    .string()
    .trim()
    .default('India'),

  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional()
    .nullable(),

  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional()
    .nullable(),

  isDefault: z
    .boolean()
    .optional()
    .default(false),
});

const updateAddressSchema = createAddressSchema.partial();

const reverseGeocodeSchema = z.object({
  latitude: z
    .number({ required_error: 'Latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),

  longitude: z
    .number({ required_error: 'Longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

const forwardGeocodeSchema = z.object({
  query: z
    .string({ required_error: 'Address query is required' })
    .trim()
    .min(3, 'Query must be at least 3 characters')
    .max(500, 'Query is too long'),
});

module.exports = {
  createAddressSchema,
  updateAddressSchema,
  reverseGeocodeSchema,
  forwardGeocodeSchema,
};
