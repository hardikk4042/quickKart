// src/components/common/StarRating.jsx
import { Star } from 'lucide-react';

export default function StarRating({ rating, count, size = 14, showCount = true, interactive = false, onRate }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <Star
              size={size}
              className={star <= Math.round(rating) ? 'text-brand-500 fill-brand-500' : 'text-dark-200 fill-dark-100'}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-dark-400 font-medium">
          {rating.toFixed(1)}{count !== undefined ? ` (${count.toLocaleString()})` : ''}
        </span>
      )}
    </div>
  );
}
