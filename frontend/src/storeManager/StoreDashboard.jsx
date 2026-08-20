/**
 * @file StoreDashboard.jsx
 * @description Store Manager Overview Dashboard component.
 * Displays assigned store info, order statistics, and incoming orders.
 */
import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, CheckCircle, AlertTriangle, Store, Navigation } from 'lucide-react';
import { mockOrders } from '@data/orders';
import LocationPickerModal from '@components/maps/LocationPickerModal';
import { statusColor, statusLabel, formatDate } from '@utils/format';
import { storeService } from '@services/store.api';
import toast from 'react-hot-toast';

// ── Dashboard Metrics Summary Configuration ────────────────────
const STAT = [
  { label: "Today's Orders",     value: 34, icon: ShoppingBag,   color: 'bg-blue-50 text-blue-600' },
  { label: 'Pending Orders',     value: 8,  icon: Clock,         color: 'bg-amber-50 text-amber-600' },
  { label: 'Being Packed',       value: 4,  icon: ShoppingBag,   color: 'bg-purple-50 text-purple-600' },
  { label: 'Low Stock Products', value: 14, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
];

export default function StoreDashboard() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    document.title = 'Store Dashboard — QuickKart';
    fetchStore();
  }, []);

  /**
   * Fetches the assigned store information for the logged-in manager.
   */
  const fetchStore = async () => {
    try {
      setLoading(true);
      const data = await storeService.getStores();
      if (data.stores && data.stores.length > 0) {
        setStore(data.stores[0]);
      } else {
        setStore(null);
      }
    } catch (err) {
      // Notify user on network/fetch failure
      toast.error('Failed to load store information');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h1 className="text-2xl font-extrabold text-dark-900">Store Dashboard</h1>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-5 text-center">Loading store data...</div>
      ) : store ? (
        <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-dark-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Store size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-dark-900">{store.name}</h2>
              <p className="text-sm text-dark-500">{store.addressLine}, {store.city}, {store.state} - {store.pincode}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMap(true)}
            className="btn-secondary flex items-center gap-2 text-brand-700 hover:text-brand-800"
          >
            <Navigation size={16} /> View Location
          </button>
        </div>
      ) : (
        <div className="bg-red-50 text-red-600 p-5 rounded-2xl shadow-card border border-red-100 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="font-semibold text-sm">You are not assigned to any store yet. Please contact the administrator.</p>
        </div>
      )}

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

      {showMap && (
        <LocationPickerModal
          isOpen={showMap}
          onClose={() => setShowMap(false)}
          readOnly={true}
          initialValues={{ latitude: store?.latitude, longitude: store?.longitude }}
        />
      )}
    </div>
  );
}
