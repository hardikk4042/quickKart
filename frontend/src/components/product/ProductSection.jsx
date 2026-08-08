// src/components/product/ProductSection.jsx
import { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '@components/common/SkeletonLoader';

export default function ProductSection({ title, subtitle, products = [], isLoading, seeAllHref }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  return (
    <section className="relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll(-1)} className="hidden sm:flex p-2 rounded-full border border-dark-100 hover:border-brand-500 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll(1)} className="hidden sm:flex p-2 rounded-full border border-dark-100 hover:border-brand-500 transition-colors">
            <ChevronRight size={16} />
          </button>
          {seeAllHref && (
            <Link to={seeAllHref} className="text-xs font-semibold text-dark-500 hover:text-brand-600 transition-colors flex items-center gap-0.5">
              See all <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Scroll row */}
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40">
                <ProductCardSkeleton />
              </div>
            ))
          : products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-40 sm:w-44">
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}
