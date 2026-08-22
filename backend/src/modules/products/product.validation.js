'use strict';

/**
 * src/modules/products/product.validation.js
 *
 * Zod schemas for Product API request validation.
 */

const { z } = require('zod');

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// ── Create product ────────────────────────────────────────────
const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(slugRegex, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(), // auto-generated from name if not supplied

  description: z.string().max(2000).optional().nullable(),

  categoryId: z.string().cuid('Invalid category ID'),

  brandId: z.string().cuid('Invalid brand ID').optional().nullable(),

  // Required when the caller is a STORE_MANAGER — identifies which store this product is added to.
  // Validated in the service layer against the manager's assigned store.
  // ADMIN may omit it (product added to global catalog without a store assignment).
  storeId: z.string().cuid('Invalid store ID').optional().nullable(),

  // Prices stored in paise (e.g. ₹68 = 6800)
  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .int('Price must be a whole number (paise)')
    .min(1, 'Price must be at least 1 paise'),

  originalPrice: z
    .number({ invalid_type_error: 'Original price must be a number' })
    .int('Original price must be a whole number (paise)')
    .min(0)
    .optional()
    .nullable(),

  discountPct: z.number().int().min(0).max(100).optional(),

  weight: z.string().max(50).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),

  images: z.array(z.string().url('Each image must be a valid URL')).max(10).optional(),

  tags: z.array(z.string().max(50)).max(20).optional(),

  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// ── Update product ────────────────────────────────────────────
const updateProductSchema = z
  .object({
    name: z.string().min(2).max(200).optional(),
    slug: z.string().min(2).max(200).regex(slugRegex).optional(),
    description: z.string().max(2000).optional().nullable(),
    categoryId: z.string().cuid('Invalid category ID').optional(),
    brandId: z.string().cuid('Invalid brand ID').optional().nullable(),
    price: z.number().int().min(1).optional(),
    originalPrice: z.number().int().min(0).optional().nullable(),
    discountPct: z.number().int().min(0).max(100).optional(),
    weight: z.string().max(50).optional().nullable(),
    unit: z.string().max(20).optional().nullable(),
    images: z.array(z.string().url()).max(10).optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// ── Product status ────────────────────────────────────────────
const setProductStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive is required' }),
});

// ── List / search query params ────────────────────────────────
const listProductsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => v > 0, 'page must be a positive integer'),

  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .refine((v) => v >= 1 && v <= 500, 'limit must be between 1 and 500'),

  categoryId: z.string().cuid().optional(),
  categorySlug: z.string().optional(),
  brandId: z.string().cuid().optional(),
  isActive: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return undefined;
    }),
  isFeatured: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return undefined;
    }),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'rating', 'discount', 'popular'])
    .optional(),
  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .refine((v) => v > 0, 'page must be a positive integer'),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .refine((v) => v >= 1 && v <= 100, 'limit must be between 1 and 100'),
  sort: z
    .enum(['relevance', 'price_asc', 'price_desc', 'rating', 'discount'])
    .optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  setProductStatusSchema,
  listProductsQuerySchema,
  searchQuerySchema,
};
