// src/services/api.js
import axios from 'axios';

import useAuthStore from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor (attach token) ──────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qk_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor (handle errors) ────────────
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('qk_token');
      localStorage.removeItem('qk_user');
      useAuthStore.getState().clearUser();
    }
    const errData = error.response?.data;
    const detailMsg = errData?.error?.details?.[0]?.message || errData?.message || 'Something went wrong';
    return Promise.reject({ ...errData, message: detailMsg });
  }
);

export default apiClient;
