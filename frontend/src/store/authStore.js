// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      token:       null,
      isLoggedIn:  false,
      isLoading:   false,

      setUser: (user, token) => set({ user, token, isLoggedIn: true }),
      clearUser: ()          => set({ user: null, token: null, isLoggedIn: false }),

      updateUser: (updates) => set({ user: { ...get().user, ...updates } }),

      isAdmin:           () => get().user?.role === 'admin',
      isStoreManager:    () => get().user?.role === 'store_manager',
      isDeliveryPartner: () => get().user?.role === 'delivery_partner',
      isCustomer:        () => !get().user?.role || get().user?.role === 'customer',
    }),
    {
      name: 'qk-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) localStorage.setItem('qk_token', state.token);
      },
    }
  )
);

export default useAuthStore;

// Finalized authentication logic
