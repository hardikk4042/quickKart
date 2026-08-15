// src/services/user.api.js
import apiClient from './api';

export const userAPI = {
  // GET /api/users/me
  getMe: async () => {
    const res = await apiClient.get('/users/me');
    return res.data.user;
  },

  // PATCH /api/users/me
  updateMe: async (updates) => {
    const res = await apiClient.patch('/users/me', updates);
    return res.data.user;
  },
};
