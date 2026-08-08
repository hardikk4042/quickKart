// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Tag, CheckCircle, ChevronRight, Home, Briefcase, Plus } from 'lucide-react';
import { useCart } from '@hooks/useCart';
import { orderAPI } from '@services/order.api';
import { paymentAPI } from '@services/payment.api';
import useLocationStore from '@store/locationStore';
import useAuthStore from '@store/authStore';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Address',  icon: MapPin },
  { id: 2, label: 'Payment',  icon: CreditCard },
  { id: 3, label: 'Review',   icon: CheckCircle },
];

const PAYMENT_METHODS = [
  { id: 'upi',  label: 'UPI',               icon: '📱', sub: 'GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', sub: 'Visa, Mastercard, RuPay' },
  { id: 'cod',  label: 'Cash on Delivery',   icon: '💵', sub: 'Pay when order arrives' },
  { id: 'wallet', label: 'Wallet',           icon: '👛', sub: 'QuickKart Wallet' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, couponDiscount, total, coupon, isFreeDelivery, clearCart } = useCart();
  const { addresses, selectedAddress, setSelectedAddress } = useLocationStore();
  const { isLoggedIn } = useAuthStore();
  const [step, setStep]              = useState(1);
  const [payMethod, setPayMethod]    = useState('upi');
  const [upiId, setUpiId]           = useState('');
  const [placing, setPlacing]        = useState(false);

  if (!isLoggedIn) {
    navigate('/login?redirect=/checkout');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const placeOrder = async () => {
    setPlacing(true);
    try {
      // 1. Process payment (mock)
      const payment = await paymentAPI.createPayment({ orderId: 'temp', method: payMethod, amount: total });

      // 2. Create order
      const order = await orderAPI.createOrder({
        items,
        address: selectedAddress,
        pricing: { subtotal, deliveryFee, discount: couponDiscount, tax: Math.round(total * 0.05), total },
        coupon,
        payment: { method: payMethod, transactionId: payment.transactionId, status: 'paid' },
      });

      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmed/${order.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                           ${step >= s.id ? 'text-dark-900' : 'text-dark-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all
                             ${step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-brand-500 text-dark-900' : 'bg-dark-100 text-dark-400'}`}>
              {step > s.id ? '✓' : s.id}
            </div>
            <span className="font-semibold text-sm hidden sm:block">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-0.5 transition-all ${step > s.id ? 'bg-green-500' : 'bg-dark-100'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-dark-900 mb-2">Checkout</h1>
      <p className="text-sm text-dark-400 mb-6">Complete your order in a few simple steps</p>

      <StepIndicator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main step content */}
        <div className="lg:col-span-2">
          {/* Step 1 — Address */}
          {step === 1 && (
            <div className="bg-white rounded-3xl shadow-card p-6 animate-fade-in">
              <h2 className="font-bold text-dark-900 text-lg mb-5 flex items-center gap-2">
                <MapPin size={20} className="text-brand-500" /> Delivery Address
              </h2>
              <div className="space-y-3 mb-5">
                {addresses.map(addr => {
                  const isSelected = selectedAddress?.id === addr.id;
                  const Icon = addr.label === 'Home' ? Home : Briefcase;
                  return (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all
                                  ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-dark-100 hover:border-brand-300'}`}
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 ${isSelected ? 'bg-brand-500' : 'bg-dark-100'}`}>
                        <Icon size={16} className={isSelected ? 'text-dark-900' : 'text-dark-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-dark-900">{addr.label}</span>
                          {addr.isDefault && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">Default</span>}
                        </div>
                        <p className="text-xs text-dark-500">{addr.name} · {addr.phone}</p>
                        <p className="text-xs text-dark-400 mt-0.5">{addr.house}, {addr.street}, {addr.city} - {addr.pincode}</p>
                      </div>
                      {isSelected && <CheckCircle size={18} className="text-brand-500 flex-shrink-0" />}
                    </button>
                  );
                })}
                <button className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-dark-200 hover:border-brand-400 text-dark-500 hover:text-dark-900 transition-all text-sm font-medium">
                  <Plus size={16} /> Add New Address
                </button>
              </div>
              <button onClick={() => setStep(2)} disabled={!selectedAddress} className="btn-primary w-full py-3 text-base disabled:opacity-50">
                Continue to Payment <ChevronRight size={16} className="inline" />
              </button>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="bg-white rounded-3xl shadow-card p-6 animate-fade-in">
              <h2 className="font-bold text-dark-900 text-lg mb-5 flex items-center gap-2">
                <CreditCard size={20} className="text-brand-500" /> Payment Method
              </h2>
              <div className="space-y-3 mb-5">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => setPayMethod(pm.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
                                ${payMethod === pm.id ? 'border-brand-500 bg-brand-50' : 'border-dark-100 hover:border-brand-300'}`}
                  >
                    <span className="text-2xl">{pm.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-dark-900">{pm.label}</p>
                      <p className="text-xs text-dark-400">{pm.sub}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 transition-all flex-shrink-0
                                     ${payMethod === pm.id ? 'border-brand-500 bg-brand-500' : 'border-dark-300'}`}>
                      {payMethod === pm.id && <div className="w-full h-full rounded-full bg-dark-900 scale-50" />}
                    </div>
                  </button>
                ))}
              </div>
              {payMethod === 'upi' && (
                <div className="mb-5">
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. name@upi)" className="input" />
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={() => setStep(3)} className="btn-primary flex-1 py-3">
                  Review Order <ChevronRight size={16} className="inline" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Review */}
          {step === 3 && (
            <div className="bg-white rounded-3xl shadow-card p-6 space-y-5 animate-fade-in">
              <h2 className="font-bold text-dark-900 text-lg flex items-center gap-2">
                <CheckCircle size={20} className="text-brand-500" /> Order Review
              </h2>

              {/* Items */}
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-3">Items ({items.length})</p>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <p className="text-sm text-dark-700 flex-1 truncate">{item.name}</p>
                      <span className="text-sm font-semibold">×{item.quantity}</span>
                      <span className="text-sm font-bold text-dark-900 w-16 text-right">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="pt-4 border-t border-dark-50">
                <p className="text-sm font-semibold text-dark-700 mb-1">Delivery to</p>
                <p className="text-sm text-dark-500">{selectedAddress?.house}, {selectedAddress?.street}, {selectedAddress?.city} - {selectedAddress?.pincode}</p>
              </div>

              {/* Payment */}
              <div className="pt-4 border-t border-dark-50">
                <p className="text-sm font-semibold text-dark-700 mb-1">Payment via</p>
                <p className="text-sm text-dark-500">{PAYMENT_METHODS.find(p => p.id === payMethod)?.label}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                <button onClick={placeOrder} disabled={placing} className="btn-primary flex-1 py-3 text-base">
                  {placing ? (
                    <span className="flex items-center gap-2 justify-center">
                      <span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                      Placing...
                    </span>
                  ) : `Place Order · ₹${total}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary sidebar */}
        <div className="bg-white rounded-3xl shadow-card p-5 h-fit sticky top-20">
          <h3 className="font-bold text-dark-900 mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            {items.slice(0, 3).map(i => (
              <div key={i.id} className="flex justify-between text-dark-600">
                <span className="truncate mr-2">{i.name} ×{i.quantity}</span>
                <span className="flex-shrink-0">₹{i.price * i.quantity}</span>
              </div>
            ))}
            {items.length > 3 && <p className="text-xs text-dark-400">+{items.length - 3} more items</p>}
          </div>
          <div className="space-y-2 pt-3 border-t border-dark-100 text-sm">
            <div className="flex justify-between text-dark-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-dark-600"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-₹{couponDiscount}</span></div>}
            <div className="flex justify-between font-bold text-dark-900 text-base pt-2 border-t border-dark-100">
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-green-50 rounded-xl px-3 py-2">
            <span className="text-green-500">⚡</span>
            <span className="text-xs text-green-700 font-medium">Delivery in 15–25 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
