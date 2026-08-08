// src/data/notifications.js
export const mockNotifications = [
  {
    id: 1, type: 'order', icon: '📦',
    title: 'Your order has been packed',
    body: 'Order #QK10293 is packed and ready for pickup.',
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 2, type: 'payment', icon: '💳',
    title: 'Payment successful',
    body: 'Payment of ₹224 for order #QK10293 was successful.',
    time: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: 3, type: 'offer', icon: '🎉',
    title: 'You received a ₹100 coupon!',
    body: 'Use code SAVE100 to get ₹100 off on orders above ₹500.',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 4, type: 'order', icon: '✅',
    title: 'Order delivered',
    body: 'Order #QK10291 has been delivered. Rate your experience.',
    time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
  {
    id: 5, type: 'offer', icon: '🔥',
    title: 'Weekend Mega Sale!',
    body: 'Up to 40% off on fresh fruits & vegetables this weekend.',
    time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];

// src/data/addresses.js
export const mockAddresses = [
  {
    id: 1, label: 'Home', isDefault: true,
    name: 'Hardik', phone: '9876543210',
    house: 'H.No 42', street: 'Sector 14',
    city: 'Rajpura', state: 'Punjab', pincode: '140401',
    landmark: 'Near Punjab National Bank',
    lat: 30.4833, lng: 76.5833,
  },
  {
    id: 2, label: 'Work', isDefault: false,
    name: 'Hardik', phone: '9876543210',
    house: 'B-201', street: 'Industrial Area Phase 1',
    city: 'Chandigarh', state: 'Punjab', pincode: '160001',
    landmark: 'Near ISBT',
    lat: 30.7333, lng: 76.7794,
  },
];

// src/data/user.js
export const mockUser = {
  id: 1,
  name: 'Hardik',
  email: 'hardik@quickkart.com',
  phone: '9876543210',
  avatar: null,
  joinedAt: '2025-01-15',
  totalOrders: 12,
  totalSpent: 4280,
};
