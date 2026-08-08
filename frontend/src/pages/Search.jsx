// src/pages/Search.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { productAPI } from '@services/product.api';
import ProductCard from '@components/product/ProductCard';
import { ProductGridSkeleton } from '@components/common/SkeletonLoader';
import EmptyState from '@components/common/EmptyState';

const SORT_OPTIONS = [
  { value: 'relevance',   label: 'Relevance' },
  { value: 'price_asc',   label: 'Price: Low to High' },
  { value: 'price_desc',  label: 'Price: High to Low' },
  { value: 'rating',      label: 'Top Rated' },
  { value: 'discount',    label: 'Biggest Discount' },
];

export default function Search() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const sort  = params.get('sort') || 'relevance';

  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    document.title = query ? `"${query}" — QuickKart Search` : 'Search — QuickKart';
    if (!query) { setResults([]); return; }
    setLoading(true);
    productAPI.search(query, { sort })
      .then(res => setResults(res.products || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query, sort]);

  const filtered = results.filter(p =>
    p.price >= priceRange[0] && p.price <= priceRange[1] &&
    (inStockOnly ? p.inStock : true)
  );

  const setSort = (v) => setParams({ q: query, sort: v });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {query ? (
            <>
              <h1 className="text-xl font-bold text-dark-900">Results for "{query}"</h1>
              <p className="text-sm text-dark-400">{loading ? 'Searching...' : `${filtered.length} products found`}</p>
            </>
          ) : (
            <h1 className="text-xl font-bold text-dark-900">Search Products</h1>
          )}
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all
                      ${showFilter ? 'bg-brand-500 border-brand-500 text-dark-900' : 'bg-white border-dark-200 text-dark-600 hover:border-dark-400'}`}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filter Panel (desktop sidebar + mobile overlay) */}
        {showFilter && (
          <aside className="w-60 flex-shrink-0 hidden md:block">
            <div className="bg-white rounded-2xl shadow-card p-5 sticky top-20 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-dark-900">Filters</h3>
                <button onClick={() => setShowFilter(false)} className="text-dark-400 hover:text-dark-700"><X size={16} /></button>
              </div>

              {/* Price */}
              <div>
                <p className="text-sm font-semibold text-dark-700 mb-3">Price Range</p>
                <div className="flex gap-2">
                  <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                    className="input text-xs" placeholder="Min" />
                  <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                    className="input text-xs" placeholder="Max" />
                </div>
              </div>

              {/* In stock */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded accent-brand-500" />
                  <span className="text-sm font-medium text-dark-700">In Stock Only</span>
                </label>
              </div>

              {/* Reset */}
              <button
                onClick={() => { setPriceRange([0, 1000]); setInStockOnly(false); }}
                className="w-full text-sm text-dark-500 hover:text-dark-900 font-medium py-2 border border-dark-200 rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>
        )}

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`chip flex-shrink-0 ${sort === opt.value ? 'chip-active' : 'chip-inactive'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : query ? (
            <EmptyState
              type="search"
              title="No products found"
              subtitle={`We couldn't find any products matching "${query}". Try different keywords.`}
              actionHref="/"
              actionLabel="Back to Home"
            />
          ) : (
            <EmptyState
              type="search"
              title="Search for products"
              subtitle="Type something in the search bar above to find products."
            />
          )}
        </div>
      </div>
    </div>
  );
}
