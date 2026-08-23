import apiClient from './api';

export const inventoryAPI = {
  // Store Manager / Admin APIs
  getStoreInventory: async (storeId, params = {}) => {
    const res = await apiClient.get(`/inventory/store/${storeId}`, { params });
    return res.data;
  },

  getGlobalInventory: async (params = {}) => {
    const res = await apiClient.get('/inventory', { params });
    return res.data;
  },

  getInventoryById: async (id) => {
    const res = await apiClient.get(`/inventory/${id}`);
    return res.data;
  },

  adjustStock: async (id, data) => {
    const res = await apiClient.patch(`/inventory/${id}/adjust`, data);
    return res.data;
  },
};
