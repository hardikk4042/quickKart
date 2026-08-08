// src/data/orders.js
export const mockOrders = [
  {
    id: 'QK10293',
    status: 'out_for_delivery',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    estimatedDelivery: '8 minutes',
    address: { label: 'Home', line: 'H.No 42, Sector 14, Rajpura, Punjab 140401' },
    items: [
      { id: 1, name: 'Amul Gold Full Cream Milk', weight: '1 L', price: 68, quantity: 2, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80' },
      { id: 21, name: 'Britannia Whole Wheat Bread', weight: '400 g', price: 52, quantity: 1, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80' },
      { id: 6, name: 'Fresh Bananas', weight: '500 g', price: 38, quantity: 1, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&q=80' },
    ],
    pricing: { subtotal: 226, deliveryFee: 20, discount: 30, tax: 8, total: 224 },
    coupon: 'SAVE30',
    payment: { method: 'UPI', status: 'paid', transactionId: 'TXN929382838' },
    delivery: {
      partner: { name: 'Rahul Kumar', phone: '9876543210', rating: 4.8, totalDeliveries: 1240, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
    },
    timeline: [
      { status: 'Order Confirmed',       time: new Date(Date.now() - 12 * 60 * 1000).toISOString(), done: true },
      { status: 'Store is packing',      time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), done: true },
      { status: 'Ready for pickup',      time: new Date(Date.now() -  6 * 60 * 1000).toISOString(), done: true },
      { status: 'Out for delivery',      time: new Date(Date.now() -  4 * 60 * 1000).toISOString(), done: true },
      { status: 'Delivered',             time: null, done: false },
    ],
  },
  {
    id: 'QK10291',
    status: 'delivered',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 22 * 60 * 1000).toISOString(),
    address: { label: 'Home', line: 'H.No 42, Sector 14, Rajpura, Punjab 140401' },
    items: [
      { id: 11, name: "Lay's Classic Salted Chips", weight: '73 g', price: 20, quantity: 3, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&q=80' },
      { id: 15, name: 'Coca-Cola Can', weight: '330 ml', price: 40, quantity: 4, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&q=80' },
      { id: 13, name: 'Kit Kat Chocolate', weight: '37 g', price: 30, quantity: 2, image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=200&q=80' },
    ],
    pricing: { subtotal: 280, deliveryFee: 0, discount: 50, tax: 10, total: 240 },
    coupon: 'FREESHIP',
    payment: { method: 'Card', status: 'paid', transactionId: 'TXN929382699' },
    delivery: {
      partner: { name: 'Vikram Singh', phone: '9876500001', rating: 4.6, totalDeliveries: 890 },
    },
    timeline: [
      { status: 'Order Confirmed',  done: true },
      { status: 'Store is packing', done: true },
      { status: 'Ready for pickup', done: true },
      { status: 'Out for delivery', done: true },
      { status: 'Delivered',        done: true },
    ],
    rated: false,
  },
  {
    id: 'QK10285',
    status: 'cancelled',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    cancelledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    cancelReason: 'Customer cancelled the order',
    address: { label: 'Home', line: 'H.No 42, Sector 14, Rajpura, Punjab 140401' },
    items: [
      { id: 19, name: 'Maggi 2-Minute Noodles', weight: '420 g', price: 72, quantity: 2, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&q=80' },
    ],
    pricing: { subtotal: 144, deliveryFee: 20, discount: 0, tax: 5, total: 169 },
    coupon: null,
    payment: { method: 'COD', status: 'refunded', transactionId: null },
  },
];

export const getActiveOrders = () => mockOrders.filter(o => ['placed', 'confirmed', 'packing', 'ready', 'out_for_delivery'].includes(o.status));
export const getPastOrders  = () => mockOrders.filter(o => ['delivered', 'cancelled'].includes(o.status));
