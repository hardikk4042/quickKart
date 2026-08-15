import api from './api';

const MOCK = false;

// Mock Data
const mockStores = [
  {
    id: 's1',
    name: 'QuickKart Central',
    addressLine: '123 Main Street',
    city: 'New York',
    state: 'NY',
    pincode: '10001',
    latitude: 40.7128,
    longitude: -74.0060,
    isActive: true,
    managerId: null,
    manager: null,
  },
];

export const storeService = {
  getStores: async () => {
    if (MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve({ stores: mockStores }), 500));
    }
    const response = await api.get('/stores');
    return response.data;
  },

  getStoreById: async (id) => {
    if (MOCK) {
      return new Promise((resolve) => {
        const store = mockStores.find((s) => s.id === id);
        setTimeout(() => resolve({ store }), 500);
      });
    }
    const response = await api.get(`/stores/${id}`);
    return response.data;
  },

  createStore: async (data) => {
    if (MOCK) {
      return new Promise((resolve) => {
        const newStore = { ...data, id: `s${Date.now()}` };
        mockStores.push(newStore);
        setTimeout(() => resolve({ store: newStore }), 500);
      });
    }
    const response = await api.post('/stores', data);
    return response.data;
  },

  updateStore: async (id, data) => {
    if (MOCK) {
      return new Promise((resolve) => {
        const index = mockStores.findIndex((s) => s.id === id);
        if (index > -1) {
          mockStores[index] = { ...mockStores[index], ...data };
        }
        setTimeout(() => resolve({ store: mockStores[index] }), 500);
      });
    }
    const response = await api.patch(`/stores/${id}`, data);
    return response.data;
  },

  deleteStore: async (id) => {
    if (MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500));
    }
    const response = await api.delete(`/stores/${id}`);
    return response.data;
  }
};
