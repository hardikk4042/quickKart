import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, MapPin, ArrowRight } from 'lucide-react';
import { orderAPI } from '@services/order.api';
import confetti from 'canvas-confetti';

function fireConfetti() {
  const end = Date.now() + 2000;
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#F6C90E', '#22C55E', '#3B82F6'] });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#F6C90E', '#22C55E', '#3B82F6'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Order Confirmed — QuickKart';
    fireConfetti();
    orderAPI.getOrder(id).then(setOrder).catch(() => navigate('/orders'));
  }, [id]);

  if (!order) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-12 pb-24 text-center">
      {/* Success icon */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
        <CheckCircle size={48} className="text-green-500" />
      </div>

      <h1 className="text-3xl font-extrabold text-dark-900 mb-2">Order Confirmed! 🎉</h1>
      <p className="text-dark-500 mb-2">Your order has been placed successfully.</p>
      <div className="inline-block bg-dark-100 text-dark-600 font-mono font-bold text-sm px-4 py-2 rounded-xl mb-8">
        #{order.id}
      </div>

      {/* Delivery time */}
      <div className="bg-green-50 border border-green-200 rounded-3xl p-6 mb-6 animate-slide-up">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-4xl">⚡</span>
          <div className="text-left">
            <p className="text-xs text-green-600 font-medium">Estimated Delivery</p>
            <p className="text-2xl font-extrabold text-green-700">{order.estimatedDelivery}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-green-600">
          <MapPin size={14} />
          <span>{order.address?.label} · {order.address?.line?.split(',')[0]}</span>
        </div>
      </div>

      {/* Order items preview */}
      <div className="bg-white rounded-3xl shadow-card p-5 mb-6 text-left">
        <p className="text-sm font-semibold text-dark-700 mb-3 flex items-center gap-2">
          <Package size={16} /> {order.items?.length} Items ordered
        </p>
        <div className="space-y-2">
          {order.items?.slice(0, 3).map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
              <p className="text-sm text-dark-700 flex-1 truncate">{item.name}</p>
              <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
            </div>
          ))}
          {order.items?.length > 3 && (
            <p className="text-xs text-dark-400 text-center">+{order.items.length - 3} more</p>
          )}
        </div>
        <div className="flex justify-between font-bold text-dark-900 text-sm border-t border-dark-100 pt-3 mt-3">
          <span>Total paid</span>
          <span>₹{order.pricing?.total}</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <Link to={`/track/${order.id}`} className="btn-primary py-3.5 text-base flex items-center justify-center gap-2">
          Track Your Order <ArrowRight size={18} />
        </Link>
        <Link to="/" className="btn-secondary py-3 text-center">Continue Shopping</Link>
      </div>
    </div>
  );
}
