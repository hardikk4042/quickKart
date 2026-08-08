// src/hooks/useCart.js
import useCartStore from '@store/cartStore';
import toast from 'react-hot-toast';

export const useCart = () => {
  const store = useCartStore();

  const addToCart = (product) => {
    store.addItem(product);
    toast.success(`${product.name} added to cart`, {
      duration: 1500,
      style: { fontSize: '13px' },
    });
  };

  const removeFromCart = (product) => {
    store.removeItem(product.id);
    toast(`${product.name} removed`, { duration: 1500, icon: '🗑️', style: { fontSize: '13px' } });
  };

  const updateQty = (productId, qty) => store.updateQuantity(productId, qty);

  return {
    items:          store.items,
    itemCount:      store.itemCount(),
    subtotal:       store.subtotal(),
    deliveryFee:    store.deliveryFee(),
    total:          store.total(),
    coupon:         store.coupon,
    couponDiscount: store.couponDiscount,
    isFreeDelivery: store.isFreeDelivery,
    isInCart:       store.isInCart,
    getItem:        store.getItem,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart:      store.clearCart,
    applyCoupon:    store.applyCoupon,
    removeCoupon:   store.removeCoupon,
  };
};
