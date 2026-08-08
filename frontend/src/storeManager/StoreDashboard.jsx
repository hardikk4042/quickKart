// src/storeManager/StoreDashboard.jsx
import { useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { mockOrders } from '@data/orders';
import { products } from '@data/products';
import { statusColor, statusLabel, formatDate } from '@utils/format';

const STAT = [
  { label: "Today's Orders",    value: 34,  icon: ShoppingBag,  color: 'bg-blue-50 text-blue-600' },
  { label: 'Pending Orders',    value: 8,   icon: Clock,        color: 'bg-amber-50 text-amber-600' },
  { label: 'Being Packed',      value: 4,   icon: ShoppingBag,  color: 'bg-purple-50 text-purple-600' },
  { label: 'Low Stock Products',value: 14,  icon: AlertTriangle,color: 'bg-red-50 text-red-600' },
];

export default function StoreDashboard() {
  useEffect(() => { document.title = 'Store Dashboard — QuickKart'; }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-dark-900">Store Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT.map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-4">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-extrabold text-dark-900">{s.value}</p>
            <p className="text-xs text-dark-500 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-bold text-dark-900 mb-4">Incoming Orders</h2>
        <div className="space-y-3">
          {mockOrders.map(o => (
            <div key={o.id} className="flex items-center gap-4 p-3 bg-dark-50 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-dark-900 text-sm">#{o.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                </div>
                <p className="text-xs text-dark-400">{o.items?.length} items · ₹{o.pricing?.total}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="btn-primary text-xs px-3 py-1.5">Pack</button>
                <button className="btn-secondary text-xs px-3 py-1.5">Ready</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
