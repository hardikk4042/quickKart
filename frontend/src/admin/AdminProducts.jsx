// src/admin/AdminProducts.jsx
import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { products } from '@data/products';

export default function AdminProducts() {
  const [list, setList]       = useState(products);
  const [query, setQuery]     = useState('');
  const [catFilter, setCat]   = useState('');
  useEffect(() => { document.title = 'Products — Admin'; }, []);

  const filtered = list.filter(p =>
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase())) &&
    (catFilter ? p.category === catFilter : true)
  );

  const uniqueCats = [...new Set(products.map(p => p.category))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-dark-900">Products</h1>
        <button className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Product</button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300" size={16} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search products..." className="input pl-9" />
        </div>
        <select value={catFilter} onChange={e => setCat(e.target.value)} className="input sm:w-48">
          <option value="">All Categories</option>
          {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-100 bg-dark-50">
                {['Product', 'Category', 'Price', 'Rating', 'Stock', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-dark-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-dark-50 last:border-0 hover:bg-dark-50 transition-colors ${i % 2 === 0 ? '' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-900 truncate max-w-[180px]">{p.name}</p>
                        <p className="text-xs text-dark-400">{p.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs bg-dark-100 text-dark-600 px-2 py-1 rounded-lg font-medium capitalize">
                      {p.category.replace('-', ' ')}
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
                      ⭐ {p.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {p.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-dark-100 text-xs text-dark-400">
          Showing {filtered.length} of {products.length} products
        </div>
      </div>
    </div>
  );
}
