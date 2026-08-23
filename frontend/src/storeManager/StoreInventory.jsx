import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Plus, Minus, FileEdit } from 'lucide-react';
import { inventoryAPI } from '@services/inventory.api';
import { storeService } from '@services/store.api';
import useAuthStore from '@store/authStore';
import toast from 'react-hot-toast';

export default function StoreInventory() {
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState(null);

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [adjustType, setAdjustType] = useState('STOCK_IN');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadInventory = useCallback(async (currentStoreId) => {
    if (!currentStoreId) return;
    try {
      setLoading(true);
      const res = await inventoryAPI.getStoreInventory(currentStoreId, { page, limit: 20, q: search });
      setInventory(res.inventory || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await storeService.getStores();
        if (data.stores && data.stores.length > 0) {
          const sid = data.stores[0].id;
          setStoreId(sid);
          loadInventory(sid);
        } else {
          setLoading(false);
        }
      } catch (err) {
        toast.error('Failed to identify your store');
        setLoading(false);
      }
    };
    init();
  }, [loadInventory]);

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty === 0) {
      return toast.error('Please enter a valid quantity');
    }
    
    if (adjustType !== 'ADJUSTMENT' && qty < 0) {
      return toast.error('Quantity must be positive for Stock In/Out');
    }

    try {
      setSubmitting(true);
      await inventoryAPI.adjustStock(selectedItem.id, {
        type: adjustType,
        quantityDelta: qty,
        reason: adjustReason || undefined,
      });
      toast.success('Stock adjusted successfully');
      setModalOpen(false);
      loadInventory(storeId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSubmitting(false);
    }
  };

  const openAdjustModal = (item) => {
    setSelectedItem(item);
    setAdjustType('STOCK_IN');
    setAdjustQty('');
    setAdjustReason('');
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Inventory Management</h1>
          <p className="text-dark-500 text-sm">Manage stock levels for your store</p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-50 border-b text-dark-500 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">On Hand</th>
                <th className="px-6 py-4 text-right">Reserved</th>
                <th className="px-6 py-4 text-right">Available</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-dark-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-dark-400">Loading inventory...</td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-dark-400">No inventory records found.</td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-100 overflow-hidden flex-shrink-0">
                          <img src={item.product?.images?.[0] || 'https://via.placeholder.com/150'} alt={item.product?.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-dark-900">{item.product?.name}</p>
                          <p className="text-xs text-dark-400">{item.product?.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        item.status === 'LOW_STOCK' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{item.quantityOnHand}</td>
                    <td className="px-6 py-4 text-right text-dark-400">{item.quantityReserved}</td>
                    <td className="px-6 py-4 text-right font-bold text-dark-900">{item.availableStock}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openAdjustModal(item)}
                          className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Adjust Stock"
                        >
                          <FileEdit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-dark-50">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border bg-white rounded-lg disabled:opacity-50 font-medium text-sm"
            >
              Previous
            </button>
            <span className="text-sm font-medium text-dark-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border bg-white rounded-lg disabled:opacity-50 font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-dark-50">
              <h3 className="text-lg font-bold text-dark-900">Adjust Stock</h3>
              <button onClick={() => setModalOpen(false)} className="text-dark-400 hover:text-dark-600 text-xl font-bold">&times;</button>
            </div>
            
            <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-dark-500 mb-1">Product</p>
                <p className="font-semibold">{selectedItem.product?.name}</p>
              </div>
              
              <div className="flex gap-4 p-3 bg-dark-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-xs text-dark-500 uppercase font-semibold">Current On Hand</p>
                  <p className="text-xl font-bold">{selectedItem.quantityOnHand}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-dark-500 uppercase font-semibold">Available</p>
                  <p className="text-xl font-bold text-brand-600">{selectedItem.availableStock}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-1">Adjustment Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setAdjustType('STOCK_IN')}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${adjustType === 'STOCK_IN' ? 'bg-green-50 border-green-200 text-green-700' : 'hover:bg-dark-50 text-dark-500'}`}>
                    <Plus size={16}/> In
                  </button>
                  <button type="button" onClick={() => setAdjustType('STOCK_OUT')}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${adjustType === 'STOCK_OUT' ? 'bg-red-50 border-red-200 text-red-700' : 'hover:bg-dark-50 text-dark-500'}`}>
                    <Minus size={16}/> Out
                  </button>
                  <button type="button" onClick={() => setAdjustType('ADJUSTMENT')}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1 transition-colors ${adjustType === 'ADJUSTMENT' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-dark-50 text-dark-500'}`}>
                    <FileEdit size={16}/> Set/Adj
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-1">
                  {adjustType === 'ADJUSTMENT' ? 'Adjustment Amount (can be negative)' : 'Quantity to Add/Remove (positive)'}
                </label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:border-brand-500 text-lg font-semibold"
                  placeholder="e.g. 10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark-900 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl outline-none focus:border-brand-500"
                  placeholder="e.g. New stock arrived, damaged goods"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 px-4 border rounded-xl font-bold hover:bg-dark-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 px-4 bg-brand-500 text-dark-900 rounded-xl font-bold hover:bg-brand-400 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
