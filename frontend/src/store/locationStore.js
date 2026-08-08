// src/store/locationStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAddresses } from '@data/notifications';

const useLocationStore = create(
  persist(
    (set, get) => ({
      selectedAddress: mockAddresses[0],
      addresses: mockAddresses,

      setSelectedAddress: (address) => set({ selectedAddress: address }),

      addAddress: (address) => {
        const id = Date.now();
        const newAddr = { ...address, id };
        set({ addresses: [...get().addresses, newAddr] });
        return newAddr;
      },

      updateAddress: (id, updates) =>
        set({ addresses: get().addresses.map(a => a.id === id ? { ...a, ...updates } : a) }),

      deleteAddress: (id) => {
        const updated = get().addresses.filter(a => a.id !== id);
        set({ addresses: updated });
        if (get().selectedAddress?.id === id) {
          set({ selectedAddress: updated[0] || null });
        }
      },

      setDefault: (id) =>
        set({ addresses: get().addresses.map(a => ({ ...a, isDefault: a.id === id })) }),
    }),
    { name: 'qk-location' }
  )
);

export default useLocationStore;
