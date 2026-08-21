// src/pages/ProductDetails.jsx
// Detailed product view with multi-image gallery, real-time stock alert, price details, and similar items

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, Share2, Truck, Clock, ShieldCheck, Plus } from 'lucide-react';
import { productAPI } from '@services/product.api';
import { useCart } from '@hooks/useCart';
import useWishlistStore from '@store/wishlistStore';
import StarRating from '@components/common/StarRating';
import QuantityControl from '@components/common/QuantityControl';
import ProductSection from '@components/product/ProductSection';
import { ErrorState } from '@components/common/EmptyState';
import SkeletonBox from '@components/common/SkeletonLoader';

function ProductDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <SkeletonBox className="h-80 w-full rounded-3xl" />
      <div className="space-y-4 py-4">
        <SkeletonBox className="h-6 w-1/3" />
        <SkeletonBox className="h-8 w-2/3" />
        <SkeletonBox className="h-5 w-1/4" />
        <SkeletonBox className="h-10 w-1/3" />
        <SkeletonBox className="h-12 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct]   = useState(null);
  const [similar, setSimilar]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [imgIdx, setImgIdx]     = useState(0);
  const { isInCart, getItem, addToCart, updateQty, removeFromCart } = useCart();
  const { isInWishlist, toggleItem } = useWishlistStore();

  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [p, s] = await Promise.all([productAPI.getProduct(id), productAPI.getSimilar(id)]);
        setProduct(p);
        setSimilar(s);
        document.title = `${p.name} — QuickKart`;
      } catch (e) {
        setError(e.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <ProductDetailSkeleton />;
  if (error)   return <div className="max-w-2xl mx-auto px-4 py-16"><ErrorState message={error} /></div>;
  if (!product) return null;

  const inCart   = isInCart(product.id);
  const cartItem = getItem(product.id);
  const inWish   = isInWishlist(product.id);

  // Support product.images array if provided by API, otherwise fallback to product.image
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image, product.image, product.image];

  const categorySlug = typeof product.category === 'string'
    ? product.category
    : (product.category?.slug || '');

  const categoryLabel = categorySlug ? categorySlug.replace(/-/g, ' ') : 'Category';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-dark-400 mb-6" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-dark-700">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/category/${categorySlug}`} className="hover:text-dark-700 capitalize">{categoryLabel}</Link>
        <ChevronRight size={12} />
        <span className="text-dark-600 font-medium truncate max-w-[150px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image Gallery */}
        <div>
          <div className="bg-dark-50 rounded-3xl overflow-hidden aspect-square mb-3 relative">
            <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            {product.discount > 0 && (
              <span className="absolute top-4 left-4 badge-discount text-sm px-2 py-1">{product.discount}% OFF</span>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="badge-out text-base font-bold px-4 py-2">Out of Stock</span>
              </div>
            )}
            {product.inStock && product.stockStatus === 'Low Stock' && (
              <div className="absolute bottom-4 left-4 flex items-center justify-center">
                <span className="bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-sm font-bold px-3 py-1">Low Stock</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-brand-500' : 'border-dark-100'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="py-2">
          <p className="text-sm text-dark-400 font-medium mb-1">{product.brand}</p>
          <h1 className="text-2xl font-extrabold text-dark-900 mb-2 leading-tight">{product.name}</h1>
          <p className="text-sm text-dark-500 mb-3">{product.weight}</p>

          <StarRating rating={product.rating} count={product.reviewCount} size={16} />

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-4 mb-6">
            <span className="text-3xl font-extrabold text-dark-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-xl text-dark-300 line-through">₹{product.originalPrice}</span>
                <span className="badge-discount text-sm">{product.discount}% OFF</span>
              </>
            )}
          </div>

          {/* Delivery info */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-green-600" />
              <div>
                <p className="text-sm font-bold text-green-700">Delivery in 10–20 minutes</p>
                <p className="text-xs text-green-600">Order now for fastest delivery</p>
              </div>
            </div>
          </div>

          {/* Cart actions */}
          {product.inStock ? (
            inCart ? (
              <div className="flex items-center gap-4 mb-6">
                <QuantityControl
                  quantity={cartItem?.quantity || 1}
                  onIncrease={() => updateQty(product.id, (cartItem?.quantity || 1) + 1)}
                  onDecrease={() => {
                    const qty = (cartItem?.quantity || 1) - 1;
                    if (qty <= 0) removeFromCart(product);
                    else updateQty(product.id, qty);
                  }}
                />
                <Link to="/cart" className="btn-secondary flex-1 text-center">View Cart</Link>
              </div>
            ) : (
              <button onClick={() => addToCart(product)} className="btn-primary w-full py-3 text-base mb-6 flex items-center justify-center gap-2">
                <Plus size={18} /> Add to Cart
              </button>
            )
          ) : (
            <button disabled className="w-full py-3 rounded-xl font-bold text-dark-400 bg-dark-100 mb-6 cursor-not-allowed">Out of Stock</button>
          )}

          {/* Wishlist + Share */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => toggleItem(product)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all
                          ${inWish ? 'border-red-300 bg-red-50 text-red-500' : 'border-dark-200 hover:border-red-300 text-dark-600'}`}
            >
              <Heart size={16} fill={inWish ? 'currentColor' : 'none'} />
              {inWish ? 'Wishlisted' : 'Wishlist'}
            </button>
            <button
              onClick={() => { if (navigator.share) navigator.share({ title: product.name, url: window.location.href }); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dark-200 hover:border-dark-400 font-semibold text-sm text-dark-600 transition-all"
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex gap-4 text-xs text-dark-500">
            <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> 100% Genuine</div>
            <div className="flex items-center gap-1.5"><Truck size={14} className="text-blue-500" /> Free delivery on ₹399+</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="bg-white rounded-3xl p-6 mb-6 shadow-card">
        <h2 className="text-lg font-bold text-dark-900 mb-3">About this product</h2>
        <p className="text-dark-600 text-sm leading-relaxed">{product.description}</p>
      </section>

      {/* Nutrition */}
      {product.nutrition && (
        <section className="bg-white rounded-3xl p-6 mb-6 shadow-card">
          <h2 className="text-lg font-bold text-dark-900 mb-4">Nutritional Information</h2>
          <p className="text-xs text-dark-400 mb-3">Per 100g serving</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(product.nutrition).map(([k, v]) => (
              <div key={k} className="bg-dark-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-dark-900">{v}</p>
                <p className="text-xs text-dark-400 capitalize">{k}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Similar products */}
      {similar.length > 0 && (
        <ProductSection title="Similar Products" products={similar} />
      )}
    </div>
  );
}
