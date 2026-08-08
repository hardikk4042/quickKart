// src/components/common/QuantityControl.jsx
import { Minus, Plus } from 'lucide-react';

export default function QuantityControl({ quantity, onIncrease, onDecrease, min = 1, max = 20, size = 'md' }) {
  const sm = size === 'sm';
  return (
    <div className={`flex items-center gap-1 bg-brand-500 rounded-lg ${sm ? 'h-7' : 'h-9'}`}>
      <button
        onClick={onDecrease}
        disabled={quantity <= min}
        className={`flex items-center justify-center text-dark-900 hover:bg-brand-600 rounded-l-lg 
                    transition-colors disabled:opacity-40 ${sm ? 'w-7' : 'w-9 h-9'}`}
      >
        <Minus size={sm ? 12 : 14} strokeWidth={2.5} />
      </button>
      <span className={`font-bold text-dark-900 min-w-[20px] text-center ${sm ? 'text-xs' : 'text-sm'}`}>
        {quantity}
      </span>
      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className={`flex items-center justify-center text-dark-900 hover:bg-brand-600 rounded-r-lg 
                    transition-colors disabled:opacity-40 ${sm ? 'w-7' : 'w-9 h-9'}`}
      >
        <Plus size={sm ? 12 : 14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
