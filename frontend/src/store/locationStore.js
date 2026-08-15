import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addressAPI } from '@services/address.api';

const useLocationStore = create(
  persist(
    (set, get) => ({
      selectedAddress: null,
      addresses: [],
      isLoading: false,
      error: null,

      setSelectedAddress: (address) => set({ selectedAddress: address }),

      fetchAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
          const list = await addressAPI.getAddresses();
          const defaultAddr = list.find((a) => a.isDefault) || list[0] || null;
          set({
            addresses: list,
            selectedAddress: get().selectedAddress ? (list.find(a => a.id === get().selectedAddress.id) || defaultAddr) : defaultAddr,
            isLoading: false,
          });
          return list;
        } catch (err) {
          set({
            addresses: [],
            selectedAddress: null,
            error: err.message || 'Failed to fetch addresses',
            isLoading: false,
          });
          return [];
        }
      },

      addAddress: async (addressData) => {
        set({ isLoading: true });
        try {
          const created = await addressAPI.createAddress(addressData);
          await get().fetchAddresses();
          set({ isLoading: false });
          return created;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      updateAddress: async (id, updates) => {
        set({ isLoading: true });
        try {
          const updated = await addressAPI.updateAddress(id, updates);
          await get().fetchAddresses();
          set({ isLoading: false });
          return updated;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      deleteAddress: async (id) => {
        set({ isLoading: true });
        try {
          await addressAPI.deleteAddress(id);
          await get().fetchAddresses();
          set({ isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      setDefault: async (id) => {
        set({ isLoading: true });
        try {
          const updated = await addressAPI.setDefaultAddress(id);
          await get().fetchAddresses();
          set({ isLoading: false });
          return updated;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },
    }),
    {
      name: 'qk-location',
      partialize: (state) => ({ selectedAddress: state.selectedAddress }),
    }
  )
);

export default useLocationStore;
