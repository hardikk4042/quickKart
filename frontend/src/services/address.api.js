// src/services/address.api.js
import apiClient from './api';

export const addressAPI = {
  // GET /api/addresses
  getAddresses: async () => {
    const res = await apiClient.get('/addresses');
    return res.data.addresses;
  },

  // GET /api/addresses/:id
  getAddressById: async (id) => {
    const res = await apiClient.get(`/addresses/${id}`);
    return res.data.address;
  },

  // POST /api/addresses
  createAddress: async (data) => {
    const res = await apiClient.post('/addresses', data);
    return res.data.address;
  },

  // PATCH /api/addresses/:id
  updateAddress: async (id, data) => {
    const res = await apiClient.patch(`/addresses/${id}`, data);
    return res.data.address;
  },

  // DELETE /api/addresses/:id
  deleteAddress: async (id) => {
    const res = await apiClient.delete(`/addresses/${id}`);
    return res;
  },

  // PATCH /api/addresses/:id/default
  setDefaultAddress: async (id) => {
    const res = await apiClient.patch(`/addresses/${id}/default`);
    return res.data.address;
  },

  // POST /api/addresses/reverse-geocode
  reverseGeocode: async (latitude, longitude) => {
    const res = await apiClient.post('/addresses/reverse-geocode', { latitude, longitude });
    return res.data;
  },

  // POST /api/addresses/forward-geocode
  forwardGeocode: async (query) => {
    const res = await apiClient.post('/addresses/forward-geocode', { query });
    return res.data.result;
  },
};
