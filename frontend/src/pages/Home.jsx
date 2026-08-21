// src/pages/Home.jsx
// Main store discovery landing page featuring location header, banner, categories, and curated sections

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { productAPI, categoryAPI } from '@services/product.api';
import CategoryCard from '@components/common/CategoryCard';
import HeroBanner from '@components/common/HeroBanner';
import ProductSection from '@components/product/ProductSection';
import useLocationStore from '@store/locationStore';
import useUiStore from '@store/uiStore';

// Fallback category appearance when the DB category doesn't have colour/icon metadata
// (the schema only stores imageUrl, not emoji icon / bg colour)
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

export default function Home() {
  const { selectedAddress } = useLocationStore();
  const { setLocationPickerOpen } = useUiStore();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState({ trending: [], bestSellers: [], deals: [], fresh: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'QuickKart — Everything you need. Delivered fast.';
    (async () => {
      try {
        const [cats, trending, bestSellers, deals, fresh] = await Promise.all([
          categoryAPI.getCategories(),
          productAPI.getTrending(),
          productAPI.getBestSellers(),
          productAPI.getTopDeals(),
          productAPI.getFreshPicks(),
        ]);
        setCategories(cats.map(enrichCategory));
        setSections({ trending, bestSellers, deals, fresh });
      } catch (e) {
        console.error('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-8 pb-24 md:pb-8">
      {/* Delivery badge */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setLocationPickerOpen(true)}
          className="flex items-center gap-2 text-left group"
        >
          <div>
            <p className="text-xs text-dark-400 font-medium">Delivering to</p>
            <div className="flex items-center gap-1">
              <p className="text-base font-bold text-dark-900">{selectedAddress?.label || 'Select Location'}</p>
              <ChevronDown size={16} className="text-dark-500 group-hover:text-dark-800 transition-colors" />
            </div>
            <p className="text-xs text-dark-400">{selectedAddress ? `${selectedAddress.city} - ${selectedAddress.pincode}` : 'Choose a delivery address'}</p>
          </div>
        </button>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-green-700">10–30 min</span>
        </div>
      </div>

      {/* Hero Banner */}
      <HeroBanner />

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Shop by Category</h2>
          <button onClick={() => navigate('/category')} className="text-xs font-semibold text-dark-500 hover:text-brand-600 transition-colors">
            All categories →
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-dark-100 animate-pulse" />
                <div className="h-3 w-16 bg-dark-100 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4">
            {categories.slice(0, 10).map(cat => <CategoryCard key={cat.id} category={cat} />)}
          </div>
        )}
      </section>

      {/* Promo strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { bg: 'from-yellow-50 to-amber-50 border-amber-200',   icon: '⚡', label: 'Express Delivery',  sub: 'In 10–30 minutes' },
          { bg: 'from-green-50 to-emerald-50 border-green-200',  icon: '✅', label: 'Fresh & Quality',   sub: 'Sourced daily' },
          { bg: 'from-blue-50 to-indigo-50 border-blue-200',     icon: '💸', label: 'Best Prices',       sub: 'No hidden charges' },
        ].map(p => (
          <div key={p.label} className={`flex items-center gap-3 bg-gradient-to-br ${p.bg} border rounded-2xl px-4 py-3`}>
            <span className="text-2xl">{p.icon}</span>
            <div>
              <p className="font-bold text-sm text-dark-900">{p.label}</p>
              <p className="text-xs text-dark-500">{p.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Product sections */}
      <ProductSection title="🔥 Trending Near You"  subtitle="Most ordered this week" products={sections.trending}    isLoading={loading} seeAllHref="/search?sort=trending" />
      <ProductSection title="⭐ Best Sellers"        subtitle="Community favourites"   products={sections.bestSellers} isLoading={loading} seeAllHref="/search?sort=popular" />
      <ProductSection title="🌿 Fresh Picks"         subtitle="Straight from the farm"  products={sections.fresh}       isLoading={loading} seeAllHref="/category/fruits-vegetables" />
      <ProductSection title="🏷️ Top Deals"           subtitle="Up to 40% off today"     products={sections.deals}       isLoading={loading} seeAllHref="/search?sort=discount" />

      {/* Brand banner */}
      <div className="bg-gradient-hero rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-brand-400 text-sm font-semibold mb-1">About QuickKart</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Everything you need.</h2>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-400 mb-4">Delivered fast.</h2>
          <p className="text-dark-300 text-sm max-w-md">
            QuickKart brings your essentials in 10–30 minutes. Fresh produce, daily groceries, snacks, and more — right to your door.
          </p>
        </div>
        <div className="text-8xl sm:text-9xl opacity-20 select-none">⚡</div>
      </div>
    </div>
  );
}
