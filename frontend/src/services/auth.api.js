// src/services/auth.api.js
import apiClient from './api';
import { mockUser } from '@data/notifications';

const MOCK = true; // toggle when backend is ready

export const authAPI = {
  // POST /api/auth/login
  login: async ({ email, password }) => {
    if (MOCK) {
      await new Promise(r => setTimeout(r, 800));
      if (email === 'hardik@quickkart.com' && password === 'password123') {
        const token = 'mock_jwt_token_' + Date.now();
        return { user: mockUser, token };
      }
      // Admin
      if (email === 'admin@quickkart.com' && password === 'admin123') {
        const token = 'mock_admin_token_' + Date.now();
        return { user: { ...mockUser, role: 'admin', name: 'Admin' }, token };
      }
      // Store manager
      if (email === 'store@quickkart.com' && password === 'store123') {
        const token = 'mock_store_token_' + Date.now();
        return { user: { ...mockUser, role: 'store_manager', name: 'Store Manager' }, token };
      }
      // Delivery partner
      if (email === 'delivery@quickkart.com' && password === 'delivery123') {
        const token = 'mock_delivery_token_' + Date.now();
        return { user: { ...mockUser, role: 'delivery_partner', name: 'Rahul Kumar' }, token };
      }
      throw { message: 'Invalid email or password' };
    }
    return apiClient.post('/auth/login', { email, password });
  },

  // POST /api/auth/register
  register: async (data) => {
    if (MOCK) {
      await new Promise(r => setTimeout(r, 1000));
      const token = 'mock_jwt_token_' + Date.now();
      return { user: { ...mockUser, name: data.name, email: data.email, phone: data.phone }, token };
    }
    return apiClient.post('/auth/register', data);
  },

  // POST /api/auth/logout
  logout: async () => {
    if (MOCK) { await new Promise(r => setTimeout(r, 300)); return { success: true }; }
    return apiClient.post('/auth/logout');
  },

  // GET /api/auth/me
  getMe: async () => {
    if (MOCK) { await new Promise(r => setTimeout(r, 400)); return mockUser; }
    return apiClient.get('/auth/me');
  },
};
