// src/pages/Cart.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Tag, ChevronRight, AlertCircle, Plus, Minus, Heart } from 'lucide-react';
import { useCart } from '@hooks/useCart';
import useWishlistStore from '@store/wishlistStore';
import { couponAPI } from '@services/coupon.api';
import EmptyState from '@components/common/EmptyState';
import toast from 'react-hot-toast';

function CartItem({ item, onIncrease, onDecrease, onRemove, onSaveLater }) {
  return (
    <div className="flex gap-3 py-4 border-b border-dark-50 last:border-0">
      <Link to={`/product/${item.id}`} className="flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-dark-50" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${item.id}`}>
          <h3 className="text-sm font-semibold text-dark-900 line-clamp-2">{item.name}</h3>
        </Link>
        <p className="text-xs text-dark-400 mb-2">{item.weight}</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-dark-900">₹{item.price * item.quantity}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-dark-200 rounded-lg">
              <button onClick={onDecrease} className="p-1.5 hover:bg-dark-50 rounded-l-lg transition-colors">
                <Minus size={12} />
              </button>
              <span className="text-sm font-semibold px-2">{item.quantity}</span>
              <button onClick={onIncrease} className="p-1.5 hover:bg-dark-50 rounded-r-lg transition-colors">
                <Plus size={12} />
              </button>
            </div>
            <button onClick={onRemove} className="p-1.5 text-dark-300 hover:text-error transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <button onClick={onSaveLater} className="flex items-center gap-1 text-xs text-dark-400 hover:text-red-500 mt-1.5 transition-colors">
          <Heart size={12} /> Save for later
        </button>
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, subtotal, deliveryFee, total, coupon, couponDiscount, isFreeDelivery,
          addToCart, updateQty, removeFromCart, clearCart, applyCoupon, removeCoupon } = useCart();
  const wishlistAdd = useWishlistStore.getState().addItem;

  const [couponInput, setCouponInput]     = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const result = await couponAPI.validate(couponInput.trim(), subtotal);
      if (result.valid) {
        applyCoupon(result.coupon.code, result.discountAmount, result.isFreeDelivery);
        toast.success(`Coupon applied! Saved ₹${result.discountAmount || 0}`);
        setCouponInput('');
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSaveLater = (item) => {
    wishlistAdd(item);
    removeFromCart(item);
    toast.success('Moved to wishlist');
  };

  const MINIMUM_ORDER = 99;
  const belowMin = subtotal > 0 && subtotal < MINIMUM_ORDER;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-dark-900 mb-8">Your Cart</h1>
        <EmptyState
          type="cart"
          title="Your cart is empty"
          subtitle="Add some products to get started. We'll deliver in 10–30 minutes!"
          actionHref="/"
          actionLabel="Start Shopping"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Warning */}
          {belowMin && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 font-medium">
                Add items worth ₹{MINIMUM_ORDER - subtotal} more to place an order (minimum ₹{MINIMUM_ORDER})
              </p>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-card p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-dark-900">{items.length} Items</h2>
              <button onClick={clearCart} className="text-xs text-dark-400 hover:text-error transition-colors">Clear all</button>
            </div>
            {items.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onIncrease={() => updateQty(item.id, item.quantity + 1)}
                onDecrease={() => updateQty(item.id, item.quantity - 1)}
                onRemove={() => removeFromCart(item)}
                onSaveLater={() => handleSaveLater(item)}
              />
            ))}
          </div>

          {/* Delivery estimate */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <p className="font-bold text-green-800 text-sm">Estimated Delivery: 15–25 minutes</p>
              <p className="text-xs text-green-600">Our riders will be at your door soon!</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <h3 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-brand-500" /> Apply Coupon
            </h3>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                <div>
                  <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-md">{coupon}</span>
                  <p className="text-xs text-green-600 mt-0.5">
                    {isFreeDelivery ? 'Free delivery applied' : `₹${couponDiscount} discount applied`}
                  </p>
                </div>
                <button onClick={removeCoupon} className="text-dark-400 hover:text-error">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Enter coupon code"
                  className="input flex-1 text-xs uppercase"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput}
                  className="btn-primary text-xs px-4 disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            )}
            {/* Quick picks */}
            {!coupon && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {['WELCOME50', 'FREESHIP', 'SAVE20'].map(c => (
                  <button
                    key={c}
                    onClick={() => setCouponInput(c)}
                    className="text-xs border border-dashed border-brand-400 text-brand-600 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors font-medium"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <h3 className="font-bold text-dark-900 mb-4">Price Details</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-dark-600">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-dark-100 font-bold text-dark-900 text-base">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              {couponDiscount > 0 && (
                <p className="text-xs text-green-600 font-medium">🎉 You're saving ₹{couponDiscount} on this order!</p>
              )}
            </div>
          </div>

          <Link
            to="/checkout"
            className={`btn-primary w-full py-3.5 text-center text-base flex items-center justify-center gap-2
                        ${belowMin ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Proceed to Checkout <ChevronRight size={18} />
          </Link>

          {belowMin && (
            <p className="text-xs text-dark-400 text-center">Add ₹{MINIMUM_ORDER - subtotal} more to checkout</p>
          )}
        </div>
      </div>
    </div>
  );
}
