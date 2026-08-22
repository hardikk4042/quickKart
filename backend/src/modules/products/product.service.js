'use strict';

/**
 * src/modules/products/product.service.js
 *
 * Business logic for the Product catalog.
 *
 * RBAC enforced here (never trust frontend-supplied IDs):
 *
 *   ADMIN:
 *     - Read all products (incl. inactive)
 *     - Create / update any product
 *     - Activate / deactivate any product
 *
 *   STORE_MANAGER:
 *     - Read all active products (same as public)
 *     - Create products ONLY for their assigned store
 *       (storeId is required; verified via Store.managerId = user.userId)
 *       An Inventory entry is atomically created linking the product to the store.
 *     - Update / deactivate products ONLY if an Inventory entry exists for their store
 *       (checked via DB, never trusting frontend-supplied storeId)
 *     - CANNOT create/update global categories
 *
 *   CUSTOMER / unauthenticated:
 *     - Read active products only
 *     - Cannot create / update / delete anything
 */

const { productRepository } = require('./product.repository');
const { categoryRepository } = require('../categories/category.repository');
const AppError = require('../../utils/errors');
const logger = require('../../utils/logger');

// ── Slug generator ────────────────────────────────────────────
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Pagination meta helper ────────────────────────────────────
function paginationMeta(total, page, limit) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

// ── Store ownership resolver ──────────────────────────────────
/**
 * Resolve the store assigned to a STORE_MANAGER from the database.
 * Source of truth: Store.managerId — NEVER trusts a frontend-supplied storeId.
 * Throws if the manager has no assigned store.
 */
async function resolveManagerStore(userId) {
  const store = await productRepository.findStoreByManagerId(userId);
  if (!store) {
    throw AppError.forbidden(
      'You are not assigned to any store. Contact an admin to assign you to a store before managing products.',
    );
  }
  if (!store.isActive) {
    throw AppError.forbidden('Your assigned store is currently inactive.');
  }
  return store;
}

/**
 * Verify a STORE_MANAGER has ownership of a product via their store's Inventory.
 * Throws 403 if the product is NOT in their store's inventory.
 * Throws 403 if the manager has no assigned store.
 */
async function assertManagerOwnsProduct(userId, productId) {
  const store = await resolveManagerStore(userId);
  const inventoryEntry = await productRepository.findInventoryByStoreAndProduct(store.id, productId);
  if (!inventoryEntry) {
    throw AppError.forbidden(
      'You can only manage products that belong to your assigned store.',
    );
  }
  return store;
}

