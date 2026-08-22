'use strict';

/**
 * tests/unit/product.service.test.js
 *
 * Unit tests for productService.
 * Repositories are mocked — no database involved.
 */

// ── Mock repositories ─────────────────────────────────────────
jest.mock('../../src/modules/products/product.repository', () => ({
  productRepository: {
    findMany: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findBySlugRaw: jest.fn(),
    findSimilar: jest.fn(),
    search: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findStoreByManagerId: jest.fn(),
    findInventoryByStoreAndProduct: jest.fn(),
    createInventoryEntry: jest.fn(),
  },
}));

jest.mock('../../src/modules/categories/category.repository', () => ({
  categoryRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findByName: jest.fn(),
    findBySlugRaw: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    countProducts: jest.fn(),
  },
}));

const { productService } = require('../../src/modules/products/product.service');
const { productRepository } = require('../../src/modules/products/product.repository');
const { categoryRepository } = require('../../src/modules/categories/category.repository');

// ── Fixtures ─────────────────────────────────────────────────
const mockCategory = {
  id: 'cat_cuid123',
  name: 'Dairy & Breakfast',
  slug: 'dairy-breakfast',
  isActive: true,
  parentId: null,
  parent: null,
  _count: { products: 5 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct = {
  id: 'prod_cuid123',
  name: 'Amul Gold Full Cream Milk',
  slug: 'amul-gold-full-cream-milk',
  description: 'Rich full cream milk',
  categoryId: 'cat_cuid123',
  category: { id: 'cat_cuid123', name: 'Dairy & Breakfast', slug: 'dairy-breakfast' },
  brandId: null,
  brand: null,
  price: 6800, // ₹68 in paise
  originalPrice: 7500,
  discountPct: 9,
  weight: '1 L',
  unit: 'ml',
  images: ['https://example.com/milk.jpg'],
  tags: ['milk', 'dairy'],
  isActive: true,
  isFeatured: false,
  avgRating: 4.7,
  reviewCount: 1240,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const adminUser = { userId: 'user_admin', role: 'ADMIN' };
const storeManagerUser = { userId: 'user_mgr', role: 'STORE_MANAGER' };
const customerUser = { userId: 'user_cust', role: 'CUSTOMER' };

beforeEach(() => {
  jest.clearAllMocks();
});

// ── getProducts ───────────────────────────────────────────────
describe('productService.getProducts', () => {
  test('applies isActive=true for guest users', async () => {
    productRepository.findMany.mockResolvedValue({ products: [mockProduct], total: 1 });
    await productService.getProducts({ page: 1, limit: 20 }, null);
    expect(productRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });

  test('applies isActive=true for CUSTOMER role', async () => {
    productRepository.findMany.mockResolvedValue({ products: [mockProduct], total: 1 });
    await productService.getProducts({ page: 1, limit: 20 }, customerUser);
    expect(productRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });

  test('does not force isActive for ADMIN', async () => {
    productRepository.findMany.mockResolvedValue({ products: [mockProduct], total: 1 });
    await productService.getProducts({ page: 1, limit: 20, isActive: false }, adminUser);
    // ADMIN can list inactive products
    expect(productRepository.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
  });

  test('returns pagination metadata', async () => {
    productRepository.findMany.mockResolvedValue({ products: [mockProduct], total: 50 });
    const result = await productService.getProducts({ page: 2, limit: 10 }, null);
    expect(result.pagination).toMatchObject({
      total: 50,
      page: 2,
      limit: 10,
      totalPages: 5,
      hasNext: true,
      hasPrev: true,
    });
  });
});

// ── getProductById ────────────────────────────────────────────
describe('productService.getProductById', () => {
  test('throws NOT_FOUND for non-existent product', async () => {
    productRepository.findById.mockResolvedValue(null);
    await expect(productService.getProductById('bad-id', null)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('throws NOT_FOUND for inactive product accessed by guest', async () => {
    productRepository.findById.mockResolvedValue({ ...mockProduct, isActive: false });
    await expect(productService.getProductById('prod_cuid123', null)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('returns inactive product for ADMIN', async () => {
    productRepository.findById.mockResolvedValue({ ...mockProduct, isActive: false });
    const result = await productService.getProductById('prod_cuid123', adminUser);
    expect(result.isActive).toBe(false);
  });

  test('returns active product for guest', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    const result = await productService.getProductById('prod_cuid123', null);
    expect(result.id).toBe('prod_cuid123');
  });
});

// ── createProduct ─────────────────────────────────────────────
describe('productService.createProduct', () => {
  test('throws FORBIDDEN for CUSTOMER role', async () => {
    await expect(
      productService.createProduct({ name: 'Test', categoryId: 'cat1', price: 1000 }, customerUser),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('throws UNAUTHORIZED for unauthenticated user', async () => {
    await expect(
      productService.createProduct({ name: 'Test', categoryId: 'cat1', price: 1000 }, null),
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  test('throws BAD_REQUEST when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);
    await expect(
      productService.createProduct({ name: 'Test', categoryId: 'nonexistent', price: 1000 }, adminUser),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('throws BAD_REQUEST when category is inactive', async () => {
    categoryRepository.findById.mockResolvedValue({ ...mockCategory, isActive: false });
    await expect(
      productService.createProduct({ name: 'Test', categoryId: 'cat_cuid123', price: 1000 }, adminUser),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test('ADMIN can create product with valid category', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    productRepository.findBySlugRaw.mockResolvedValue(null);
    productRepository.create.mockResolvedValue(mockProduct);

    const result = await productService.createProduct(
      { name: 'Amul Gold Full Cream Milk', categoryId: 'cat_cuid123', price: 6800 },
      adminUser,
    );

    expect(result.id).toBe('prod_cuid123');
    expect(productRepository.create).toHaveBeenCalledTimes(1);
  });

  test('STORE_MANAGER can create product in their assigned store', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    productRepository.findBySlugRaw.mockResolvedValue(null);
    productRepository.findStoreByManagerId.mockResolvedValue({ id: 'store_1', isActive: true });
    productRepository.create.mockResolvedValue(mockProduct);
    productRepository.createInventoryEntry.mockResolvedValue({ id: 'inv_1' });

    const result = await productService.createProduct(
      { name: 'Amul Gold', categoryId: 'cat_cuid123', price: 6800, storeId: 'store_1' },
      storeManagerUser,
    );

    expect(result).toBeDefined();
    expect(productRepository.createInventoryEntry).toHaveBeenCalledWith('store_1', 'prod_cuid123');
  });

  test('STORE_MANAGER cannot create product for a different store', async () => {
    productRepository.findStoreByManagerId.mockResolvedValue({ id: 'store_1', isActive: true });
    
    await expect(
      productService.createProduct(
        { name: 'Amul Gold', categoryId: 'cat_cuid123', price: 6800, storeId: 'store_2' },
        storeManagerUser,
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('STORE_MANAGER cannot create product if not assigned to a store', async () => {
    productRepository.findStoreByManagerId.mockResolvedValue(null);
    
    await expect(
      productService.createProduct(
        { name: 'Amul Gold', categoryId: 'cat_cuid123', price: 6800, storeId: 'store_1' },
        storeManagerUser,
      ),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('auto-generates unique slug with suffix when slug already exists', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    // First call: slug taken, second call: slug-1 free
    productRepository.findBySlugRaw
      .mockResolvedValueOnce({ id: 'other' })
      .mockResolvedValueOnce(null);
    productRepository.create.mockResolvedValue({ ...mockProduct, slug: 'amul-gold-full-cream-milk-1' });

    await productService.createProduct(
      { name: 'Amul Gold Full Cream Milk', categoryId: 'cat_cuid123', price: 6800 },
      adminUser,
    );

    expect(productRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'amul-gold-full-cream-milk-1' }),
    );
  });
});

// ── updateProduct ─────────────────────────────────────────────
describe('productService.updateProduct', () => {
  test('throws FORBIDDEN for CUSTOMER', async () => {
    await expect(
      productService.updateProduct('prod_cuid123', { name: 'New' }, customerUser),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('throws NOT_FOUND for non-existent product', async () => {
    productRepository.findById.mockResolvedValue(null);
    await expect(
      productService.updateProduct('bad-id', { name: 'New' }, adminUser),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test('ADMIN can update product name', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.update.mockResolvedValue({ ...mockProduct, name: 'New Name' });

    const result = await productService.updateProduct('prod_cuid123', { name: 'New Name' }, adminUser);
    expect(result.name).toBe('New Name');
  });

  test('STORE_MANAGER can update product they own', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.findStoreByManagerId.mockResolvedValue({ id: 'store_1', isActive: true });
    productRepository.findInventoryByStoreAndProduct.mockResolvedValue({ id: 'inv_1' }); // owns product
    productRepository.update.mockResolvedValue({ ...mockProduct, name: 'New Name' });

    const result = await productService.updateProduct('prod_cuid123', { name: 'New Name' }, storeManagerUser);
    expect(result.name).toBe('New Name');
  });

  test('STORE_MANAGER cannot update product they do not own', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.findStoreByManagerId.mockResolvedValue({ id: 'store_1', isActive: true });
    productRepository.findInventoryByStoreAndProduct.mockResolvedValue(null); // doesn't own product

    await expect(
      productService.updateProduct('prod_cuid123', { name: 'New Name' }, storeManagerUser)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('validates new categoryId when changing category', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    categoryRepository.findById.mockResolvedValue(null); // new category doesn't exist

    await expect(
      productService.updateProduct('prod_cuid123', { categoryId: 'nonexistent' }, adminUser),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ── setProductStatus ──────────────────────────────────────────
describe('productService.setProductStatus', () => {
  test('ADMIN can activate/deactivate product', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.update.mockResolvedValue({ ...mockProduct, isActive: false });

    const result = await productService.setProductStatus('prod_cuid123', false, adminUser);
    expect(result.isActive).toBe(false);
  });

  test('STORE_MANAGER can change status of product they own', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.findStoreByManagerId.mockResolvedValue({ id: 'store_1', isActive: true });
    productRepository.findInventoryByStoreAndProduct.mockResolvedValue({ id: 'inv_1' }); // owns product
    productRepository.update.mockResolvedValue({ ...mockProduct, isActive: false });

    const result = await productService.setProductStatus('prod_cuid123', false, storeManagerUser);
    expect(result.isActive).toBe(false);
  });

  test('STORE_MANAGER cannot change status of product they do not own', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    productRepository.findStoreByManagerId.mockResolvedValue({ id: 'store_1', isActive: true });
    productRepository.findInventoryByStoreAndProduct.mockResolvedValue(null); // does not own product

    await expect(
      productService.setProductStatus('prod_cuid123', false, storeManagerUser)
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('throws FORBIDDEN for CUSTOMER', async () => {
    await expect(
      productService.setProductStatus('prod_cuid123', false, customerUser),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test('throws NOT_FOUND for non-existent product', async () => {
    productRepository.findById.mockResolvedValue(null);
    await expect(
      productService.setProductStatus('bad-id', true, adminUser),
    ).rejects.toMatchObject({ statusCode: 404 });
  });
});

// ── searchProducts ────────────────────────────────────────────
describe('productService.searchProducts', () => {
  test('searches with isActive=true for guests', async () => {
    productRepository.search.mockResolvedValue({ products: [mockProduct], total: 1 });
    await productService.searchProducts({ q: 'milk', page: 1, limit: 20 }, null);
    expect(productRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
  });

  test('returns search results with pagination', async () => {
    productRepository.search.mockResolvedValue({ products: [mockProduct], total: 1 });
    const result = await productService.searchProducts({ q: 'milk', page: 1, limit: 20 }, null);
    expect(result.products).toHaveLength(1);
    expect(result.query).toBe('milk');
    expect(result.pagination.total).toBe(1);
  });
});
