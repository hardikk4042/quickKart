// src/admin/AdminProducts.jsx
import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { productAPI, categoryAPI } from '@services/product.api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [query, setQuery]           = useState('');
  const [catFilter, setCatFilter]   = useState('');
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState({
    name: '', description: '', categoryId: '', brandId: '',
    price: '', originalPrice: '', discountPct: 0,
    weight: '', unit: '', images: '', tags: '', isActive: true, isFeatured: false,
  });

  useEffect(() => { document.title = 'Products — Admin'; }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (catFilter) params.categoryId = catFilter;
      // Note: admin can see all products (no isActive filter)
      const res = await productAPI.getProducts(params);
      setProducts(res.products ?? []);
      setPagination(res.pagination ?? null);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, catFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await categoryAPI.getCategories();
      setCategories(cats);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    String(p.brand || '').toLowerCase().includes(query.toLowerCase()),
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      name: '', description: '', categoryId: '', brandId: '',
      price: '', originalPrice: '', discountPct: 0,
      weight: '', unit: '', images: '', tags: '', isActive: true, isFeatured: false,
    });
    setShowAdd(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      name: p.name,
      description: p.description || '',
      categoryId: p.categoryId || '',
      brandId: p.brandId || '',
      // Display in rupees for form; convert back to paise on save
      price: p.price,
      originalPrice: p.originalPrice || '',
      discountPct: p.discount || 0,
      weight: p.weight || '',
      unit: p.unit || '',
      images: (p.images || []).join(', '),
      tags: (p.tags || []).join(', '),
      isActive: p.isActive !== false,
      isFeatured: p.isFeatured || false,
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name:          form.name,
        description:   form.description || undefined,
        categoryId:    form.categoryId,
        brandId:       form.brandId || undefined,
        // Convert rupees → paise
        price:         Math.round(parseFloat(form.price) * 100),
        originalPrice: form.originalPrice ? Math.round(parseFloat(form.originalPrice) * 100) : undefined,
        discountPct:   parseInt(form.discountPct, 10) || 0,
        weight:        form.weight || undefined,
        unit:          form.unit || undefined,
        images:        form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags:          form.tags   ? form.tags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [],
        isActive:      form.isActive,
        isFeatured:    form.isFeatured,
      };

      if (editTarget) {
        await productAPI.updateProduct(editTarget.id, payload);
        toast.success('Product updated');
      } else {
        await productAPI.createProduct(payload);
        toast.success('Product created');
      }
      setShowAdd(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    }
  };

  const toggleStatus = async (p) => {
    try {
      await productAPI.setProductStatus(p.id, !p.isActive);
      toast.success(`Product ${p.isActive ? 'deactivated' : 'activated'}`);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-dark-900">Products</h1>
        <div className="flex gap-3">
          <button onClick={fetchProducts} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={14} />
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search products..." className="input pl-9" />
        </div>
        <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} className="input sm:w-48">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                {['Product', 'Category', 'Price', 'Rating', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-dark-50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-dark-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-dark-400 text-sm">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-900 truncate max-w-[180px]">{p.name}</p>
                        <p className="text-xs text-dark-400">{p.brand || p.weight || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-dark-100 text-dark-600 px-2 py-1 rounded-lg font-medium capitalize">
                      {p.categoryName || p.category || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-bold text-dark-900">₹{p.price}</span>
                      {p.discount > 0 && <span className="text-xs text-green-600 ml-1">-{p.discount}%</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 text-dark-700">
                      ⭐ {p.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.isActive !== false ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {p.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => toggleStatus(p)} title={p.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${p.isActive !== false ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'}`}>
                        {p.isActive !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-5 py-3 border-t border-dark-100 flex items-center justify-between text-xs text-dark-400">
            <span>Showing {filtered.length} of {pagination.total} products</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={!pagination.hasPrev}
                className="px-3 py-1 rounded-lg border border-dark-200 disabled:opacity-40 hover:bg-dark-50">
                Prev
              </button>
              <span className="px-3 py-1">{page} / {pagination.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                className="px-3 py-1 rounded-lg border border-dark-200 disabled:opacity-40 hover:bg-dark-50">
                Next
              </button>
            </div>
          </div>
        )}
        {!loading && !pagination?.totalPages && (
          <div className="px-5 py-3 border-t border-dark-100 text-xs text-dark-400">
            Showing {filtered.length} products
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-100 flex justify-between items-center bg-dark-50">
              <h2 className="font-bold text-lg text-dark-900">{editTarget ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowAdd(false)} className="text-dark-400 hover:text-dark-900 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Product Name *</label>
                  <input required className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Description</label>
                  <textarea rows={3} className="input resize-none" value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Category *</label>
                  <select required className="input" value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}>
                    <option value="">Select category</option>
                    {categories.filter(c => c.isActive).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Weight / Quantity</label>
                  <input className="input" value={form.weight} placeholder="e.g. 500g, 1L"
                    onChange={e => setForm({ ...form, weight: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Price (₹) *</label>
                  <input required type="number" min="0.01" step="0.01" className="input" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Original Price (₹)</label>
                  <input type="number" min="0" step="0.01" className="input" value={form.originalPrice}
                    onChange={e => setForm({ ...form, originalPrice: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Discount %</label>
                  <input type="number" min="0" max="100" className="input" value={form.discountPct}
                    onChange={e => setForm({ ...form, discountPct: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Unit</label>
                  <input className="input" value={form.unit} placeholder="e.g. g, ml, pcs"
                    onChange={e => setForm({ ...form, unit: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Image URLs (comma-separated)</label>
                  <input className="input" value={form.images} placeholder="https://..."
                    onChange={e => setForm({ ...form, images: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Tags (comma-separated)</label>
                  <input className="input" value={form.tags} placeholder="milk, dairy, amul"
                    onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive}
                      onChange={e => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm font-medium text-dark-700">Active</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured}
                      onChange={e => setForm({ ...form, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm font-medium text-dark-700">Featured</span>
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-dark-100 mt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editTarget ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
