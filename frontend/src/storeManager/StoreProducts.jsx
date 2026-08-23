// src/storeManager/StoreProducts.jsx
//
// Store Manager — Product Management page.
// Allows the store manager to:
//   - View all global products
//   - Create a new product (backend links it to their store via Inventory)
//   - Edit or deactivate/activate products they own (enforced by backend RBAC)
//
import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit2, ToggleLeft, ToggleRight, Package, RefreshCw, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI, categoryAPI } from '@services/product.api';

// ── Helpers ───────────────────────────────────────────────────
/**
 * Formats monetary amounts from paise to standard Rupee string display.
 * @param {number} paise - Amount in paise (1 INR = 100 paise)
 * @returns {string} Formatted currency string
 */
function formatPrice(paise) {
  return `₹${(paise / 100).toFixed(0)}`;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  weight: '',
  unit: 'g',
  categoryId: '',
  tags: '',
  images: '',
  isFeatured: false,
};


// ── ProductModal ──────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSave }) {
  const isEdit = Boolean(product?.id);
  const [form, setForm] = useState(() =>
    isEdit
      ? {
          name:          product.name        || '',
          description:   product.description || '',
          price:         String(product.price / 100),
          originalPrice: product.originalPrice ? String(product.originalPrice / 100) : '',
          weight:        product.weight       || '',
          unit:          product.unit         || 'g',
          categoryId:    product.category?.id || product.categoryId || '',
          tags:          (product.tags || []).join(', '),
          images:        (product.images || []).join('\n'),
          isFeatured:    product.isFeatured   || false,
        }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())         return toast.error('Product name is required');
    if (!form.price || isNaN(Number(form.price))) return toast.error('Valid price is required');
    if (!form.categoryId)          return toast.error('Category is required');

    setSaving(true);
    try {
      const payload = {
        name:          form.name.trim(),
        description:   form.description.trim() || undefined,
        price:         Math.round(Number(form.price) * 100),          // to paise
        originalPrice: form.originalPrice ? Math.round(Number(form.originalPrice) * 100) : undefined,
        weight:        form.weight.trim()  || undefined,
        unit:          form.unit.trim()    || undefined,
        categoryId:    form.categoryId,
        tags:          form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images:        form.images.split('\n').map(u => u.trim()).filter(Boolean),
        isFeatured:    form.isFeatured,
        // storeId NOT sent — backend resolves from JWT (Store.managerId = user.id)
      };

      if (isEdit) {
        await productAPI.updateProduct(product.id, payload);
        toast.success('Product updated');
      } else {
        await productAPI.createProduct(payload);
        toast.success('Product created and linked to your store');
      }
      onSave();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to save product';
      // Surface RBAC errors clearly
      if (err?.response?.status === 403) toast.error('Permission denied: ' + msg);
      else toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-100">
          <h2 className="text-lg font-bold text-dark-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-50 transition-colors">
            <X size={18} className="text-dark-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Product Name *</label>
            <input value={form.name} onChange={set('name')} required
              className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="e.g. Amul Gold Full Cream Milk" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
              placeholder="Describe the product..." />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Category *</label>
            <select value={form.categoryId} onChange={set('categoryId')} required
              className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
              <option value="">— Select category —</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price & MRP Configuration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Price (₹) *</label>
              <input value={form.price} onChange={set('price')} type="number" min="0" step="0.01" required
                className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. 68" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">MRP (₹)</label>
              <input value={form.originalPrice} onChange={set('originalPrice')} type="number" min="0" step="0.01"
                className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. 75" />
            </div>
          </div>

          {/* Weight / Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Weight / Qty</label>
              <input value={form.weight} onChange={set('weight')}
                className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                placeholder="e.g. 500 g" />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 mb-1">Unit</label>
              <select value={form.unit} onChange={set('unit')}
                className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                {['g', 'kg', 'ml', 'L', 'pcs'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Tags (comma-separated)</label>
            <input value={form.tags} onChange={set('tags')}
              className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="e.g. milk, dairy, fresh" />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-1">Image URLs (one per line)</label>
            <textarea value={form.images} onChange={set('images')} rows={2}
              className="w-full px-3 py-2 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none font-mono"
              placeholder="https://images.unsplash.com/..." />
          </div>

          {/* Featured */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')}
              className="w-4 h-4 rounded text-brand-500 accent-brand-500" />
            <span className="text-sm font-medium text-dark-700">Mark as Featured</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-dark-200 rounded-xl text-sm font-medium text-dark-600 hover:bg-dark-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2.5 bg-brand-500 rounded-xl text-sm font-bold text-dark-900 hover:bg-brand-400 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function StoreProducts() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [modal,      setModal]      = useState(null);   // null | 'create' | product-obj (edit)
  const [toggling,   setToggling]   = useState(null);   // productId being toggled

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productAPI.getProducts({ limit: 500 }),
        categoryAPI.getCategories(),
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Products — Store Manager | QuickKart';
    load();
  }, [load]);

  // Toggle product active status
  const toggleStatus = async (product) => {
    setToggling(product.id);
    try {
      await productAPI.setProductStatus(product.id, !product.isActive);
      toast.success(`Product ${product.isActive ? 'deactivated' : 'activated'}`);
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Permission denied';
      toast.error(err?.response?.status === 403 ? `Access denied: ${msg}` : msg);
    } finally {
      setToggling(null);
    }
  };

  // Filtered products list based on search term (name or category match)
  const filtered = products.filter((p) => {
    if (!search) return true;
    const query = search.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(query);
    const matchesCategory = (p.category?.name || '').toLowerCase().includes(query);
    return matchesName || matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-900">Product Management</h1>
          <p className="text-sm text-dark-400 mt-0.5">Create products for your store. RBAC enforced by backend.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 border border-dark-200 rounded-xl text-sm font-medium text-dark-600 hover:bg-dark-50 transition-colors">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 rounded-xl text-sm font-bold text-dark-900 hover:bg-brand-400 transition-all shadow-brand">
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by name or category…"
          className="w-full pl-9 pr-4 py-2.5 border border-dark-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        />
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-dark-500">
        <span className="flex items-center gap-1.5">
          <Package size={14} className="text-brand-500" />
          <strong className="text-dark-900">{products.length}</strong> total products
        </span>
        <span>·</span>
        <span><strong className="text-dark-900">{products.filter(p => p.isActive).length}</strong> active</span>
        {search && (
          <>
            <span>·</span>
            <span><strong className="text-dark-900">{filtered.length}</strong> matching</span>
          </>
        )}
      </div>

      {/* Product table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-dark-400">
          <Loader2 size={20} className="animate-spin" />
          Loading products…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package size={40} className="mx-auto text-dark-200 mb-3" />
          <p className="text-dark-500 font-medium">{search ? 'No products match your search' : 'No products yet'}</p>
          {!search && (
            <button onClick={() => setModal('create')}
              className="mt-3 px-4 py-2 bg-brand-500 rounded-xl text-sm font-bold text-dark-900">
              Add your first product
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dark-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-100 bg-dark-50">
                  <th className="text-left font-semibold text-dark-500 px-4 py-3 w-10">#</th>
                  <th className="text-left font-semibold text-dark-500 px-4 py-3">Product</th>
                  <th className="text-left font-semibold text-dark-500 px-4 py-3 hidden md:table-cell">Category</th>
                  <th className="text-right font-semibold text-dark-500 px-4 py-3">Price</th>
                  <th className="text-center font-semibold text-dark-500 px-4 py-3 hidden sm:table-cell">Rating</th>
                  <th className="text-center font-semibold text-dark-500 px-4 py-3">Status</th>
                  <th className="text-right font-semibold text-dark-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, idx) => (
                  <tr key={product.id}
                    className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors last:border-0">
                    {/* Index */}
                    <td className="px-4 py-3 text-dark-300 text-xs">{idx + 1}</td>

                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-dark-100"
                            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&q=60'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-dark-100 flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-dark-300" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-dark-900 truncate max-w-[180px]">{product.name}</p>
                          {product.weight && (
                            <p className="text-xs text-dark-400">{product.weight}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 text-dark-500 hidden md:table-cell">
                      {product.category?.name || '—'}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-dark-900">{formatPrice(product.price)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="block text-xs text-dark-300 line-through">{formatPrice(product.originalPrice)}</span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {product.avgRating ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                          ⭐ {Number(product.avgRating).toFixed(1)}
                        </span>
                      ) : <span className="text-dark-200">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                        ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-dark-100 text-dark-400'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setModal(product)}
                          title="Edit product"
                          className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors text-dark-400 hover:text-dark-700"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => toggleStatus(product)}
                          disabled={toggling === product.id}
                          title={product.isActive ? 'Deactivate' : 'Activate'}
                          className="p-1.5 rounded-lg hover:bg-dark-100 transition-colors text-dark-400 hover:text-dark-700 disabled:opacity-40"
                        >
                          {toggling === product.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : product.isActive
                              ? <ToggleRight size={14} className="text-green-600" />
                              : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSave={async () => { setModal(null); await load(); }}
        />
      )}
    </div>
  );
}
