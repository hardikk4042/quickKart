// src/services/auth.api.js
import apiClient from './api';

export const authAPI = {
  // POST /api/auth/login
  login: async ({ email, password }) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data; // { user, token }
  },

  // POST /api/auth/register
  register: async (data) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data; // { user }
  },

  // POST /api/auth/logout
  logout: async () => {
    return { success: true };
  },

  // GET /api/users/me
  getMe: async () => {
    const res = await apiClient.get('/users/me');
    return res.data.user;
  },
};