// ── Product service ───────────────────────────────────────────
const productService = {
  /**
   * List products with filtering and pagination.
   * Customers / guests see only active products.
   * ADMIN and STORE_MANAGER see all (can filter isActive themselves).
   */
  async getProducts(query, user) {
    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');

    if (!isPrivileged) {
      query.isActive = true;
    }

    const { page = 1, limit = 20 } = query;
    const { products, total } = await productRepository.findMany(query);

    return {
      products,
      pagination: paginationMeta(total, page, limit),
    };
  },

  /**
   * Get a single product by ID.
   * Customers can only see active products.
   */
  async getProductById(id, user) {
    const product = await productRepository.findById(id);
    if (!product) throw AppError.notFound('Product not found');

    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');
    if (!isPrivileged && !product.isActive) {
      throw AppError.notFound('Product not found');
    }

    return product;
  },

  /**
   * Get a single product by slug.
   */
  async getProductBySlug(slug, user) {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw AppError.notFound('Product not found');

    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');
    if (!isPrivileged && !product.isActive) {
      throw AppError.notFound('Product not found');
    }

    return product;
  },

  /**
   * Search products (name, description, tags, brand).
   * Customers see active products only.
   */
  async searchProducts(query, user) {
    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');
    const { q, page = 1, limit = 20, sort } = query;

    const isActive = isPrivileged ? undefined : true;
    const { products, total } = await productRepository.search({ q, isActive, sort, page, limit });

    return {
      products,
      query: q,
      pagination: paginationMeta(total, page, limit),
    };
  },

  /**
   * Get similar products (same category, excluding current product).
   */
  async getSimilarProducts(id, user) {
    const product = await productRepository.findById(id);
    if (!product) throw AppError.notFound('Product not found');

    const isPrivileged = user && (user.role === 'ADMIN' || user.role === 'STORE_MANAGER');
    if (!isPrivileged && !product.isActive) {
      throw AppError.notFound('Product not found');
    }

    return productRepository.findSimilar(id, product.categoryId);
  },

  /**
   * Create a new product.
   *
   * ADMIN:
   *   - Can create any product globally (storeId optional, ignored if supplied)
   *
   * STORE_MANAGER:
   *   - Must supply storeId in the request body
   *   - storeId is CROSS-CHECKED against Store.managerId = user.userId (never trusted from frontend)
   *   - If the supplied storeId does not match the manager's assigned store → 403
   *   - After product creation, an Inventory entry is atomically created (qty = 0)
   *     to establish ownership for future update/deactivate checks
   *
   * CUSTOMER / unauthenticated → 403
   */
  async createProduct(data, user) {
    if (!user) throw AppError.unauthorized('Authentication required');
    if (user.role !== 'ADMIN' && user.role !== 'STORE_MANAGER') {
      throw AppError.forbidden('Only admins and store managers can create products');
    }

    // ── Role-specific store verification ─────────────────────
    let assignedStore = null;
    if (user.role === 'STORE_MANAGER') {
      // Always resolve from DB — never trust frontend storeId
      assignedStore = await resolveManagerStore(user.userId);

      // If frontend supplied a storeId, verify it matches their actual store
      if (data.storeId && data.storeId !== assignedStore.id) {
        throw AppError.forbidden(
          'You can only create products for your assigned store.',
        );
      }
    }

    // ── Category validation ───────────────────────────────────
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) throw AppError.badRequest('Category does not exist');
    if (!category.isActive) throw AppError.badRequest('Cannot add product to an inactive category');

    // ── Slug generation with deduplication ───────────────────
    const baseSlug = data.slug || generateSlug(data.name);
    let slug = baseSlug;
    let suffix = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await productRepository.findBySlugRaw(slug);
      if (!existing) break;
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    // ── Create product ────────────────────────────────────────
    const product = await productRepository.create({
      name: data.name,
      slug,
      description: data.description ?? null,
      categoryId: data.categoryId,
      brandId: data.brandId ?? null,
      price: data.price,
      originalPrice: data.originalPrice ?? null,
      discountPct: data.discountPct ?? 0,
      weight: data.weight ?? null,
      unit: data.unit ?? null,
      images: data.images ?? [],
      tags: data.tags ?? [],
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
    });

    // ── STORE_MANAGER: link product to their store via Inventory ─
    if (user.role === 'STORE_MANAGER' && assignedStore) {
      await productRepository.createInventoryEntry(assignedStore.id, product.id);
      logger.info('Inventory entry created for store-manager product', {
        productId: product.id,
        storeId: assignedStore.id,
        userId: user.userId,
      });
    }

    logger.info('Product created', { productId: product.id, slug: product.slug, role: user.role, userId: user.userId });
    return product;
  },

  /**
   * Update an existing product.
   *
   * ADMIN: can update any product.
   *
   * STORE_MANAGER:
   *   - Can only update products that have an Inventory entry for their assigned store.
   *   - Ownership is checked via DB (Store.managerId → Inventory) — not frontend.
   *   - Cannot change isActive via this endpoint (use setProductStatus instead).
   *
   * CUSTOMER / unauthenticated → 403
   */
  async updateProduct(id, data, user) {
    if (!user) throw AppError.unauthorized('Authentication required');
    if (user.role !== 'ADMIN' && user.role !== 'STORE_MANAGER') {
      throw AppError.forbidden('Only admins and store managers can update products');
    }

    // ── Fetch existing product first ──────────────────────────
    const existing = await productRepository.findById(id);
    if (!existing) throw AppError.notFound('Product not found');

    // ── STORE_MANAGER: verify ownership via DB ────────────────
    if (user.role === 'STORE_MANAGER') {
      await assertManagerOwnsProduct(user.userId, id);
    }

    // ── Validate new category if being changed ────────────────
    if (data.categoryId && data.categoryId !== existing.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) throw AppError.badRequest('Category does not exist');
      if (!category.isActive) throw AppError.badRequest('Cannot move product to an inactive category');
    }

    // ── Validate slug uniqueness if being changed ─────────────
    if (data.slug && data.slug !== existing.slug) {
      const conflict = await productRepository.findBySlugRaw(data.slug);
      if (conflict && conflict.id !== id) {
        throw AppError.conflict(`Slug "${data.slug}" is already in use`);
      }
    }

    // Strip storeId from update payload — it's not a product field
    const { storeId: _storeId, ...updateData } = data;

    const updated = await productRepository.update(id, updateData);
    logger.info('Product updated', { productId: id, role: user.role, userId: user.userId });
    return updated;
  },

  /**
   * Activate or deactivate a product.
   *
   * ADMIN: can activate/deactivate any product.
   *
   * STORE_MANAGER:
   *   - Can only toggle status of products in their store's Inventory.
   *   - Ownership verified via DB.
   *
   * CUSTOMER / unauthenticated → 403
   */
  async setProductStatus(id, isActive, user) {
    if (!user) throw AppError.unauthorized('Authentication required');

    if (user.role === 'ADMIN') {
      // ADMIN: unrestricted
      const existing = await productRepository.findById(id);
      if (!existing) throw AppError.notFound('Product not found');
      const updated = await productRepository.update(id, { isActive });
      logger.info(`Product ${isActive ? 'activated' : 'deactivated'} by ADMIN`, { productId: id, userId: user.userId });
      return updated;
    }

    if (user.role === 'STORE_MANAGER') {
      // STORE_MANAGER: ownership check before status change
      const existing = await productRepository.findById(id);
      if (!existing) throw AppError.notFound('Product not found');

      await assertManagerOwnsProduct(user.userId, id);

      const updated = await productRepository.update(id, { isActive });
      logger.info(`Product ${isActive ? 'activated' : 'deactivated'} by STORE_MANAGER`, { productId: id, userId: user.userId });
      return updated;
    }

    throw AppError.forbidden('Only admins and store managers can change product status');
  },
};

module.exports = { productService };
