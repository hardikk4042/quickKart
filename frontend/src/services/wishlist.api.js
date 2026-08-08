// src/services/wishlist.api.js
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

export const wishlistAPI = {
  getWishlist:    async ()       => { await delay(); return []; },
  addToWishlist:  async (id)     => { await delay(); return { success: true, productId: id }; },
  removeFromWishlist: async (id) => { await delay(); return { success: true, productId: id }; },
};
