// src/data/products.js
export const products = [
  // ── Dairy & Breakfast ───────────────────────────
  {
    id: 1, name: 'Amul Gold Full Cream Milk', brand: 'Amul', category: 'dairy-breakfast',
    subcategory: 'Milk', weight: '1 L', price: 68, originalPrice: 75, discount: 9,
    rating: 4.7, reviewCount: 1240, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80',
    description: 'Amul Gold full cream homogenised milk is rich in vitamins and calcium.',
    tags: ['milk', 'dairy', 'amul', 'full cream'],
    nutrition: { calories: 67, protein: '3.4g', fat: '3.5g', carbs: '4.7g' },
  },
  {
    id: 2, name: 'Mother Dairy Toned Milk', brand: 'Mother Dairy', category: 'dairy-breakfast',
    subcategory: 'Milk', weight: '500 ml', price: 28, originalPrice: 32, discount: 13,
    rating: 4.5, reviewCount: 890, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80',
    description: 'Fresh toned milk with reduced fat content. Ideal for daily use.',
    tags: ['milk', 'dairy', 'toned'],
    nutrition: { calories: 42, protein: '3.1g', fat: '1.5g', carbs: '4.8g' },
  },
  {
    id: 3, name: 'Amul Butter Salted', brand: 'Amul', category: 'dairy-breakfast',
    subcategory: 'Curd & Paneer', weight: '500 g', price: 265, originalPrice: 280, discount: 5,
    rating: 4.8, reviewCount: 2100, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80',
    description: 'Rich salted butter made from fresh cream.',
    tags: ['butter', 'dairy', 'amul'],
    nutrition: { calories: 720, protein: '0.9g', fat: '80g', carbs: '0.1g' },
  },
  {
    id: 4, name: 'Britannia NutriChoice Oats', brand: 'Britannia', category: 'dairy-breakfast',
    subcategory: 'Cereals', weight: '400 g', price: 79, originalPrice: 99, discount: 20,
    rating: 4.3, reviewCount: 540, inStock: true, isNew: true,
    image: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=400&q=80',
    description: 'Wholesome oats for a nutritious breakfast.',
    tags: ['oats', 'breakfast', 'healthy'],
    nutrition: { calories: 375, protein: '13g', fat: '7g', carbs: '60g' },
  },
  {
    id: 5, name: 'Farm Fresh Eggs', brand: 'Namami', category: 'dairy-breakfast',
    subcategory: 'Eggs', weight: '6 pcs', price: 72, originalPrice: 80, discount: 10,
    rating: 4.6, reviewCount: 670, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80',
    description: 'Farm-fresh eggs packed with protein.',
    tags: ['eggs', 'protein', 'fresh'],
    nutrition: { calories: 77, protein: '6.3g', fat: '5.3g', carbs: '0.6g' },
  },

  // ── Fruits & Vegetables ─────────────────────────
  {
    id: 6, name: 'Fresh Bananas', brand: 'Local Farm', category: 'fruits-vegetables',
    subcategory: 'Fresh Fruits', weight: '500 g (approx 5–6 pcs)', price: 38, originalPrice: 45, discount: 16,
    rating: 4.4, reviewCount: 380, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
    description: 'Fresh, ripe bananas. Rich in potassium and natural sugars.',
    tags: ['banana', 'fruit', 'fresh'],
    nutrition: { calories: 89, protein: '1.1g', fat: '0.3g', carbs: '23g' },
  },
  {
    id: 7, name: 'Red Tomatoes', brand: 'Green Valley', category: 'fruits-vegetables',
    subcategory: 'Fresh Vegetables', weight: '500 g', price: 29, originalPrice: 35, discount: 17,
    rating: 4.5, reviewCount: 280, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=400&q=80',
    description: 'Firm, ripe tomatoes picked fresh from farms.',
    tags: ['tomato', 'vegetable', 'fresh'],
    nutrition: { calories: 18, protein: '0.9g', fat: '0.2g', carbs: '3.9g' },
  },
  {
    id: 8, name: 'Himalayan Apples', brand: 'Kashmiri Orchards', category: 'fruits-vegetables',
    subcategory: 'Fresh Fruits', weight: '4 pcs (approx 700 g)', price: 149, originalPrice: 180, discount: 17,
    rating: 4.7, reviewCount: 520, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
    description: 'Crispy, sweet apples from the hills of Kashmir.',
    tags: ['apple', 'fruit', 'kashmir'],
    nutrition: { calories: 52, protein: '0.3g', fat: '0.2g', carbs: '14g' },
  },
  {
    id: 9, name: 'Baby Spinach', brand: 'Organic Farms', category: 'fruits-vegetables',
    subcategory: 'Fresh Vegetables', weight: '250 g', price: 45, originalPrice: 55, discount: 18,
    rating: 4.3, reviewCount: 190, inStock: true, isNew: true,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80',
    description: 'Tender baby spinach leaves, washed and ready to use.',
    tags: ['spinach', 'organic', 'greens'],
    nutrition: { calories: 23, protein: '2.9g', fat: '0.4g', carbs: '3.6g' },
  },
  {
    id: 10, name: 'Sweet Corn', brand: 'Green Valley', category: 'fruits-vegetables',
    subcategory: 'Fresh Vegetables', weight: '3 pcs', price: 55, originalPrice: 65, discount: 15,
    rating: 4.6, reviewCount: 340, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=400&q=80',
    description: 'Sweet, juicy corn perfect for boiling or roasting.',
    tags: ['corn', 'vegetable', 'fresh'],
    nutrition: { calories: 86, protein: '3.3g', fat: '1.4g', carbs: '19g' },
  },

  // ── Snacks ──────────────────────────────────────
  {
    id: 11, name: "Lay's Classic Salted Chips", brand: "Lay's", category: 'snacks',
    subcategory: 'Chips', weight: '73 g', price: 20, originalPrice: 20, discount: 0,
    rating: 4.5, reviewCount: 3400, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
    description: 'Crispy potato chips with the classic salted flavor.',
    tags: ['chips', 'snacks', 'lays'],
    nutrition: { calories: 536, protein: '6.5g', fat: '32g', carbs: '55g' },
  },
  {
    id: 12, name: 'Haldiram Aloo Bhujia', brand: 'Haldiram', category: 'snacks',
    subcategory: 'Namkeen', weight: '150 g', price: 45, originalPrice: 55, discount: 18,
    rating: 4.6, reviewCount: 2200, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80',
    description: 'Crispy bhujia made with aloo and spices.',
    tags: ['bhujia', 'namkeen', 'haldiram'],
    nutrition: { calories: 482, protein: '12g', fat: '26g', carbs: '52g' },
  },
  {
    id: 13, name: 'Kit Kat Chocolate', brand: 'Nestlé', category: 'snacks',
    subcategory: 'Chocolates', weight: '37 g', price: 30, originalPrice: 35, discount: 14,
    rating: 4.7, reviewCount: 4100, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80',
    description: 'Crispy wafer fingers covered in smooth chocolate.',
    tags: ['chocolate', 'kitkat', 'nestle'],
    nutrition: { calories: 519, protein: '6.7g', fat: '27g', carbs: '63g' },
  },
  {
    id: 14, name: 'Parle-G Original', brand: 'Parle', category: 'snacks',
    subcategory: 'Cookies', weight: '799 g', price: 94, originalPrice: 100, discount: 6,
    rating: 4.8, reviewCount: 5600, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80',
    description: 'The world-famous glucose biscuit. A classic Indian snack.',
    tags: ['biscuit', 'parle', 'glucose'],
    nutrition: { calories: 421, protein: '7g', fat: '9g', carbs: '73g' },
  },

  // ── Beverages ───────────────────────────────────
  {
    id: 15, name: 'Coca-Cola Can', brand: 'Coca-Cola', category: 'beverages',
    subcategory: 'Soft Drinks', weight: '330 ml', price: 40, originalPrice: 45, discount: 11,
    rating: 4.4, reviewCount: 1800, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80',
    description: 'The classic refreshing cola drink. Best served chilled.',
    tags: ['cola', 'drink', 'coke'],
    nutrition: { calories: 140, protein: '0g', fat: '0g', carbs: '39g' },
  },
  {
    id: 16, name: 'Raw Pressery Orange Juice', brand: 'Raw Pressery', category: 'beverages',
    subcategory: 'Juices', weight: '250 ml', price: 55, originalPrice: 70, discount: 21,
    rating: 4.5, reviewCount: 640, inStock: true, isNew: true,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
    description: '100% cold-pressed orange juice. No added sugar or preservatives.',
    tags: ['juice', 'orange', 'healthy', 'raw pressery'],
    nutrition: { calories: 47, protein: '0.7g', fat: '0.2g', carbs: '10.4g' },
  },
  {
    id: 17, name: 'Nescafé Classic Instant Coffee', brand: 'Nescafé', category: 'beverages',
    subcategory: 'Tea & Coffee', weight: '50 g', price: 130, originalPrice: 150, discount: 13,
    rating: 4.6, reviewCount: 2300, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1599579702478-42e48bde1aa6?w=400&q=80',
    description: 'Rich, aromatic instant coffee for a perfect cup every time.',
    tags: ['coffee', 'nescafe', 'instant'],
    nutrition: { calories: 2, protein: '0.1g', fat: '0g', carbs: '0.3g' },
  },
  {
    id: 18, name: 'Tata Tea Premium', brand: 'Tata', category: 'beverages',
    subcategory: 'Tea & Coffee', weight: '250 g', price: 120, originalPrice: 145, discount: 17,
    rating: 4.7, reviewCount: 1700, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    description: 'A perfect blend of Assam and Darjeeling teas.',
    tags: ['tea', 'tata', 'premium'],
    nutrition: { calories: 2, protein: '0g', fat: '0g', carbs: '0.4g' },
  },

  // ── Instant Food ────────────────────────────────
  {
    id: 19, name: 'Maggi 2-Minute Noodles', brand: 'Nestlé', category: 'instant-food',
    subcategory: 'Noodles', weight: '420 g (6 packs)', price: 72, originalPrice: 84, discount: 14,
    rating: 4.7, reviewCount: 6200, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    description: "India's favourite instant noodles. Ready in 2 minutes.",
    tags: ['noodles', 'maggi', 'instant'],
    nutrition: { calories: 378, protein: '10g', fat: '11g', carbs: '59g' },
  },
  {
    id: 20, name: 'Knorr Classic Tomato Soup', brand: 'Knorr', category: 'instant-food',
    subcategory: 'Soups', weight: '53 g (4 servings)', price: 50, originalPrice: 60, discount: 17,
    rating: 4.4, reviewCount: 820, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    description: 'Rich tomato flavored instant soup. Just add hot water.',
    tags: ['soup', 'knorr', 'instant', 'tomato'],
    nutrition: { calories: 80, protein: '2g', fat: '1.5g', carbs: '15g' },
  },

  // ── Bakery ──────────────────────────────────────
  {
    id: 21, name: 'Britannia Whole Wheat Bread', brand: 'Britannia', category: 'bakery',
    subcategory: 'Bread', weight: '400 g', price: 52, originalPrice: 60, discount: 13,
    rating: 4.5, reviewCount: 1100, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    description: 'Soft whole wheat bread with added fiber. Perfect for sandwiches.',
    tags: ['bread', 'wheat', 'britannia'],
    nutrition: { calories: 247, protein: '9g', fat: '3g', carbs: '46g' },
  },
  {
    id: 22, name: 'Pillsbury Croissant', brand: 'Pillsbury', category: 'bakery',
    subcategory: 'Pastry', weight: '2 pcs', price: 65, originalPrice: 80, discount: 19,
    rating: 4.3, reviewCount: 430, inStock: true, isNew: true,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
    description: 'Buttery, flaky croissants baked fresh daily.',
    tags: ['croissant', 'bakery', 'breakfast'],
    nutrition: { calories: 406, protein: '8.2g', fat: '21g', carbs: '45g' },
  },

  // ── Personal Care ───────────────────────────────
  {
    id: 23, name: 'Dove Body Wash', brand: 'Dove', category: 'personal-care',
    subcategory: 'Body Wash', weight: '250 ml', price: 185, originalPrice: 220, discount: 16,
    rating: 4.6, reviewCount: 1340, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80',
    description: 'Moisturizing body wash with ¼ moisturizing cream.',
    tags: ['dove', 'body wash', 'skin care'],
    nutrition: null,
  },
  {
    id: 24, name: 'Colgate MaxFresh Toothpaste', brand: 'Colgate', category: 'personal-care',
    subcategory: 'Dental Care', weight: '150 g', price: 95, originalPrice: 110, discount: 14,
    rating: 4.7, reviewCount: 2890, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80',
    description: 'Whitening toothpaste with breath strips for lasting freshness.',
    tags: ['toothpaste', 'colgate', 'dental'],
    nutrition: null,
  },

  // ── Household ───────────────────────────────────
  {
    id: 25, name: 'Vim Dishwash Liquid', brand: 'Vim', category: 'household',
    subcategory: 'Kitchen', weight: '500 ml', price: 89, originalPrice: 105, discount: 15,
    rating: 4.5, reviewCount: 1560, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80',
    description: 'Effective dish cleaning liquid with lemon power.',
    tags: ['dishwash', 'vim', 'cleaning'],
    nutrition: null,
  },
  {
    id: 26, name: 'Ariel Liquid Detergent', brand: 'Ariel', category: 'household',
    subcategory: 'Laundry', weight: '1 L', price: 299, originalPrice: 360, discount: 17,
    rating: 4.6, reviewCount: 890, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    description: 'Superior cleaning liquid detergent for all fabrics.',
    tags: ['detergent', 'ariel', 'laundry'],
    nutrition: null,
  },
  {
    id: 27, name: 'Harpic Power Plus', brand: 'Harpic', category: 'household',
    subcategory: 'Bathroom', weight: '500 ml', price: 125, originalPrice: 150, discount: 17,
    rating: 4.4, reviewCount: 670, inStock: true, isNew: false,
    image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&q=80',
    description: '10× more power to remove tough toilet stains.',
    tags: ['harpic', 'toilet cleaner', 'household'],
    nutrition: null,
  },

  // ── Out of Stock ─────────────────────────────────
  {
    id: 28, name: 'Amul Ice Cream Vanilla', brand: 'Amul', category: 'dairy-breakfast',
    subcategory: 'Ice Cream', weight: '1 L', price: 180, originalPrice: 200, discount: 10,
    rating: 4.5, reviewCount: 760, inStock: false, isNew: false,
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
    description: 'Creamy vanilla ice cream. Out of stock temporarily.',
    tags: ['ice cream', 'amul', 'dairy'],
    nutrition: { calories: 210, protein: '3.5g', fat: '11g', carbs: '25g' },
  },
];

// Helper: get by category
export const getByCategory = (slug) => products.filter(p => p.category === slug);

// Helper: get trending (top rated)
export const getTrending = () => [...products].sort((a, b) => b.rating - a.rating).slice(0, 10);

// Helper: get best sellers (most reviews)
export const getBestSellers = () => [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10);

// Helper: get deals (highest discount)
export const getTopDeals = () => [...products].filter(p => p.discount > 10).sort((a, b) => b.discount - a.discount).slice(0, 10);

// Helper: get fresh picks (fruits-vegetables + dairy)
export const getFreshPicks = () => products.filter(p => ['fruits-vegetables', 'dairy-breakfast'].includes(p.category)).slice(0, 10);
