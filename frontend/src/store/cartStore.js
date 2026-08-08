// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DELIVERY_FEE = 20;
const FREE_DELIVERY_THRESHOLD = 399;

const useCartStore = create(
  persist(
    (set, get) => ({
      items:           [],
      coupon:          null,
      couponDiscount:  0,
      isFreeDelivery:  false,

      // ── Computed ──────────────────────────────────
      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal:  () => get().items.reduce((acc, i) => acc + i.price * i.quantity, 0),
      deliveryFee: () => {
        if (get().isFreeDelivery) return 0;
        return get().subtotal() >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
      },
      total: () => Math.max(0, get().subtotal() - get().couponDiscount + get().deliveryFee()),

      // ── Actions ───────────────────────────────────
      addItem: (product) => {
        const items = get().items;
        const existing = items.find(i => i.id === product.id);
        if (existing) {
          set({ items: items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => set({ items: get().items.filter(i => i.id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set({ items: get().items.map(i => i.id === productId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], coupon: null, couponDiscount: 0, isFreeDelivery: false }),

      applyCoupon: (coupon, discountAmount, isFreeDelivery) =>
        set({ coupon, couponDiscount: discountAmount, isFreeDelivery }),

      removeCoupon: () =>
        set({ coupon: null, couponDiscount: 0, isFreeDelivery: false }),

      getItem: (productId) => get().items.find(i => i.id === productId),

      isInCart: (productId) => get().items.some(i => i.id === productId),
    }),
    {
      name: 'qk-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon, couponDiscount: state.couponDiscount, isFreeDelivery: state.isFreeDelivery }),
    }
  )
);

export default useCartStore;
