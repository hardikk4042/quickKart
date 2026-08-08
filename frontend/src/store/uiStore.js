// src/store/uiStore.js
import { create } from 'zustand';

const useUiStore = create((set) => ({
  // Modals
  locationPickerOpen: false,
  setLocationPickerOpen: (v) => set({ locationPickerOpen: v }),

  searchOpen: false,
  setSearchOpen: (v) => set({ searchOpen: v }),

  // Mobile menu
  mobileMenuOpen: false,
  setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),

  // Global loading
  globalLoading: false,
  setGlobalLoading: (v) => set({ globalLoading: v }),
}));

export default useUiStore;
