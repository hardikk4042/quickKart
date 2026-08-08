// src/components/common/CategoryCard.jsx
import { Link } from 'react-router-dom';

export default function CategoryCard({ category, size = 'md' }) {
  const sm = size === 'sm';
  return (
    <Link
      to={`/category/${category.slug}`}
      className="flex flex-col items-center gap-2 group cursor-pointer"
    >
      <div
        className={`flex items-center justify-center rounded-2xl transition-all duration-200 
                    group-hover:scale-105 group-hover:shadow-md
                    ${sm ? 'w-14 h-14 text-2xl' : 'w-16 h-16 sm:w-20 sm:h-20 text-3xl'}`}
        style={{ backgroundColor: category.bg }}
      >
        <span className={sm ? 'text-2xl' : 'text-3xl'}>{category.icon}</span>
      </div>
      <span className={`text-dark-700 font-medium text-center leading-tight group-hover:text-dark-900 
                        ${sm ? 'text-xs' : 'text-xs sm:text-sm'}`}>
        {category.name}
      </span>
    </Link>
  );
}
