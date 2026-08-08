// src/data/coupons.js
export const coupons = [
  {
    code: 'WELCOME50',
    description: '₹50 off on your first order',
    discount: 50,
    type: 'flat',        // flat | percent
    minOrder: 199,
    maxDiscount: 50,
    expiry: '2026-12-31',
    isActive: true,
  },
  {
    code: 'SAVE100',
    description: '₹100 off on orders above ₹500',
    discount: 100,
    type: 'flat',
    minOrder: 500,
    maxDiscount: 100,
    expiry: '2026-09-30',
    isActive: true,
  },
  {
    code: 'FREESHIP',
    description: 'Free delivery on this order',
    discount: 0,
    type: 'free_delivery',
    minOrder: 99,
    maxDiscount: 40,
    expiry: '2026-12-31',
    isActive: true,
  },
  {
    code: 'SAVE20',
    description: '20% off up to ₹150',
    discount: 20,
    type: 'percent',
    minOrder: 299,
    maxDiscount: 150,
    expiry: '2026-10-31',
    isActive: true,
  },
];

export const validateCoupon = (code, cartTotal) => {
  const coupon = coupons.find(c => c.code === code.toUpperCase() && c.isActive);
  if (!coupon) return { valid: false, message: 'Invalid or expired coupon code' };
  if (cartTotal < coupon.minOrder) return { valid: false, message: `Minimum order of ₹${coupon.minOrder} required` };

  let discountAmount = 0;
  if (coupon.type === 'flat')         discountAmount = coupon.discount;
  else if (coupon.type === 'percent') discountAmount = Math.min(cartTotal * coupon.discount / 100, coupon.maxDiscount);
  else if (coupon.type === 'free_delivery') discountAmount = 0; // handled separately

  return { valid: true, coupon, discountAmount, isFreeDelivery: coupon.type === 'free_delivery' };
};
