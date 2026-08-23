'use strict';

/**
 * src/modules/products/product.repository.js
 *
 * Database access layer for Product.
 * All Prisma queries live here — no business logic.
 */

const prisma = require('../../config/database');

// Standard product select — always include category + brand
const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  categoryId: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  brandId: true,
  brand: {
    select: { id: true, name: true, slug: true },
  },
  price: true,
  originalPrice: true,
  discountPct: true,
  weight: true,
  unit: true,
  images: true,
  tags: true,
  inventory: {
    select: {
      quantityOnHand: true,
      quantityReserved: true,
      lowStockThreshold: true,
    }
  },
  isActive: true,
  isFeatured: true,
  avgRating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Build ORDER BY clause from sort string.
 */
function buildOrderBy(sort) {
  switch (sort) {
    case 'price_asc':    return [{ price: 'asc' }];
    case 'price_desc':   return [{ price: 'desc' }];
    case 'rating':       return [{ avgRating: 'desc' }];
    case 'discount':     return [{ discountPct: 'desc' }];
    case 'popular':      return [{ reviewCount: 'desc' }];
    case 'newest':
    default:             return [{ createdAt: 'desc' }];
  }
}

const productRepository = {
  /**
   * List products with filters and pagination.
   * @returns {{ products, total }}
   */
  async findMany({
    isActive,
    categoryId,
    categorySlug,
    brandId,
    isFeatured,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 20,
  } = {}) {
    const where = {};

    if (isActive !== undefined) where.isActive = isActive;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (brandId) where.brandId = brandId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Category filter — by ID or by slug
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    const skip = (page - 1) * limit;
    const orderBy = buildOrderBy(sort);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: productSelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  },

  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });
  },

  async findBySlug(slug) {
    return prisma.product.findUnique({
      where: { slug },
      select: productSelect,
    });
  },

  async findBySlugRaw(slug) {
    return prisma.product.findUnique({ where: { slug } });
  },

  /**
   * Full-text search on name, description, tags.
   * Uses Prisma contains (case-insensitive) for DB-level search.
   */
  async search({ q, isActive, sort, page = 1, limit = 20 }) {
    const searchMode = 'insensitive';
    const where = {
      OR: [
        { name: { contains: q, mode: searchMode } },
        { description: { contains: q, mode: searchMode } },
        { tags: { has: q.toLowerCase() } },
        // Brand name search via relation filter
        { brand: { name: { contains: q, mode: searchMode } } },
      ],
    };

    if (isActive !== undefined) where.isActive = isActive;

    const skip = (page - 1) * limit;
    const orderBy = sort && sort !== 'relevance' ? buildOrderBy(sort) : [{ reviewCount: 'desc' }, { avgRating: 'desc' }];

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        select: productSelect,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  },

  /**
   * Find products in the same category (for "similar products" on detail page).
   */
  async findSimilar(productId, categoryId, limit = 6) {
    return prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
        id: { not: productId },
      },
      select: productSelect,
      orderBy: [{ avgRating: 'desc' }],
      take: limit,
    });
  },

  async create(data) {
    return prisma.product.create({
      data,
      select: productSelect,
    });
  },

  async update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
      select: productSelect,
    });
  },

  // ── Store-Manager ownership helpers ──────────────────────────

  /**
   * Look up the store assigned to a STORE_MANAGER by their userId.
   * Source of truth: Store.managerId column — never trust frontend.
   */
  async findStoreByManagerId(managerId) {
    return prisma.store.findUnique({
      where: { managerId },
      select: { id: true, name: true, isActive: true },
    });
  },

  /**
   * Check whether a given product has an Inventory entry for a given store.
   * Used to verify STORE_MANAGER ownership before update/status operations.
   */
  async findInventoryByStoreAndProduct(storeId, productId) {
    return prisma.inventory.findUnique({
      where: { storeId_productId: { storeId, productId } },
      select: { id: true, storeId: true, productId: true },
    });
  },

  /**
   * Create an Inventory entry linking a store to a product (quantity = 0 initially).
   * Called atomically after product creation by a STORE_MANAGER.
   */
  async createInventoryEntry(storeId, productId) {
    return prisma.inventory.create({
      data: {
        storeId,
        productId,
        quantityOnHand: 0,
        quantityReserved: 0,
      },
      select: { id: true, storeId: true, productId: true },
    });
  },
};

module.exports = { productRepository };
