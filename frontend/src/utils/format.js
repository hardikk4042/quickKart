// src/utils/format.js

export const formatPrice = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`;

export const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export const statusLabel = (status) => ({
  confirmed:        'Order Confirmed',
  packing:          'Being Packed',
  ready:            'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
}[status] || status);

export const statusColor = (status) => ({
  confirmed:        'text-blue-600 bg-blue-50',
  packing:          'text-amber-600 bg-amber-50',
  ready:            'text-purple-600 bg-purple-50',
  out_for_delivery: 'text-brand-600 bg-brand-50',
  delivered:        'text-green-600 bg-green-50',
  cancelled:        'text-red-600 bg-red-50',
}[status] || 'text-gray-600 bg-gray-50');
