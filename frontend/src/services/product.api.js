// src/services/product.api.js
//
// Real API integration — MOCK mode removed.
// All prices from the API are in paise (e.g. ₹68 = 6800 paise).
// normalizeProduct() converts to the shape the UI components expect.

import apiClient from './api';

// ── Normalizer: API shape → UI shape ─────────────────────────
// Keeps UI components working without modification.
export function normalizeProduct(p) {
  if (!p) return p;

  // Calculate inventory status from the new backend inventory inclusion
  let availableStock = 0;
  let totalThreshold = 0;
  
  if (p.inventory && p.inventory.length > 0) {
    // CRITICAL FIX: Do NOT sum inventory across stores!
    // Since we don't have a customer store selector yet, we just take the first store's
    // inventory to reflect realistic single-store availability instead of a global sum.
    const inv = p.inventory[0];
    availableStock = Math.max(0, inv.quantityOnHand - inv.quantityReserved);
    totalThreshold = inv.lowStockThreshold || 5;
  } else {
    // Fallback if inventory relation isn't returned for some reason
    availableStock = p.isActive ? 99 : 0;
  }

  let stockStatus = 'Available';
  if (availableStock === 0) stockStatus = 'Out of Stock';
  else if (availableStock <= totalThreshold) stockStatus = 'Low Stock';

  return {
    ...p,
    // Prices: paise → rupees
    price:         Math.round(p.price / 100),
    originalPrice: p.originalPrice ? Math.round(p.originalPrice / 100) : null,
    // Discount percentage field rename
    discount: p.discountPct ?? 0,
    // Images: first image → `image` (for ProductCard compat), keep `images` array
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80',
    // Rating
    rating: p.avgRating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    // Stock status
    inStock: stockStatus !== 'Out of Stock' && p.isActive !== false,
    stockStatus,
    availableStock,
    // Keep category slug for routing
    category: p.category?.slug || p.categoryId || '',
    categoryName: p.category?.name || '',
    brand: p.brand?.name || p.brandId || '',
  };
}

// ── Category API ─────────────────────────────────────────────
export const categoryAPI = {
  // GET /api/categories
  getCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data?.categories ?? [];
  },

  // GET /api/categories/:id
  getCategoryById: async (id) => {
    const res = await apiClient.get(`/categories/${id}`);
    return res.data?.category ?? null;
  },

  // GET /api/categories/slug/:slug
  getCategoryBySlug: async (slug) => {
    const res = await apiClient.get(`/categories/slug/${slug}`);
    return res.data?.category ?? null;
  },

  // POST /api/categories  (ADMIN only)
  createCategory: async (data) => {
    const res = await apiClient.post('/categories', data);
    return res.data?.category;
  },

  // PATCH /api/categories/:id  (ADMIN only)
  updateCategory: async (id, data) => {
    const res = await apiClient.patch(`/categories/${id}`, data);
    return res.data?.category;
  },

  // PATCH /api/categories/:id/status  (ADMIN only)
  setCategoryStatus: async (id, isActive) => {
    const res = await apiClient.patch(`/categories/${id}/status`, { isActive });
    return res.data?.category;
  },
};

// ── Product API ───────────────────────────────────────────────
export const productAPI = {
  // GET /api/products
  getProducts: async (params = {}) => {
    const res = await apiClient.get('/products', { params });
    const raw = res.data ?? res;
    const products = (raw.products ?? []).map(normalizeProduct);
    return {
      products,
      total:      raw.pagination?.total ?? products.length,
      page:       raw.pagination?.page  ?? 1,
      totalPages: raw.pagination?.totalPages ?? 1,
      pagination: raw.pagination,
    };
  },

  // GET /api/products/:id
  getProduct: async (id) => {
    const res = await apiClient.get(`/products/${id}`);
    const raw = res.data ?? res;
    return normalizeProduct(raw.product);
  },

  // GET /api/products/slug/:slug
  getProductBySlug: async (slug) => {
    const res = await apiClient.get(`/products/slug/${slug}`);
    const raw = res.data ?? res;
    return normalizeProduct(raw.product);
  },

  // GET /api/products/search?q=
  search: async (query, params = {}) => {
    const res = await apiClient.get('/products/search', {
      params: { q: query, ...params },
    });
    const raw = res.data ?? res;
    const products = (raw.products ?? []).map(normalizeProduct);
    return {
      products,
      total:    raw.pagination?.total ?? products.length,
      query:    raw.query ?? query,
      pagination: raw.pagination,
    };
  },

  // GET /api/products/:id/similar
  getSimilar: async (id) => {
    const res = await apiClient.get(`/products/${id}/similar`);
    const raw = res.data ?? res;
    return (raw.products ?? []).map(normalizeProduct);
  },

  // ── Curated sections — map to real API filters ────────────
  // Featured products
  getFeatured: async () => {
    const res = await productAPI.getProducts({ isFeatured: 'true', limit: 10 });
    return res.products;
  },

  // Trending = sorted by review count (popularity proxy)
  getTrending: async () => {
    const res = await productAPI.getProducts({ sort: 'popular', limit: 10 });
    return res.products;
  },

  // Best sellers = highest avg rating
  getBestSellers: async () => {
    const res = await productAPI.getProducts({ sort: 'rating', limit: 10 });
    return res.products;
  },

  // Top deals = highest discount %
  getTopDeals: async () => {
    const res = await productAPI.getProducts({ sort: 'discount', limit: 10 });
    return res.products;
  },

  // Fresh picks = newest products
  getFreshPicks: async () => {
    const res = await productAPI.getProducts({ sort: 'newest', limit: 10 });
    return res.products;
  },

  // By category slug
  getByCategory: async (categorySlug) => {
    const res = await productAPI.getProducts({ categorySlug, limit: 50 });
    return res.products;
  },

  // ── Write operations (ADMIN / STORE_MANAGER) ──────────────
  createProduct: async (data) => {
    const res = await apiClient.post('/products', data);
    return normalizeProduct((res.data ?? res).product);
  },

  updateProduct: async (id, data) => {
    const res = await apiClient.patch(`/products/${id}`, data);
    return normalizeProduct((res.data ?? res).product);
  },

  setProductStatus: async (id, isActive) => {
    const res = await apiClient.patch(`/products/${id}/status`, { isActive });
    return normalizeProduct((res.data ?? res).product);
  },
};
