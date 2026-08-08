// src/services/coupon.api.js
import { validateCoupon, coupons } from '@data/coupons';
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

export const couponAPI = {
  validate:     async (code, total) => { await delay(); return validateCoupon(code, total); },
  getAvailable: async ()            => { await delay(300); return coupons.filter(c => c.isActive); },
};
