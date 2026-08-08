// src/data/categories.js
export const categories = [
  { id: 1,  slug: 'fruits-vegetables',  name: 'Fruits & Vegetables', icon: '🥦', color: '#22C55E', bg: '#DCFCE7', count: 120 },
  { id: 2,  slug: 'dairy-breakfast',    name: 'Dairy & Breakfast',   icon: '🥛', color: '#3B82F6', bg: '#DBEAFE', count: 85  },
  { id: 3,  slug: 'snacks',             name: 'Snacks & Munchies',   icon: '🍿', color: '#F59E0B', bg: '#FEF3C7', count: 200 },
  { id: 4,  slug: 'beverages',          name: 'Beverages',           icon: '🧃', color: '#8B5CF6', bg: '#EDE9FE', count: 95  },
  { id: 5,  slug: 'instant-food',       name: 'Instant Food',        icon: '🍜', color: '#EF4444', bg: '#FEE2E2', count: 60  },
  { id: 6,  slug: 'personal-care',      name: 'Personal Care',       icon: '🧴', color: '#EC4899', bg: '#FCE7F3', count: 110 },
  { id: 7,  slug: 'household',          name: 'Household',           icon: '🧹', color: '#06B6D4', bg: '#CFFAFE', count: 75  },
  { id: 8,  slug: 'bakery',             name: 'Bakery & Biscuits',   icon: '🍞', color: '#D97706', bg: '#FEF3C7', count: 55  },
  { id: 9,  slug: 'stationery',         name: 'Stationery',          icon: '📝', color: '#6366F1', bg: '#E0E7FF', count: 40  },
  { id: 10, slug: 'electronics',        name: 'Electronics',         icon: '🔌', color: '#1F2937', bg: '#F3F4F6', count: 30  },
];

export const subcategories = {
  'fruits-vegetables': [
    { id: 11, name: 'Fresh Fruits',   icon: '🍎' },
    { id: 12, name: 'Fresh Vegetables', icon: '🥕' },
    { id: 13, name: 'Herbs & Seasonings', icon: '🌿' },
    { id: 14, name: 'Exotic Fruits',  icon: '🥭' },
  ],
  'dairy-breakfast': [
    { id: 21, name: 'Milk',        icon: '🥛' },
    { id: 22, name: 'Curd & Paneer', icon: '🧀' },
    { id: 23, name: 'Eggs',        icon: '🥚' },
    { id: 24, name: 'Cereals',     icon: '🌾' },
  ],
  'snacks': [
    { id: 31, name: 'Chips',       icon: '🥔' },
    { id: 32, name: 'Namkeen',     icon: '🫛' },
    { id: 33, name: 'Chocolates',  icon: '🍫' },
    { id: 34, name: 'Cookies',     icon: '🍪' },
  ],
};
