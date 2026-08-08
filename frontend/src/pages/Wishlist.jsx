// src/pages/Wishlist.jsx
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart } from 'lucide-react';
import useWishlistStore from '@store/wishlistStore';
import { useCart } from '@hooks/useCart';
import EmptyState from '@components/common/EmptyState';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const { items, removeItem } = useWishlistStore();
  const { addToCart, isInCart } = useCart();

  const handleMoveToCart = (item) => {
    addToCart(item);
    removeItem(item.id);
    toast.success('Moved to cart!');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">
        My Wishlist {items.length > 0 && <span className="text-dark-400 text-lg font-normal">({items.length})</span>}
      </h1>

      {items.length === 0 ? (
        <EmptyState
          type="wishlist"
          title="Your wishlist is empty"
          subtitle="Save products you love and come back to them anytime."
          actionHref="/"
          actionLabel="Discover Products"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-3xl shadow-card overflow-hidden group">
              <Link to={`/product/${item.id}`} className="block relative aspect-video overflow-hidden bg-dark-50">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {item.discount > 0 && (
                  <span className="absolute top-3 left-3 badge-discount">{item.discount}% OFF</span>
                )}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="badge-out font-semibold">Out of Stock</span>
                  </div>
                )}
              </Link>
              <div className="p-4">
                <p className="text-xs text-dark-400 mb-0.5">{item.brand}</p>
                <Link to={`/product/${item.id}`}>
                  <h3 className="font-semibold text-dark-900 text-sm line-clamp-2 hover:text-brand-600 transition-colors mb-1">{item.name}</h3>
                </Link>
                <p className="text-xs text-dark-400 mb-3">{item.weight}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-dark-900">₹{item.price}</span>
                    {item.originalPrice > item.price && (
                      <span className="text-xs text-dark-300 line-through ml-1">₹{item.originalPrice}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeItem(item.id)} className="p-2 text-dark-300 hover:text-error transition-colors">
                      <Trash2 size={15} />
                    </button>
                    {item.inStock && (
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                                    ${isInCart(item.id) ? 'bg-brand-500 text-dark-900' : 'border-2 border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-dark-900'}`}
                      >
                        <ShoppingCart size={13} />
                        {isInCart(item.id) ? 'In Cart' : 'Add'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
