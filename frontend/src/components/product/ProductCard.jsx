// src/components/product/ProductCard.jsx
import { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import useWishlistStore from '@store/wishlistStore';
import QuantityControl from '@components/common/QuantityControl';

export default function ProductCard({ product }) {
  const { isInCart, getItem, addToCart, updateQty, removeFromCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const inCart    = isInCart(product.id);
  const cartItem  = getItem(product.id);
  const inWish    = isInWishlist(product.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    setAdding(true);
    addToCart(product);
    setTimeout(() => setAdding(false), 400);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl border border-dark-50 hover:border-brand-200 hover:shadow-card-hover
                 transition-all duration-200 overflow-hidden block relative"
    >
      {/* Image */}
      <div className="relative bg-dark-50 aspect-square overflow-hidden">
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-dark-50">🛍️</div>
        )}

        {/* Discount badge */}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 badge-discount text-xs">
            {product.discount}% OFF
          </span>
        )}
        {product.isNew && !product.discount && (
          <span className="absolute top-2 left-2 badge-new text-xs">NEW</span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge-out text-xs font-semibold px-3 py-1">Out of Stock</span>
          </div>
        )}
        {product.inStock && product.stockStatus === 'Low Stock' && (
          <div className="absolute bottom-2 left-2 flex items-center justify-center">
            <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[10px] font-bold px-2 py-0.5">Low Stock</span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full 
                     opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
        >
          <Heart
            size={14}
            className={inWish ? 'fill-red-500 text-red-500' : 'text-dark-400'}
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-dark-400 font-medium mb-0.5">{product.brand}</p>
        <h3 className="text-sm font-semibold text-dark-900 line-clamp-2 leading-tight mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-dark-400 mb-2">{product.weight}</p>

        {/* Price + Add */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-dark-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-dark-300 line-through ml-1">₹{product.originalPrice}</span>
            )}
          </div>

          {product.inStock ? (
            inCart ? (
              <QuantityControl
                quantity={cartItem?.quantity || 1}
                onIncrease={(e) => { e?.preventDefault?.(); e?.stopPropagation?.(); updateQty(product.id, (cartItem?.quantity || 1) + 1); }}
                onDecrease={(e) => {
                  e?.preventDefault?.(); e?.stopPropagation?.();
                  const qty = (cartItem?.quantity || 1) - 1;
                  if (qty <= 0) removeFromCart(product);
                  else updateQty(product.id, qty);
                }}
                size="sm"
              />
            ) : (
              <button
                onClick={handleAdd}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold 
                            border-2 border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-dark-900
                            transition-all duration-200 press-effect
                            ${adding ? 'scale-90' : ''}`}
              >
                <Plus size={12} strokeWidth={3} />
                ADD
              </button>
            )
          ) : null}
        </div>
      </div>
    </Link>
  );
}
