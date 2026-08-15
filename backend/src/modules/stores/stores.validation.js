'use strict';

const { z } = require('zod');

const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  addressLine: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(5, 'Pincode must be at least 5 characters'),
  latitude: z.number({ required_error: 'Latitude is required', invalid_type_error: 'Latitude must be a number' }),
  longitude: z.number({ required_error: 'Longitude is required', invalid_type_error: 'Longitude must be a number' }),
  isActive: z.boolean().optional(),
  managerId: z.string().cuid('Invalid manager ID format').optional().nullable(),
});

const updateStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').optional(),
  addressLine: z.string().min(5, 'Address is too short').optional(),
  city: z.string().min(2, 'City is required').optional(),
  state: z.string().min(2, 'State is required').optional(),
  pincode: z.string().min(5, 'Pincode must be at least 5 characters').optional(),
  latitude: z.number({ invalid_type_error: 'Latitude must be a number' }).optional(),
  longitude: z.number({ invalid_type_error: 'Longitude must be a number' }).optional(),
  isActive: z.boolean().optional(),
  managerId: z.string().cuid('Invalid manager ID format').optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

module.exports = {
  createStoreSchema,
  updateStoreSchema,
};
