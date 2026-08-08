// src/pages/CategoryPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productAPI } from '@services/product.api';
import { categories, subcategories } from '@data/categories';
import ProductCard from '@components/product/ProductCard';
import { ProductGridSkeleton } from '@components/common/SkeletonLoader';
import EmptyState from '@components/common/EmptyState';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeSub, setActiveSub] = useState(null);

  const category = categories.find(c => c.slug === slug);
  const subs = subcategories[slug] || [];

  useEffect(() => {
    document.title = `${category?.name || 'Category'} — QuickKart`;
    setLoading(true);
    productAPI.getByCategory(slug)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [slug]);

  const filtered = activeSub
    ? products.filter(p => p.subcategory === activeSub)
    : products;

  if (!category) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState title="Category not found" actionHref="/" actionLabel="Go Home" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-dark-400 mb-5">
        <Link to="/" className="hover:text-dark-700">Home</Link>
        <ChevronRight size={12} />
        <span className="text-dark-700 font-medium">{category.name}</span>
      </nav>

      {/* Category banner */}
      <div className="rounded-3xl p-6 sm:p-8 mb-6 flex items-center gap-4 sm:gap-6" style={{ backgroundColor: category.bg }}>
        <span className="text-5xl sm:text-7xl">{category.icon}</span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900">{category.name}</h1>
          <p className="text-dark-500 text-sm mt-1">{products.length} products available</p>
        </div>
      </div>

      {/* Subcategory chips */}
      {subs.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
          <button
            onClick={() => setActiveSub(null)}
            className={`chip flex-shrink-0 ${!activeSub ? 'chip-active' : 'chip-inactive'}`}
          >
            All
          </button>
          {subs.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSub(s.name)}
              className={`chip flex-shrink-0 ${activeSub === s.name ? 'chip-active' : 'chip-inactive'}`}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Products */}
      {loading ? (
        <ProductGridSkeleton count={12} />
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <EmptyState
          type="products"
          title="No products here"
          subtitle="Check back soon — we're stocking up."
          actionHref="/"
          actionLabel="Continue Shopping"
        />
      )}
    </div>
  );
}
