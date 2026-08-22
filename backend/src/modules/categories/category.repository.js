'use strict';

/**
 * src/modules/categories/category.repository.js
 *
 * Database access layer for Category.
 * All Prisma queries live here — no business logic.
 */

const prisma = require('../../config/database');

// Fields always included when returning a category
const categorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isActive: true,
  sortOrder: true,
  parentId: true,
  parent: {
    select: { id: true, name: true, slug: true },
  },
  _count: {
    select: { products: true },
  },
  createdAt: true,
  updatedAt: true,
};

const categoryRepository = {
  /**
   * List categories.
   * @param {object} opts
   * @param {boolean|undefined} opts.isActive  - filter by active status (undefined = all)
   * @param {string|undefined}  opts.parentId  - filter by parent (null = top-level only)
   */
  async findAll({ isActive, parentId } = {}) {
    const where = {};
    if (isActive !== undefined) where.isActive = isActive;
    if (parentId !== undefined) where.parentId = parentId;

    return prisma.category.findMany({
      where,
      select: categorySelect,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async findById(id) {
    return prisma.category.findUnique({
      where: { id },
      select: {
        ...categorySelect,
        children: {
          select: { id: true, name: true, slug: true, isActive: true, imageUrl: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  async findBySlug(slug) {
    return prisma.category.findUnique({
      where: { slug },
      select: {
        ...categorySelect,
        children: {
          select: { id: true, name: true, slug: true, isActive: true, imageUrl: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  },

  async findByName(name) {
    return prisma.category.findUnique({ where: { name } });
  },

  async findBySlugRaw(slug) {
    return prisma.category.findUnique({ where: { slug } });
  },

  async create(data) {
    return prisma.category.create({
      data,
      select: categorySelect,
    });
  },

  async update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
      select: categorySelect,
    });
  },

  async countProducts(id) {
    return prisma.product.count({ where: { categoryId: id } });
  },
};

module.exports = { categoryRepository };
