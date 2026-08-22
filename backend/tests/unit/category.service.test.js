'use strict';

/**
 * tests/unit/category.service.test.js
 *
 * Unit tests for categoryService.
 * The repository is mocked — no database involved.
 */

// ── Mock the repository before importing the service ─────────
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

const { categoryService } = require('../../src/modules/categories/category.service');
const { categoryRepository } = require('../../src/modules/categories/category.repository');

// ── Fixtures ─────────────────────────────────────────────────
const mockCategory = {
  id: 'cat_cuid123',
  name: 'Dairy & Breakfast',
  slug: 'dairy-breakfast',
  description: 'Milk, eggs, and more',
  imageUrl: null,
  isActive: true,
  sortOrder: 0,
  parentId: null,
  parent: null,
  _count: { products: 10 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ── getCategories ─────────────────────────────────────────────
describe('categoryService.getCategories', () => {
  test('returns only active categories for guest users', async () => {
    categoryRepository.findAll.mockResolvedValue([mockCategory]);
    await categoryService.getCategories(undefined);
    expect(categoryRepository.findAll).toHaveBeenCalledWith({ isActive: true });
  });

  test('returns only active categories for CUSTOMER role', async () => {
    categoryRepository.findAll.mockResolvedValue([mockCategory]);
    await categoryService.getCategories({ role: 'CUSTOMER', userId: 'u1' });
    expect(categoryRepository.findAll).toHaveBeenCalledWith({ isActive: true });
  });

  test('returns all categories for ADMIN role', async () => {
    categoryRepository.findAll.mockResolvedValue([mockCategory]);
    await categoryService.getCategories({ role: 'ADMIN', userId: 'u1' });
    expect(categoryRepository.findAll).toHaveBeenCalledWith({ isActive: undefined });
  });

  test('returns all categories for STORE_MANAGER role', async () => {
    categoryRepository.findAll.mockResolvedValue([mockCategory]);
    await categoryService.getCategories({ role: 'STORE_MANAGER', userId: 'u1' });
    expect(categoryRepository.findAll).toHaveBeenCalledWith({ isActive: undefined });
  });
});

// ── getCategoryById ────────────────────────────────────────────
describe('categoryService.getCategoryById', () => {
  test('throws NOT_FOUND when category does not exist', async () => {
    categoryRepository.findById.mockResolvedValue(null);
    await expect(categoryService.getCategoryById('bad-id', null)).rejects.toMatchObject({
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  });

  test('throws NOT_FOUND for inactive category when accessed by guest', async () => {
    categoryRepository.findById.mockResolvedValue({ ...mockCategory, isActive: false });
    await expect(categoryService.getCategoryById('cat_cuid123', null)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test('returns inactive category when accessed by ADMIN', async () => {
    const inactiveCategory = { ...mockCategory, isActive: false };
    categoryRepository.findById.mockResolvedValue(inactiveCategory);
    const result = await categoryService.getCategoryById('cat_cuid123', { role: 'ADMIN', userId: 'u1' });
    expect(result.isActive).toBe(false);
  });

  test('returns active category for any user', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    const result = await categoryService.getCategoryById('cat_cuid123', null);
    expect(result.id).toBe('cat_cuid123');
  });
});

// ── createCategory ────────────────────────────────────────────
describe('categoryService.createCategory', () => {
  test('auto-generates slug from name when not provided', async () => {
    categoryRepository.findByName.mockResolvedValue(null);
    categoryRepository.findBySlugRaw.mockResolvedValue(null);
    categoryRepository.create.mockResolvedValue({ ...mockCategory, slug: 'dairy-breakfast' });

    await categoryService.createCategory({ name: 'Dairy & Breakfast' });

    expect(categoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'dairy-breakfast' }),
    );
  });

  test('throws CONFLICT when name already exists', async () => {
    categoryRepository.findByName.mockResolvedValue(mockCategory);
    categoryRepository.findBySlugRaw.mockResolvedValue(null);

    await expect(
      categoryService.createCategory({ name: 'Dairy & Breakfast' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('throws CONFLICT when slug already exists', async () => {
    categoryRepository.findByName.mockResolvedValue(null);
    categoryRepository.findBySlugRaw.mockResolvedValue(mockCategory);

    await expect(
      categoryService.createCategory({ name: 'Dairy & Breakfast', slug: 'dairy-breakfast' }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test('uses provided slug if unique', async () => {
    categoryRepository.findByName.mockResolvedValue(null);
    categoryRepository.findBySlugRaw.mockResolvedValue(null);
    categoryRepository.create.mockResolvedValue({ ...mockCategory, slug: 'custom-slug' });

    await categoryService.createCategory({ name: 'Dairy & Breakfast', slug: 'custom-slug' });

    expect(categoryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'custom-slug' }),
    );
  });

  test('validates parent category exists', async () => {
    categoryRepository.findByName.mockResolvedValue(null);
    categoryRepository.findBySlugRaw.mockResolvedValue(null);
    categoryRepository.findById.mockResolvedValue(null); // parent does not exist

    await expect(
      categoryService.createCategory({ name: 'Milk', parentId: 'nonexistent' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

// ── setCategoryStatus ─────────────────────────────────────────
describe('categoryService.setCategoryStatus', () => {
  test('activates a category', async () => {
    categoryRepository.findById.mockResolvedValue({ ...mockCategory, isActive: false });
    categoryRepository.update.mockResolvedValue({ ...mockCategory, isActive: true });

    const result = await categoryService.setCategoryStatus('cat_cuid123', true);
    expect(result.isActive).toBe(true);
    expect(categoryRepository.update).toHaveBeenCalledWith('cat_cuid123', { isActive: true });
  });

  test('deactivates a category', async () => {
    categoryRepository.findById.mockResolvedValue(mockCategory);
    categoryRepository.update.mockResolvedValue({ ...mockCategory, isActive: false });

    const result = await categoryService.setCategoryStatus('cat_cuid123', false);
    expect(result.isActive).toBe(false);
  });

  test('throws NOT_FOUND for non-existent category', async () => {
    categoryRepository.findById.mockResolvedValue(null);
    await expect(categoryService.setCategoryStatus('bad-id', true)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
