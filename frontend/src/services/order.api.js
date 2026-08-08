// src/services/order.api.js
import apiClient from './api';
import { mockOrders } from '@data/orders';

const MOCK = true;
const delay = (ms = 600) => new Promise(r => setTimeout(r, ms));

let _orders = [...mockOrders];

export const orderAPI = {
  // POST /api/orders
  createOrder: async (payload) => {
    if (MOCK) {
      await delay(1200);
      const id = 'QK' + (10294 + Math.floor(Math.random() * 100));
      const order = {
        id,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        estimatedDelivery: '15–20 minutes',
        ...payload,
        pricing: { ...payload.pricing },
        timeline: [
          { status: 'Order Confirmed', time: new Date().toISOString(), done: true },
          { status: 'Store is packing', done: false },
          { status: 'Ready for pickup', done: false },
          { status: 'Out for delivery', done: false },
          { status: 'Delivered',        done: false },
        ],
        delivery: { partner: null },
      };
      _orders.unshift(order);
      return order;
    }
    return apiClient.post('/orders', payload);
  },

  // GET /api/orders
  getOrders: async () => {
    if (MOCK) { await delay(500); return _orders; }
    return apiClient.get('/orders');
  },

  // GET /api/orders/:id
  getOrder: async (id) => {
    if (MOCK) {
      await delay(400);
      const order = _orders.find(o => o.id === id);
      if (!order) throw { message: 'Order not found' };
      return order;
    }
    return apiClient.get(`/orders/${id}`);
  },

  // POST /api/orders/:id/cancel
  cancelOrder: async (id) => {
    if (MOCK) {
      await delay(800);
      _orders = _orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o);
      return { success: true };
    }
    return apiClient.post(`/orders/${id}/cancel`);
  },

  // GET /api/orders/:id/track  (polling endpoint; socket replaces this in prod)
  trackOrder: async (id) => {
    if (MOCK) {
      await delay(300);
      return _orders.find(o => o.id === id);
    }
    return apiClient.get(`/orders/${id}/track`);
  },
};
