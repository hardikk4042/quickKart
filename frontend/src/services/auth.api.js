// src/services/auth.api.js
import users from '@data/users.json';

// ── Simulates a small network delay (like a real API) ──────
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

export const authAPI = {
  // Mock login — checks credentials against users.json
  login: async ({ email, password }) => {
    await delay();

    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!found) {
      return Promise.reject({ message: 'Invalid email or password' });
    }

    // Build a safe user object (never expose password)
    const { password: _pw, ...safeUser } = found;
    const token = `mock-token-${safeUser.id}-${Date.now()}`;

    return { user: safeUser, token };
  },

  // Mock register — just echoes back a user object
  register: async (data) => {
    await delay();
    const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) {
      return Promise.reject({ message: 'An account with this email already exists' });
    }
    const newUser = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'customer',
      avatar: data.name?.[0]?.toUpperCase() || 'U',
      phone: data.phone || '',
    };
    const token = `mock-token-${newUser.id}`;
    return { user: newUser, token };
  },

  // Mock logout
  logout: async () => {
    await delay(100);
    return { success: true };
  },

  // Mock getMe — reads from localStorage
  getMe: async () => {
    await delay(100);
    const raw = localStorage.getItem('qk_user');
    if (!raw) return Promise.reject({ message: 'Not authenticated' });
    return JSON.parse(raw);
  },
};

// Finalized authentication logic
