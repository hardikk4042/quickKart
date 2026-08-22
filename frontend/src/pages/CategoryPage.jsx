// src/pages/CategoryPage.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productAPI, categoryAPI } from '@services/product.api';
import ProductCard from '@components/product/ProductCard';
import { ProductGridSkeleton } from '@components/common/SkeletonLoader';
import EmptyState from '@components/common/EmptyState';

const CATEGORY_STYLE_FALLBACKS = {
  // ── Existing categories ────────────────────────────────────
  'fruits-vegetables':       { icon: '🥦', bg: '#DCFCE7' },
  'dairy-breakfast':         { icon: '🥛', bg: '#DBEAFE' },
  'snacks':                  { icon: '🍿', bg: '#FEF3C7' },
  'beverages':               { icon: '🧃', bg: '#EDE9FE' },
  'instant-food':            { icon: '🍜', bg: '#FEE2E2' },
  'personal-care':           { icon: '🧴', bg: '#FCE7F3' },
  'household':               { icon: '🧹', bg: '#CFFAFE' },
  'bakery':                  { icon: '🍞', bg: '#FEF3C7' },
  'stationery':              { icon: '📝', bg: '#E0E7FF' },
  'electronics':             { icon: '🔌', bg: '#F3F4F6' },
  // ── New Phase 5 categories ─────────────────────────────────
  'atta-rice-dals':          { icon: '🌾', bg: '#FEF9C3' },
  'oil-ghee-masala':         { icon: '🫙', bg: '#FEF3C7' },
  'biscuits-cookies':        { icon: '🍪', bg: '#FEF3C7' },
  'chocolates-sweets':       { icon: '🍫', bg: '#FDE8FF' },
  'breakfast-sauces':        { icon: '🥣', bg: '#F0FDF4' },
  'packaged-food':           { icon: '📦', bg: '#F1F5F9' },
  'tea-coffee':              { icon: '☕', bg: '#FEF3C7' },
  'ice-cream-frozen':        { icon: '🍦', bg: '#EDE9FE' },
  'meat-seafood':            { icon: '🍗', bg: '#FEE2E2' },
  'baby-care':               { icon: '👶', bg: '#FEF9C3' },
  'home-kitchen':            { icon: '🏠', bg: '#F0FDF4' },
  'pet-care':                { icon: '🐾', bg: '#FEF3C7' },
  'pooja-festive':           { icon: '🪔', bg: '#FEF9C3' },
  'adult-personal-wellness': { icon: '💊', bg: '#F1F5F9' },
  'other-essentials':        { icon: '🛡️', bg: '#F3F4F6' },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setActiveSub(null);

    Promise.all([
      categoryAPI.getCategoryBySlug(slug),
      productAPI.getByCategory(slug),
    ])
      .then(([cat, prods]) => {
        if (!cat) { setNotFound(true); return; }
        // Enrich category with icon/bg
        const fallback = CATEGORY_STYLE_FALLBACKS[cat.slug] || { icon: '🛍️', bg: '#F3F4F6' };
        setCategory({ ...cat, icon: fallback.icon, bg: cat.imageUrl ? undefined : fallback.bg });
        setProducts(prods);
        document.title = `${cat.name} — QuickKart`;
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  // Sub-category chips from the DB (children relation)
  const subs = category?.children ?? [];

  // Client-side filter by subcategory name
  const filtered = activeSub
    ? products.filter(p => p.categoryName === activeSub || p.category === activeSub)
    : products;

  if (!loading && notFound) {
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
        <span className="text-dark-700 font-medium">{loading ? '…' : category?.name}</span>
      </nav>

      {/* Category banner */}
      {loading ? (
        <div className="rounded-3xl bg-dark-100 animate-pulse h-28 mb-6" />
      ) : category && (
        <div
          className="rounded-3xl p-6 sm:p-8 mb-6 flex items-center gap-4 sm:gap-6"
          style={{ backgroundColor: category.bg || '#F3F4F6' }}
        >
          {category.imageUrl
            ? <img src={category.imageUrl} alt={category.name} className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover" />
            : <span className="text-5xl sm:text-7xl">{category.icon}</span>
          }
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-900">{category.name}</h1>
            {category.description && (
              <p className="text-dark-500 text-sm mt-1">{category.description}</p>
            )}
            <p className="text-dark-400 text-sm mt-1">{products.length} products available</p>
          </div>
        </div>
      )}

      {/* Subcategory chips (from DB children relation) */}
      {!loading && subs.length > 0 && (
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
              {s.name}
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
