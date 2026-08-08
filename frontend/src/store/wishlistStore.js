// src/store/wishlistStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set({ items: [...get().items, product] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter(i => i.id !== productId) }),

      isInWishlist: (productId) => get().items.some(i => i.id === productId),

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) get().removeItem(product.id);
        else get().addItem(product);
      },

      count: () => get().items.length,
    }),
    { name: 'qk-wishlist' }
  )
);

export default useWishlistStore;
