// src/storeManager/StoreDashboard.jsx
import { useEffect, useState } from 'react';
import { ShoppingBag, Clock, CheckCircle, AlertTriangle, Store, Edit2 } from 'lucide-react';
import { mockOrders } from '@data/orders';
import { statusColor, statusLabel, formatDate } from '@utils/format';
import { storeService } from '@services/store.api';
import toast from 'react-hot-toast';

const STAT = [
  { label: "Today's Orders",    value: 34,  icon: ShoppingBag,  color: 'bg-blue-50 text-blue-600' },
  { label: 'Pending Orders',    value: 8,   icon: Clock,        color: 'bg-amber-50 text-amber-600' },
  { label: 'Being Packed',      value: 4,   icon: ShoppingBag,  color: 'bg-purple-50 text-purple-600' },
  { label: 'Low Stock Products',value: 14,  icon: AlertTriangle,color: 'bg-red-50 text-red-600' },
];

export default function StoreDashboard() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: '', addressLine: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0
  });

  useEffect(() => {
    document.title = 'Store Dashboard — QuickKart';
    fetchStore();
  }, []);

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
      toast.error('Failed to load store information');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    setFormData({
      name: store.name,
      addressLine: store.addressLine,
      city: store.city,
      state: store.state,
      pincode: store.pincode,
      latitude: store.latitude,
      longitude: store.longitude
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await storeService.updateStore(store.id, formData);
      toast.success('Store updated successfully');
      setShowEdit(false);
      fetchStore();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating store');
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
          <button onClick={openEdit} className="btn-secondary flex items-center gap-2">
            <Edit2 size={16} /> Edit Details
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

      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-100 flex justify-between items-center bg-dark-50">
              <h2 className="font-bold text-lg text-dark-900">Edit Store Details</h2>
              <button onClick={() => setShowEdit(false)} className="text-dark-400 hover:text-dark-900 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Store Name</label>
                  <input required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Address Line</label>
                  <input required className="input" value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">City</label>
                  <input required className="input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">State</label>
                  <input required className="input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Pincode</label>
                  <input required className="input" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Latitude</label>
                  <input required type="number" step="any" className="input" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Longitude</label>
                  <input required type="number" step="any" className="input" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-dark-100 mt-6">
                <button type="button" onClick={() => setShowEdit(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
