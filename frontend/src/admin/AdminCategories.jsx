// src/admin/AdminCategories.jsx
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, ToggleLeft, ToggleRight, RefreshCw, FolderOpen } from 'lucide-react';
import { categoryAPI } from '@services/product.api';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', slug: '', description: '', imageUrl: '', sortOrder: 0, isActive: true, parentId: '',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  useEffect(() => { document.title = 'Categories — Admin'; }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await categoryAPI.getCategories();
      setCategories(cats);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({
      name:        cat.name,
      slug:        cat.slug,
      description: cat.description || '',
      imageUrl:    cat.imageUrl || '',
      sortOrder:   cat.sortOrder ?? 0,
      isActive:    cat.isActive,
      parentId:    cat.parentId || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name:        form.name,
        description: form.description || undefined,
        imageUrl:    form.imageUrl || undefined,
        sortOrder:   parseInt(form.sortOrder, 10) || 0,
        parentId:    form.parentId || undefined,
        isActive:    form.isActive,
      };
      if (form.slug) payload.slug = form.slug;

      if (editTarget) {
        await categoryAPI.updateCategory(editTarget.id, payload);
        toast.success('Category updated');
      } else {
        await categoryAPI.createCategory(payload);
        toast.success('Category created');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const toggleStatus = async (cat) => {
    try {
      await categoryAPI.setCategoryStatus(cat.id, !cat.isActive);
      toast.success(`Category ${cat.isActive ? 'deactivated' : 'activated'}`);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Parent-only categories (for dropdown, exclude self when editing)
  const parentOptions = categories.filter(c => !editTarget || c.id !== editTarget.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-dark-900">Categories</h1>
        <div className="flex gap-3">
          <button onClick={fetchCategories} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={14} />
          </button>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                {['Category', 'Slug', 'Products', 'Parent', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-dark-50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-dark-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : categories.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-dark-400 text-sm">No categories yet. Add one!</td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="border-b border-dark-50 last:border-0 hover:bg-dark-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {cat.imageUrl
                        ? <img src={cat.imageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        : <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                            <FolderOpen size={14} className="text-brand-500" />
                          </div>
                      }
                      <div>
                        <p className="font-semibold text-dark-900">{cat.name}</p>
                        {cat.description && <p className="text-xs text-dark-400 truncate max-w-[200px]">{cat.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <code className="text-xs bg-dark-100 text-dark-600 px-2 py-1 rounded">{cat.slug}</code>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-dark-700">{cat._count?.products ?? 0}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-dark-500">{cat.parent?.name || '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => toggleStatus(cat)} title={cat.isActive ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded-lg transition-colors ${cat.isActive ? 'hover:bg-red-50 text-red-400' : 'hover:bg-green-50 text-green-500'}`}>
                        {cat.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-dark-100 text-xs text-dark-400">
          {categories.length} categories total
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-100 flex justify-between items-center bg-dark-50">
              <h2 className="font-bold text-lg text-dark-900">{editTarget ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowForm(false)} className="text-dark-400 hover:text-dark-900 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Name *</label>
                <input required className="input" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Slug (auto-generated if empty)</label>
                <input className="input font-mono text-sm" value={form.slug} placeholder="e.g. dairy-breakfast"
                  onChange={e => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Description</label>
                <textarea rows={2} className="input resize-none" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">Image URL</label>
                <input className="input" value={form.imageUrl} placeholder="https://..."
                  onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Sort Order</label>
                  <input type="number" min="0" className="input" value={form.sortOrder}
                    onChange={e => setForm({ ...form, sortOrder: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">Parent Category</label>
                  <select className="input" value={form.parentId}
                    onChange={e => setForm({ ...form, parentId: e.target.value })}>
                    <option value="">None (top-level)</option>
                    {parentOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-brand-500" />
                <span className="text-sm font-medium text-dark-700">Active</span>
              </label>
              <div className="pt-4 flex justify-end gap-3 border-t border-dark-100 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editTarget ? 'Save Changes' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
