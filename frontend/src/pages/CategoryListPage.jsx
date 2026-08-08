// src/pages/CategoryListPage.jsx  — /category route (all categories)
import { Link } from 'react-router-dom';
import { categories } from '@data/categories';

export default function CategoryListPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">All Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map(cat => (
          <Link key={cat.id} to={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-3 bg-white rounded-3xl shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: cat.bg }}>
              {cat.icon}
            </div>
            <div className="text-center">
              <p className="font-semibold text-dark-900 text-sm group-hover:text-brand-600 transition-colors">{cat.name}</p>
              <p className="text-xs text-dark-400">{cat.count} products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
