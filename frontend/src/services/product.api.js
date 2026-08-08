// src/services/product.api.js
import apiClient from './api';
import { products, getByCategory, getTrending, getBestSellers, getTopDeals, getFreshPicks } from '@data/products';

const MOCK = true;
const delay = (ms = 500) => new Promise(r => setTimeout(r, ms));

export const productAPI = {
  // GET /api/products
  getProducts: async (params = {}) => {
    if (MOCK) {
      await delay(400);
      let list = [...products];
      if (params.category) list = list.filter(p => p.category === params.category);
      if (params.inStock)   list = list.filter(p => p.inStock);
      if (params.minPrice)  list = list.filter(p => p.price >= params.minPrice);
      if (params.maxPrice)  list = list.filter(p => p.price <= params.maxPrice);
      if (params.sort === 'price_asc')  list.sort((a, b) => a.price - b.price);
      if (params.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      if (params.sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
      if (params.sort === 'discount')   list.sort((a, b) => b.discount - a.discount);
      const page  = params.page  || 1;
      const limit = params.limit || 20;
      const total = list.length;
      const paginated = list.slice((page - 1) * limit, page * limit);
      return { products: paginated, total, page, totalPages: Math.ceil(total / limit) };
    }
    return apiClient.get('/products', { params });
  },

  // GET /api/products/:id
  getProduct: async (id) => {
    if (MOCK) {
      await delay(300);
      const product = products.find(p => p.id === Number(id));
      if (!product) throw { message: 'Product not found' };
      return product;
    }
    return apiClient.get(`/products/${id}`);
  },

  // GET /api/products/search?q=
  search: async (query, params = {}) => {
    if (MOCK) {
      await delay(400);
      const q = query.toLowerCase();
      let list = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
      if (params.sort === 'price_asc')  list.sort((a, b) => a.price - b.price);
      if (params.sort === 'price_desc') list.sort((a, b) => b.price - a.price);
      if (params.sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
      return { products: list, total: list.length, query };
    }
    return apiClient.get('/products/search', { params: { q: query, ...params } });
  },

  // Curated sections
  getTrending:    async () => { await delay(300); return getTrending(); },
  getBestSellers: async () => { await delay(300); return getBestSellers(); },
  getTopDeals:    async () => { await delay(300); return getTopDeals(); },
  getFreshPicks:  async () => { await delay(300); return getFreshPicks(); },
  getByCategory:  async (slug) => { await delay(400); return getByCategory(slug); },

  // GET /api/products/:id/similar
  getSimilar: async (id) => {
    if (MOCK) {
      await delay(300);
      const product = products.find(p => p.id === Number(id));
      if (!product) return [];
      return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 6);
    }
    return apiClient.get(`/products/${id}/similar`);
  },
};
