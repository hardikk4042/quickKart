// src/pages/OrderTracking.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Circle, Phone, Star, ArrowLeft, MapPin } from 'lucide-react';
import { orderAPI } from '@services/order.api';
import { useSocket } from '@hooks/useSocket';
import { formatTime } from '@utils/format';

const STATUS_STEPS = ['confirmed', 'packing', 'ready', 'out_for_delivery', 'delivered'];

const STEP_LABELS = {
  confirmed:        'Order Confirmed',
  packing:          'Store is packing',
  ready:            'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  delivered:        'Delivered',
};

const STEP_EMOJIS = {
  confirmed:        '✅',
  packing:          '📦',
  ready:            '🏪',
  out_for_delivery: '🛵',
  delivered:        '🏠',
};

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(null);

  useEffect(() => {
    document.title = `Tracking Order #${id} — QuickKart`;
    orderAPI.getOrder(id)
      .then(o => { setOrder(o); setCurrentStatus(o.status); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Socket stub — updates status in real-time (demo: progresses automatically)
  useSocket(id, ({ status }) => {
    setCurrentStatus(status);
    setOrder(prev => prev ? { ...prev, status } : prev);
  });

  const currentIdx = STATUS_STEPS.indexOf(currentStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-dark-500">Order not found.</p>
        <Link to="/orders" className="btn-primary mt-4 inline-block">My Orders</Link>
      </div>
    );
  }

  const partner = order.delivery?.partner;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      {/* Back */}
      <Link to="/orders" className="flex items-center gap-1.5 text-dark-500 hover:text-dark-900 text-sm font-medium mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      {/* Header */}
      <div className="bg-dark-900 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-dark-400 text-xs font-medium">Order</p>
            <p className="font-mono font-bold text-lg">#{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-dark-400 text-xs">Arriving in</p>
            <p className="font-bold text-brand-400 text-lg">{currentStatus === 'delivered' ? '—' : `${8 - currentIdx * 2} min`}</p>
          </div>
        </div>
        {/* Map placeholder */}
        <div className="bg-dark-700 rounded-2xl h-36 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 20px)' }}
          />
          <div className="text-center z-10">
            <span className="text-4xl">🗺️</span>
            <p className="text-dark-400 text-xs mt-2">Live map (available with backend)</p>
          </div>
          {/* Rider pin */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center text-xl shadow-brand animate-bounce">
              🛵
            </div>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
        <h2 className="font-bold text-dark-900 mb-6">Order Status</h2>
        <div className="space-y-0">
          {STATUS_STEPS.map((status, i) => {
            const isDone   = i <= currentIdx;
            const isCurrent = i === currentIdx;
            const step = order.timeline?.[i];
            return (
              <div key={status} className="flex gap-4">
                {/* Line + dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0 transition-all
                                   ${isDone ? 'bg-green-500' : isCurrent ? 'bg-brand-500 animate-pulse-brand' : 'bg-dark-100'}`}>
                    {isDone ? '✓' : STEP_EMOJIS[status]}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`w-0.5 h-10 my-1 transition-all ${isDone ? 'bg-green-500' : 'bg-dark-100'}`} />
                  )}
                </div>
                {/* Label */}
                <div className="pb-10 pt-1">
                  <p className={`font-semibold text-sm ${isDone ? 'text-dark-900' : 'text-dark-400'}`}>
                    {STEP_LABELS[status]}
                  </p>
                  {step?.time && (
                    <p className="text-xs text-dark-400">{formatTime(step.time)}</p>
                  )}
                  {isCurrent && (
                    <span className="inline-block text-xs bg-brand-100 text-brand-700 font-semibold px-2 py-0.5 rounded-full mt-1">
                      Current status
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery partner */}
      {partner && currentStatus === 'out_for_delivery' && (
        <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
          <h2 className="font-bold text-dark-900 mb-4">Delivery Partner</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-2xl">
              {partner.image ? (
                <img src={partner.image} alt={partner.name} className="w-full h-full rounded-2xl object-cover" />
              ) : '👤'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-dark-900">{partner.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={12} className="text-brand-500 fill-brand-500" />
                <span className="text-xs font-medium text-dark-600">{partner.rating}</span>
                <span className="text-xs text-dark-400">· {partner.totalDeliveries?.toLocaleString()} deliveries</span>
              </div>
            </div>
            <a
              href={`tel:${partner.phone}`}
              className="p-3 bg-brand-500 rounded-2xl hover:bg-brand-600 transition-colors"
              aria-label="Call delivery partner"
            >
              <Phone size={18} className="text-dark-900" />
            </a>
          </div>
        </div>
      )}

      {/* Delivery address */}
      <div className="bg-white rounded-3xl shadow-card p-6 mb-6">
        <h2 className="font-bold text-dark-900 mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-brand-500" /> Delivering to
        </h2>
        <p className="text-sm font-semibold text-dark-900">{order.address?.label}</p>
        <p className="text-sm text-dark-500">{order.address?.line}</p>
      </div>

      {/* Actions */}
      {currentStatus === 'delivered' ? (
        <Link to={`/review/${order.id}`} className="btn-primary w-full py-3 text-center text-base block">
          Rate Your Experience ⭐
        </Link>
      ) : (
        <Link to="/orders" className="btn-secondary w-full py-3 text-center block">View All Orders</Link>
      )}
    </div>
  );
}
