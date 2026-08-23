import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, MapPin } from 'lucide-react';
import { storeService } from '@services/store.api';
import toast from 'react-hot-toast';
import LocationPickerModal from '@components/maps/LocationPickerModal';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState({
    name: '', addressLine: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0, isActive: true, managerId: ''
  });

  useEffect(() => {
    document.title = 'Stores — Admin';
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await storeService.getStores();
      setStores(data.stores || []);
    } catch (err) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) || s.city.toLowerCase().includes(query.toLowerCase())
  );

  const openModal = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name, addressLine: store.addressLine, city: store.city, state: store.state,
        pincode: store.pincode, latitude: store.latitude, longitude: store.longitude, isActive: store.isActive,
        managerId: store.managerId || ''
      });
    } else {
      setEditingStore(null);
      setFormData({ name: '', addressLine: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0, isActive: true, managerId: '' });
    }
    setShowModal(true);
  };

  const handleMapSave = async (payload) => {
    setFormData(prev => ({
      ...prev,
      addressLine: payload.line1,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      latitude: payload.latitude,
      longitude: payload.longitude,
    }));
    setShowMapPicker(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, managerId: formData.managerId || null };
      if (editingStore) {
        await storeService.updateStore(editingStore.id, payload);
        toast.success('Store updated');
      } else {
        await storeService.createStore(payload);
        toast.success('Store created');
      }
      setShowModal(false);
      fetchStores();
    } catch (err) {
      toast.error(err.message || 'Error saving store');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this store?')) return;
    try {
      await storeService.deleteStore(id);
      toast.success('Store deleted');
      fetchStores();
    } catch (err) {
      toast.error('Error deleting store');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-dark-900">Stores</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Store</button>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search stores..." className="input pl-9" />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                {['Store Name', 'Location', 'Status', 'Manager', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5">No stores found.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-dark-900">{s.name}</td>
                  <td className="px-5 py-3.5 text-dark-600">{s.city}, {s.state}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-dark-600">
                    {s.manager ? s.manager.name : <span className="text-dark-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal(s)} className="p-1.5 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-100 flex justify-between items-center bg-dark-50">
              <h2 className="font-bold text-lg text-dark-900">{editingStore ? 'Edit Store' : 'Add Store'}</h2>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-dark-900 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <button 
                type="button" 
                onClick={() => setShowMapPicker(true)} 
                className="w-full py-2 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-100 transition-colors"
              >
                <MapPin size={18} /> Pick Location on Map
              </button>
              
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
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Status</label>
                  <select className="input" value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Latitude</label>
                  <input required type="number" step="any" className="input" value={formData.latitude} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Longitude</label>
                  <input required type="number" step="any" className="input" value={formData.longitude} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Manager User ID (Optional)</label>
                  <input className="input" placeholder="cuid..." value={formData.managerId} onChange={e => setFormData({...formData, managerId: e.target.value})} />
                  <p className="text-xs text-dark-400 mt-1">Must be the ID of a user with STORE_MANAGER role.</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-dark-100 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save Store</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Render LocationPickerModal outside the normal modal to take full screen */}
      <LocationPickerModal 
        isOpen={showMapPicker} 
        onClose={() => setShowMapPicker(false)} 
        onSave={handleMapSave}
        initialValues={{ ...formData, line1: formData.addressLine }}
        autoLocate={!editingStore && !formData.latitude}
        skipDetailsForm={true}
      />
    </div>
  );
}
