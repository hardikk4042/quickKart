// src/pages/ReviewPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import StarRating from '@components/common/StarRating';
import toast from 'react-hot-toast';

export default function ReviewPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [productRating,  setProductRating]  = useState(0);
  const [deliveryRating, setDeliveryRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (productRating === 0) { toast.error('Please rate the product'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Review submitted! Thank you 🙏');
    setSubmitting(false);
    navigate('/orders');
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <div className="bg-white rounded-3xl shadow-card p-8">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">⭐</span>
          <h1 className="text-2xl font-extrabold text-dark-900">Rate Your Experience</h1>
          <p className="text-dark-400 text-sm mt-1">Order #{orderId}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product rating */}
          <div className="bg-dark-50 rounded-2xl p-5">
            <p className="font-semibold text-dark-900 mb-3">Product Quality</p>
            <StarRating
              rating={productRating}
              showCount={false}
              interactive
              onRate={setProductRating}
              size={32}
            />
            <p className="text-xs text-dark-400 mt-2">
              {productRating === 0 ? 'Tap to rate' :
               productRating <= 2 ? 'Poor 😞' :
               productRating === 3 ? 'Average 😐' :
               productRating === 4 ? 'Good 😊' : 'Excellent 🤩'}
            </p>
          </div>

          {/* Delivery rating */}
          <div className="bg-dark-50 rounded-2xl p-5">
            <p className="font-semibold text-dark-900 mb-3">Delivery Experience</p>
            <StarRating
              rating={deliveryRating}
              showCount={false}
              interactive
              onRate={setDeliveryRating}
              size={32}
            />
            <p className="text-xs text-dark-400 mt-2">
              {deliveryRating === 0 ? 'Tap to rate' :
               deliveryRating <= 2 ? 'Poor 😞' :
               deliveryRating === 3 ? 'Average 😐' :
               deliveryRating === 4 ? 'Good 😊' : 'Lightning fast 🚀'}
            </p>
          </div>

          {/* Text review */}
          <div>
            <label className="text-sm font-semibold text-dark-700 mb-2 block">Write a Review (optional)</label>
            <textarea
              value={review}
              onChange={e => setReview(e.target.value)}
              placeholder="Tell us about your experience — the freshness, packaging, delivery speed..."
              rows={4}
              className="input resize-none"
            />
          </div>

          <button type="submit" disabled={submitting || productRating === 0}
            className="btn-primary w-full py-3.5 text-base disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><CheckCircle size={18} /> Submit Review</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
