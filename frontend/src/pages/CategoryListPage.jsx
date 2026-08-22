// src/pages/CategoryListPage.jsx  — /category route (all categories)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '@services/product.api';

// Emoji / colour fallbacks (same mapping as Home.jsx)
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

function enrichCategory(cat) {
  const fallback = CATEGORY_STYLE_FALLBACKS[cat.slug] || { icon: '🛍️', bg: '#F3F4F6' };
  return {
    ...cat,
    icon:  fallback.icon,
    bg:    fallback.bg,
    count: cat._count?.products ?? 0,
  };
}

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    document.title = 'All Categories — QuickKart';
    categoryAPI.getCategories()
      .then(cats => setCategories(cats.map(enrichCategory)))
      .catch(err => { console.error('Failed to load categories:', err); setCategories([]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">All Categories</h1>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-card p-5">
              <div className="w-16 h-16 rounded-2xl bg-dark-100 animate-pulse" />
              <div className="h-4 w-20 bg-dark-100 animate-pulse rounded" />
              <div className="h-3 w-16 bg-dark-50 animate-pulse rounded" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <p className="text-dark-400 text-sm text-center py-12">No categories available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: cat.bg }}>
                {cat.imageUrl
                  ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover rounded-2xl" />
                  : cat.icon}
              </div>
              <div className="text-center">
                <p className="font-semibold text-dark-900 text-sm group-hover:text-brand-600 transition-colors">{cat.name}</p>
                <p className="text-xs text-dark-400">{cat.count} products</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
