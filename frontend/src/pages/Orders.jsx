// src/pages/Orders.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, RotateCcw } from 'lucide-react';
import { orderAPI } from '@services/order.api';
import { OrderCardSkeleton } from '@components/common/SkeletonLoader';
import EmptyState from '@components/common/EmptyState';
import { formatDate, statusLabel, statusColor } from '@utils/format';
import { useCart } from '@hooks/useCart';
import toast from 'react-hot-toast';

const TABS = ['All', 'Active', 'Delivered', 'Cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('All');
  const { addToCart } = useCart();

  useEffect(() => {
    document.title = 'My Orders — QuickKart';
    orderAPI.getOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (tab === 'Active')    return ['confirmed', 'packing', 'ready', 'out_for_delivery'].includes(o.status);
    if (tab === 'Delivered') return o.status === 'delivered';
    if (tab === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const handleReorder = (order) => {
    order.items.forEach(item => addToCart(item));
    toast.success('Items added to cart!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">My Orders</h1>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`chip flex-shrink-0 ${tab === t ? 'chip-active' : 'chip-inactive'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? <OrderCardSkeleton count={3} /> : filtered.length === 0 ? (
        <EmptyState
          type="orders"
          title="No orders here"
          subtitle={tab === 'All' ? "You haven't placed any orders yet." : `No ${tab.toLowerCase()} orders.`}
          actionHref="/"
          actionLabel="Start Shopping"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const isActive = ['confirmed', 'packing', 'ready', 'out_for_delivery'].includes(order.status);
            return (
              <div key={order.id} className="bg-white rounded-3xl shadow-card p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-dark-900">#{order.id}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="font-bold text-dark-900">₹{order.pricing?.total}</span>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    {order.items?.slice(0, 3).map(item => (
                      <img key={item.id} src={item.image} alt="" className="w-10 h-10 rounded-lg border-2 border-white object-cover" />
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-10 h-10 rounded-lg border-2 border-white bg-dark-100 flex items-center justify-center text-xs font-bold text-dark-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-dark-500 ml-2">
                    {order.items?.[0]?.name}
                    {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {isActive && (
                    <Link to={`/track/${order.id}`}
                      className="flex-1 btn-primary py-2 text-sm text-center flex items-center justify-center gap-1.5">
                      <Package size={14} /> Track Order
                    </Link>
                  )}
                  <Link to={`/orders/${order.id}`}
                    className="flex-1 btn-secondary py-2 text-sm text-center flex items-center justify-center gap-1">
                    View Details <ChevronRight size={14} />
                  </Link>
                  {!isActive && (
                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-dark-200 hover:border-brand-400 text-dark-600 text-sm font-medium rounded-xl transition-colors"
                    >
                      <RotateCcw size={14} /> Reorder
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
