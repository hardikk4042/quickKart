'use strict';

/**
 * src/modules/categories/category.service.js
 *
 * Business logic for Category.
 * Handles slug generation, active-only filtering, parent validation.
 */

const { categoryRepository } = require('./category.repository');
const AppError = require('../../utils/errors');
const logger = require('../../utils/logger');

// ── Slug generator ────────────────────────────────────────────
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, '-')     // replace spaces/underscores with hyphens
    .replace(/-+/g, '-')         // collapse multiple hyphens
    .replace(/^-|-$/g, '');      // trim leading/trailing hyphens
}

const categoryService = {
  /**
   * List categories.
   * Customers see only active categories.
   * Admin/STORE_MANAGER see all.
   * @param {object} user  - req.user (may be undefined for public requests)
   */
  async getCategories(user) {
    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');
    const isActive = isPrivileged ? undefined : true;
    const categories = await categoryRepository.findAll({ isActive });
    return categories;
  },

  /**
   * Get a single category by ID (public).
   * Customers can only see active categories.
   */
  async getCategoryById(id, user) {
    const category = await categoryRepository.findById(id);
    if (!category) throw AppError.notFound('Category not found');

    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');
    if (!isPrivileged && !category.isActive) {
      throw AppError.notFound('Category not found');
    }

    return category;
  },

  /**
   * Get a single category by slug (used by frontend routing).
   */
  async getCategoryBySlug(slug, user) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw AppError.notFound('Category not found');

    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');
    if (!isPrivileged && !category.isActive) {
      throw AppError.notFound('Category not found');
    }

    return category;
  },

  /**
   * Create a new category. ADMIN only.
   */
  async createCategory(data) {
    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name);

    // Uniqueness checks
    const [nameConflict, slugConflict] = await Promise.all([
      categoryRepository.findByName(data.name),
      categoryRepository.findBySlugRaw(slug),
    ]);

    if (nameConflict) throw AppError.conflict('A category with this name already exists');
    if (slugConflict) throw AppError.conflict(`Slug "${slug}" is already in use. Provide a different slug.`);

    // Validate parent if provided
    if (data.parentId) {
      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) throw AppError.badRequest('Parent category does not exist');
      if (!parent.isActive) throw AppError.badRequest('Parent category is not active');
    }

    const category = await categoryRepository.create({
      name: data.name,
      slug,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      sortOrder: data.sortOrder ?? 0,
      parentId: data.parentId ?? null,
      isActive: data.isActive ?? true,
    });

    logger.info('Category created', { categoryId: category.id, slug: category.slug });
    return category;
  },

  /**
   * Update an existing category. ADMIN only.
   */
  async updateCategory(id, data) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw AppError.notFound('Category not found');

    // If name is changing, check uniqueness
    if (data.name && data.name !== existing.name) {
      const nameConflict = await categoryRepository.findByName(data.name);
      if (nameConflict && nameConflict.id !== id) {
        throw AppError.conflict('A category with this name already exists');
      }
    }

    // If slug is changing, check uniqueness
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await categoryRepository.findBySlugRaw(data.slug);
      if (slugConflict && slugConflict.id !== id) {
        throw AppError.conflict(`Slug "${data.slug}" is already in use`);
      }
    }

    // Validate parent if provided — prevent circular references
    if (data.parentId !== undefined && data.parentId !== null) {
      if (data.parentId === id) throw AppError.badRequest('A category cannot be its own parent');
      const parent = await categoryRepository.findById(data.parentId);
      if (!parent) throw AppError.badRequest('Parent category does not exist');
    }

    const updated = await categoryRepository.update(id, data);
    logger.info('Category updated', { categoryId: id });
    return updated;
  },

  /**
   * Activate or deactivate a category. ADMIN only.
   */
  async setCategoryStatus(id, isActive) {
    const existing = await categoryRepository.findById(id);
    if (!existing) throw AppError.notFound('Category not found');

    const updated = await categoryRepository.update(id, { isActive });
    logger.info(`Category ${isActive ? 'activated' : 'deactivated'}`, { categoryId: id });
    return updated;
  },
};

module.exports = { categoryService };
