'use strict';

/**
 * src/modules/categories/category.validation.js
 *
 * Zod schemas for Category API request validation.
 */

const { z } = require('zod');

// ── Slug helper ───────────────────────────────────────────────
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(slugRegex, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(), // auto-generated from name if omitted
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  parentId: z.string().cuid('Invalid parent category ID').optional().nullable(),
  isActive: z.boolean().optional(),
});

const updateCategorySchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    slug: z
      .string()
      .min(2)
      .max(100)
      .regex(slugRegex, 'Slug must be lowercase letters, numbers, and hyphens only')
      .optional(),
    description: z.string().max(500).optional().nullable(),
    imageUrl: z.string().url('Invalid image URL').optional().nullable(),
    sortOrder: z.number().int().min(0).optional(),
    parentId: z.string().cuid('Invalid parent category ID').optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

const setCategoryStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive is required' }),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  setCategoryStatusSchema,
};
