// src/delivery/DeliveryDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Package, CheckCircle, TrendingUp, Clock } from 'lucide-react';
import { mockOrders } from '@data/orders';
import useAuthStore from '@store/authStore';

export default function DeliveryDashboard() {
  const { user } = useAuthStore();
  const [online, setOnline]     = useState(false);
  const [activeOrder, setActive] = useState(mockOrders.find(o => o.status === 'out_for_delivery') || null);
  useEffect(() => { document.title = 'Delivery Dashboard — QuickKart'; }, []);

  return (
    <div className="min-h-screen bg-dark-50 pb-8">
      {/* Header */}
      <div className="bg-dark-900 text-white px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-dark-300 text-xs">Welcome back</p>
              <h1 className="text-xl font-bold">{user?.name || 'Rahul Kumar'}</h1>
            </div>
            {/* Online toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${online ? 'text-green-400' : 'text-dark-400'}`}>
                {online ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={() => setOnline(!online)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${online ? 'bg-green-500' : 'bg-dark-600'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${online ? 'translate-x-7 left-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Today stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Deliveries', value: '8', icon: Package },
              { label: 'Earnings',   value: '₹480', icon: TrendingUp },
              { label: 'Avg Time',   value: '18 min', icon: Clock },
            ].map(s => (
              <div key={s.label} className="bg-dark-700 rounded-2xl p-3 text-center">
                <p className="font-extrabold text-white text-lg">{s.value}</p>
                <p className="text-dark-400 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Active delivery */}
        {online && activeOrder ? (
          <div className="bg-white rounded-3xl shadow-card overflow-hidden">
            <div className="bg-brand-500 px-5 py-3">
              <p className="font-bold text-dark-900 text-sm">🛵 Active Delivery</p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono font-bold text-dark-900">#{activeOrder.id}</span>
                <span className="font-bold text-dark-900">₹{activeOrder.pricing?.total}</span>
              </div>

              <div className="bg-dark-50 rounded-2xl p-4 mb-4">
                <p className="text-xs font-semibold text-dark-500 mb-2 flex items-center gap-1.5"><MapPin size={12} /> Customer Address</p>
                <p className="text-sm font-medium text-dark-900">{activeOrder.address?.label}</p>
                <p className="text-xs text-dark-500">{activeOrder.address?.line}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 bg-dark-900 text-white rounded-2xl font-semibold text-sm hover:bg-dark-800 transition-colors">
                  <MapPin size={16} /> Navigate
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-brand-500 text-dark-900 rounded-2xl font-semibold text-sm hover:bg-brand-600 transition-colors">
                  <CheckCircle size={16} /> Delivered
                </button>
              </div>
            </div>
          </div>
        ) : online ? (
          <div className="bg-white rounded-3xl shadow-card p-8 text-center">
            <span className="text-5xl mb-4 block">🟢</span>
            <h2 className="font-bold text-dark-900 mb-2">You're Online!</h2>
            <p className="text-dark-400 text-sm">Waiting for a new delivery assignment...</p>
            <div className="mt-4 flex justify-center">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-card p-8 text-center">
            <span className="text-5xl mb-4 block">⛔</span>
            <h2 className="font-bold text-dark-900 mb-2">You're Offline</h2>
            <p className="text-dark-400 text-sm">Toggle the switch above to start receiving deliveries.</p>
          </div>
        )}

        {/* New order card (mock) */}
        {online && !activeOrder && (
          <div className="bg-white rounded-3xl shadow-card border-2 border-brand-400 overflow-hidden animate-pulse-brand">
            <div className="bg-brand-50 px-5 py-3 border-b border-brand-200">
              <p className="font-bold text-brand-700 text-sm">📦 New Delivery Request!</p>
            </div>
            <div className="p-5">
              <div className="flex justify-between mb-3">
                <span className="font-mono font-bold">#QK10295</span>
                <span className="font-bold">₹340</span>
              </div>
              <div className="bg-dark-50 rounded-xl p-3 mb-4 text-sm">
                <p className="font-medium text-dark-900">Hardik</p>
                <p className="text-dark-400 text-xs flex items-center gap-1 mt-0.5"><MapPin size={12} /> 2.4 km · Sector 14, Rajpura</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 border-2 border-error text-error rounded-2xl font-semibold text-sm hover:bg-red-50">Reject</button>
                <button
                  onClick={() => setActive(mockOrders[0])}
                  className="py-3 btn-primary rounded-2xl font-semibold text-sm">Accept</button>
              </div>
            </div>
          </div>
        )}

        {/* Delivery history */}
        <div className="bg-white rounded-3xl shadow-card p-5">
          <h2 className="font-bold text-dark-900 mb-4">Today's Deliveries</h2>
          <div className="space-y-3">
            {[
              { id: 'QK10288', addr: 'Sector 12, Rajpura', amount: 180, time: '2:30 PM' },
              { id: 'QK10285', addr: 'Sector 8, Rajpura',  amount: 420, time: '1:15 PM' },
              { id: 'QK10281', addr: 'Sector 21, Rajpura', amount: 95,  time: '11:45 AM' },
            ].map(d => (
              <div key={d.id} className="flex items-center gap-3 py-2 border-b border-dark-50 last:border-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-semibold text-dark-900 text-sm">#{d.id}</p>
                  <p className="text-xs text-dark-400">{d.addr} · {d.time}</p>
                </div>
                <span className="font-bold text-dark-900 text-sm">₹{d.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
