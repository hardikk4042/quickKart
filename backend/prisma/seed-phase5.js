'use strict';

/**
 * prisma/seed-phase5.js
 *
 * Phase 5 — QuickKart Comprehensive Product Catalog Seed
 * 25+ categories | 310+ products | 40+ brands
 *
 * Safe to run multiple times (upsert by slug).
 * Does NOT delete existing data.
 *
 * All prices stored in paise (₹1 = 100 paise).
 * e.g. ₹68 → 6800 paise
 */

require('dotenv').config();
const prisma = require('../src/config/database');

// ── Slug generator ────────────────────────────────────────────
function slug(name) {
  return name.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ── Unsplash helper (better-matched stock photos as fallback) ─
const U = (id) => `https://images.unsplash.com/photo-${id}?w=400&q=80`;

// Default fallback image (Indian grocery store)
const FALLBACK = U('1542838132-92c53300491e');

// ── Real product image URLs ────────────────────────────────────
// Sources: Open Food Facts CDN (images.openfoodfacts.org),
//          Wikimedia Commons (upload.wikimedia.org),
//          Official brand CDNs.
// All URLs are publicly accessible and free to use.
const REAL_IMAGES = {
  // ── DAIRY ──────────────────────────────────────────────────
// 'Amul Gold Full Cream Milk':          'https://images.openfoodfacts.org/images/products/890/102/205/9020/front_en.4.400.jpg', // 404 ERROR
// 'Amul Taaza Toned Milk':              'https://images.openfoodfacts.org/images/products/890/102/205/9020/front_en.4.400.jpg', // 404 ERROR
// 'Mother Dairy Toned Milk':            'https://images.openfoodfacts.org/images/products/890/102/700/5024/front_en.6.400.jpg', // 404 ERROR
// 'Mother Dairy Full Cream Milk':       'https://images.openfoodfacts.org/images/products/890/102/700/5024/front_en.6.400.jpg', // 404 ERROR
// 'Amul Butter Salted':                 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Amul_butter.jpg/320px-Amul_butter.jpg', // 404 ERROR
// 'Farm Fresh Eggs':                    'https://images.openfoodfacts.org/images/products/400/113/315/9040/front_en.29.400.jpg', // 404 ERROR
// 'Mother Dairy Fresh Curd':            'https://images.openfoodfacts.org/images/products/890/102/700/5024/front_en.6.400.jpg', // 404 ERROR
// 'Amul Masti Dahi':                    'https://images.openfoodfacts.org/images/products/890/102/206/3010/front_en.5.400.jpg', // 404 ERROR
// 'Milky Mist Paneer':                  'https://images.openfoodfacts.org/images/products/890/166/500/0011/front_en.11.400.jpg', // 404 ERROR
// 'Amul Processed Cheese':              'https://images.openfoodfacts.org/images/products/890/102/205/2062/front_en.12.400.jpg', // 404 ERROR
// 'Amul Pure Cow Ghee':                 'https://images.openfoodfacts.org/images/products/890/102/205/2024/front_en.3.400.jpg', // 404 ERROR
// 'Nandini Pure Ghee':                  'https://images.openfoodfacts.org/images/products/890/102/205/2024/front_en.3.400.jpg', // 404 ERROR
// 'Britannia White Bread':              'https://images.openfoodfacts.org/images/products/890/140/100/4003/front_en.6.400.jpg', // 404 ERROR
// 'Britannia Whole Wheat Bread':        'https://images.openfoodfacts.org/images/products/890/140/100/4003/front_en.6.400.jpg', // 404 ERROR
// 'Britannia NutriChoice Oats':         'https://images.openfoodfacts.org/images/products/890/140/100/9015/front_en.5.400.jpg', // 404 ERROR
// 'Amul Kool Chocolate Milk':           'https://images.openfoodfacts.org/images/products/890/102/205/2086/front_en.8.400.jpg', // 404 ERROR
// 'Amul Lassi (Sweet)':                 'https://images.openfoodfacts.org/images/products/890/102/205/2086/front_en.8.400.jpg', // 404 ERROR

  // ── STAPLES ────────────────────────────────────────────────
// 'Aashirvaad Select Atta':             'https://images.openfoodfacts.org/images/products/890/114/300/0038/front_en.6.400.jpg', // 404 ERROR
// 'Aashirvaad Multigrain Atta':         'https://images.openfoodfacts.org/images/products/890/114/300/0045/front_en.3.400.jpg', // 404 ERROR
// 'Fortune Chakki Fresh Atta':          'https://images.openfoodfacts.org/images/products/890/500/400/0008/front_en.3.400.jpg', // 404 ERROR
// 'India Gate Super Basmati Rice':      'https://images.openfoodfacts.org/images/products/890/104/701/0012/front_en.5.400.jpg', // 404 ERROR
// 'Dawat Super Basmati Rice':           'https://images.openfoodfacts.org/images/products/890/104/701/0012/front_en.5.400.jpg', // 404 ERROR
// 'Kohinoor Platinum Basmati':          'https://images.openfoodfacts.org/images/products/890/104/701/0012/front_en.5.400.jpg', // 404 ERROR
// 'Tata Sampann Toor Dal':              'https://images.openfoodfacts.org/images/products/890/114/102/0005/front_en.3.400.jpg', // 404 ERROR
// 'Tata Sampann Moong Dal':             'https://images.openfoodfacts.org/images/products/890/114/102/0005/front_en.3.400.jpg', // 404 ERROR
// 'Tata Sampann Rajma':                 'https://images.openfoodfacts.org/images/products/890/114/102/0050/front_en.7.400.jpg', // 404 ERROR
// 'Tata Sampann Chana Dal':             'https://images.openfoodfacts.org/images/products/890/114/102/0050/front_en.7.400.jpg', // 404 ERROR

  // ── OILS MASALA ────────────────────────────────────────────
// 'Fortune Sunflower Oil':              'https://images.openfoodfacts.org/images/products/890/500/400/0015/front_en.3.400.jpg', // 404 ERROR
// 'Saffola Total Oil':                  'https://images.openfoodfacts.org/images/products/890/148/400/1019/front_en.8.400.jpg', // 404 ERROR
// 'MDH Garam Masala':                   'https://images.openfoodfacts.org/images/products/890/117/000/1012/front_en.7.400.jpg', // 404 ERROR
// 'MDH Chole Masala':                   'https://images.openfoodfacts.org/images/products/890/117/000/1012/front_en.7.400.jpg', // 404 ERROR
// 'Everest Kitchen King Masala':        'https://images.openfoodfacts.org/images/products/890/113/100/0017/front_en.5.400.jpg', // 404 ERROR
// 'Everest Sambhar Masala':             'https://images.openfoodfacts.org/images/products/890/113/100/0017/front_en.5.400.jpg', // 404 ERROR
// 'Tata Salt':                          'https://images.openfoodfacts.org/images/products/890/122/300/1002/front_en.4.400.jpg', // 404 ERROR

  // ── SNACKS ─────────────────────────────────────────────────
// "Lay's Classic Salted Chips":         'https://images.openfoodfacts.org/images/products/890/178/000/4503/front_en.11.400.jpg', // 404 ERROR
// "Lay's Magic Masala":                 'https://images.openfoodfacts.org/images/products/890/178/000/4503/front_en.11.400.jpg', // 404 ERROR
// 'Kurkure Masala Munch':               'https://images.openfoodfacts.org/images/products/890/143/404/6019/front_en.5.400.jpg', // 404 ERROR
// "Haldiram's Bhujia":                  'https://images.openfoodfacts.org/images/products/890/106/900/0018/front_en.6.400.jpg', // 404 ERROR
// "Haldiram's Aloo Bhujia":             'https://images.openfoodfacts.org/images/products/890/106/900/0018/front_en.6.400.jpg', // 404 ERROR
// 'Bingo Mad Angles':                   'https://images.openfoodfacts.org/images/products/890/191/400/0018/front_en.3.400.jpg', // 404 ERROR
// 'Pringles Original':                  'https://images.openfoodfacts.org/images/products/613/805/731/7001/front_en.12.400.jpg', // 404 ERROR

  // ── BISCUITS ───────────────────────────────────────────────
// 'Parle-G Biscuits':                   'https://images.openfoodfacts.org/images/products/890/178/100/0128/front_en.10.400.jpg', // 404 ERROR
// 'Parle-G Original Glucose Biscuits':  'https://images.openfoodfacts.org/images/products/890/178/100/0128/front_en.10.400.jpg', // 404 ERROR
// 'Parle Monaco Classic':               'https://images.openfoodfacts.org/images/products/890/178/100/0128/front_en.10.400.jpg', // 404 ERROR
// 'Parle Hide & Seek Chocolate Chips':  'https://images.openfoodfacts.org/images/products/890/178/100/0128/front_en.10.400.jpg', // 404 ERROR
// 'Britannia Marie Gold':               'https://images.openfoodfacts.org/images/products/890/140/100/5000/front_en.3.400.jpg', // 404 ERROR
// 'Britannia Good Day Cashew Cookies':  'https://images.openfoodfacts.org/images/products/890/140/100/5000/front_en.3.400.jpg', // 404 ERROR
// 'Britannia Tiger Glucose':            'https://images.openfoodfacts.org/images/products/890/140/100/5000/front_en.3.400.jpg', // 404 ERROR
// 'Britannia Bourbon Chocolate Cream':  'https://images.openfoodfacts.org/images/products/890/140/100/5000/front_en.3.400.jpg', // 404 ERROR
// 'Britannia NutriChoice 5 Grain':      'https://images.openfoodfacts.org/images/products/890/140/100/9015/front_en.5.400.jpg', // 404 ERROR
// 'Sunfeast Dark Fantasy':              'https://images.openfoodfacts.org/images/products/890/191/400/1510/front_en.4.400.jpg', // 404 ERROR
// "McVitie's Digestive Biscuits":       'https://images.openfoodfacts.org/images/products/000/400/112/2946/front_en.49.400.jpg', // 404 ERROR
// 'Oreo Original Sandwich Cookies':     'https://images.openfoodfacts.org/images/products/762/230/044/1937/front_en.128.400.jpg', // 404 ERROR

  // ── CHOCOLATES ─────────────────────────────────────────────
  'Cadbury Dairy Milk':                 'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.605.400.jpg',
  'Cadbury Dairy Milk Silk':            'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.605.400.jpg',
  'Cadbury 5 Star':                     'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.605.400.jpg',
  'Cadbury Celebration Gift Pack':      'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.605.400.jpg',
// 'KitKat 4 Finger':                    'https://images.openfoodfacts.org/images/products/500/011/263/8907/front_en.42.400.jpg', // 404 ERROR
// 'Nestlé KitKat Senses Gift Box':      'https://images.openfoodfacts.org/images/products/500/011/263/8907/front_en.42.400.jpg', // 404 ERROR
// 'Amul Dark Chocolate':                'https://images.openfoodfacts.org/images/products/890/102/205/2086/front_en.8.400.jpg', // 404 ERROR
// 'Ferrero Rocher Gift Box':            'https://images.openfoodfacts.org/images/products/800/066/203/2028/front_en.47.400.jpg', // 404 ERROR
  'Munch Choco Crunch':                 'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.605.400.jpg',
  'Perk Chocolate':                     'https://images.openfoodfacts.org/images/products/762/221/044/9283/front_en.605.400.jpg',
// 'Nutella Hazelnut Spread':            'https://images.openfoodfacts.org/images/products/301/762/401/0701/front_en.193.400.jpg', // 404 ERROR
// 'Mars Chocolate Bar':                 'https://images.openfoodfacts.org/images/products/040/000/048/8950/front_en.5.400.jpg', // 404 ERROR

  // ── BREAKFAST SAUCES ───────────────────────────────────────
// "Kellogg's Corn Flakes":              'https://images.openfoodfacts.org/images/products/890/000/040/4012/front_en.7.400.jpg', // 404 ERROR
// "Kellogg's Chocos":                   'https://images.openfoodfacts.org/images/products/890/000/040/4012/front_en.7.400.jpg', // 404 ERROR
// 'Kissan Mixed Fruit Jam':             'https://images.openfoodfacts.org/images/products/890/602/000/3029/front_en.6.400.jpg', // 404 ERROR
// 'Horlicks Classic Malt':              'https://images.openfoodfacts.org/images/products/890/115/100/2012/front_en.4.400.jpg', // 404 ERROR
// 'Bournvita Chocolate Drink':          'https://images.openfoodfacts.org/images/products/890/122/300/1017/front_en.4.400.jpg', // 404 ERROR
// 'Nestlé Milo Energy Drink Powder':    'https://images.openfoodfacts.org/images/products/890/122/300/1017/front_en.4.400.jpg', // 404 ERROR

  // ── INSTANT FOOD ───────────────────────────────────────────
// 'Maggi 2-Minute Noodles Masala':      'https://images.openfoodfacts.org/images/products/890/103/010/0021/front_en.13.400.jpg', // 404 ERROR
// 'Maggi Atta Noodles Masala':          'https://images.openfoodfacts.org/images/products/890/103/010/0021/front_en.13.400.jpg', // 404 ERROR
// 'Maggi Oats Masala Noodles':          'https://images.openfoodfacts.org/images/products/890/103/010/0021/front_en.13.400.jpg', // 404 ERROR
// 'Maggi Hot & Sweet Sauce':            'https://images.openfoodfacts.org/images/products/890/103/010/0021/front_en.13.400.jpg', // 404 ERROR

  // ── BEVERAGES ──────────────────────────────────────────────
// 'Coca-Cola Original':                 'https://images.openfoodfacts.org/images/products/500/011/260/2761/front_en.71.400.jpg', // 404 ERROR
// 'Pepsi Original':                     'https://images.openfoodfacts.org/images/products/004/900/000/4436/front_en.22.400.jpg', // 404 ERROR
// 'Sprite Lemon-Lime':                  'https://images.openfoodfacts.org/images/products/500/011/260/2761/front_en.71.400.jpg', // 404 ERROR
// 'Thums Up Strong Cola':               'https://images.openfoodfacts.org/images/products/500/011/260/2761/front_en.71.400.jpg', // 404 ERROR
// 'Limca Lime Lemon':                   'https://images.openfoodfacts.org/images/products/500/011/260/2761/front_en.71.400.jpg', // 404 ERROR
// 'Bisleri Mineral Water':              'https://images.openfoodfacts.org/images/products/890/503/600/0018/front_en.3.400.jpg', // 404 ERROR
// 'Red Bull Energy Drink':              'https://images.openfoodfacts.org/images/products/900/249/010/0051/front_en.47.400.jpg', // 404 ERROR
// 'Monster Energy Drink':               'https://images.openfoodfacts.org/images/products/900/249/010/0051/front_en.47.400.jpg', // 404 ERROR
// 'Tropicana Orange Juice':             'https://images.openfoodfacts.org/images/products/004/900/000/1374/front_en.19.400.jpg', // 404 ERROR
// 'Real Fruit Power Mixed Fruit Juice': 'https://images.openfoodfacts.org/images/products/004/900/000/1374/front_en.19.400.jpg', // 404 ERROR
// 'Minute Maid Pulpy Orange':           'https://images.openfoodfacts.org/images/products/004/900/000/1374/front_en.19.400.jpg', // 404 ERROR
// 'Maaza Mango Drink':                  'https://images.openfoodfacts.org/images/products/500/011/260/2761/front_en.71.400.jpg', // 404 ERROR
// 'Frooti Mango Fruit Drink':           'https://images.openfoodfacts.org/images/products/500/011/260/2761/front_en.71.400.jpg', // 404 ERROR
// 'Appy Fizz Sparkling Apple Drink':    'https://images.openfoodfacts.org/images/products/500/011/260/2761/front_en.71.400.jpg', // 404 ERROR

  // ── TEA COFFEE ─────────────────────────────────────────────
// 'Tata Tea Gold':                      'https://images.openfoodfacts.org/images/products/890/122/300/1027/front_en.6.400.jpg', // 404 ERROR
// 'Red Label Natural Care Tea':         'https://images.openfoodfacts.org/images/products/890/122/300/1027/front_en.6.400.jpg', // 404 ERROR
// 'Tetley Green Tea':                   'https://images.openfoodfacts.org/images/products/890/122/300/1027/front_en.6.400.jpg', // 404 ERROR
// 'Lipton Yellow Label Tea':            'https://images.openfoodfacts.org/images/products/890/122/300/1027/front_en.6.400.jpg', // 404 ERROR
// "Nescafé Classic Instant Coffee":     'https://images.openfoodfacts.org/images/products/761/303/262/0426/front_en.87.400.jpg', // 404 ERROR
// 'Bru Instant Coffee':                 'https://images.openfoodfacts.org/images/products/890/122/300/1027/front_en.6.400.jpg', // 404 ERROR
// 'Tata Coffee Gold':                   'https://images.openfoodfacts.org/images/products/761/303/262/0426/front_en.87.400.jpg', // 404 ERROR

  // ── PERSONAL CARE ──────────────────────────────────────────
// 'Dove Moisturising Cream Bar':        'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Head & Shoulders Anti Dandruff':     'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Colgate MaxFresh Toothpaste':        'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Colgate Strong Teeth Toothpaste':    'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Gillette Guard Razor':               'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Whisper Ultra Soft Pads (XL)':       'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Dettol Original Soap':               'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Himalaya Moisturising Lotion':       'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Vaseline Intensive Care Lotion':     'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Pears Pure & Gentle Soap':           'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR

  // ── BABY CARE ──────────────────────────────────────────────
// 'Pampers New Born Diapers':           'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Himalaya Baby Lotion':               'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Johnson Baby Powder':                'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Nestlé NAN PRO 1 Infant Formula':    'https://images.openfoodfacts.org/images/products/890/127/000/1005/front_en.7.400.jpg', // 404 ERROR
// 'Nestlé Milkmaid Condensed Milk':     'https://images.openfoodfacts.org/images/products/890/102/205/2086/front_en.8.400.jpg', // 404 ERROR

  // ── HOUSEHOLD ──────────────────────────────────────────────
// 'Surf Excel Matic Front Load':        'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Ariel Matic Powder':                 'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Harpic Power Plus':                  'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Lizol Disinfectant Floor Cleaner':   'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Vim Dishwash Bar':                   'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR

  // ── PET CARE ───────────────────────────────────────────────
// 'Pedigree Adult Dry Dog Food':        'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
// 'Whiskas Adult Cat Food':             'https://images.openfoodfacts.org/images/products/890/180/600/5025/front_en.5.400.jpg', // 404 ERROR
};

// Resolve image: prefer real product photo, fall back to Unsplash stock
function img(productName, unsplashId) {
  if (REAL_IMAGES[productName]) return REAL_IMAGES[productName];
  return unsplashId ? U(unsplashId) : FALLBACK;
}

// ── Brands ────────────────────────────────────────────────────
const BRANDS = [
  // Dairy
  { name: 'Amul', slug: 'amul' },
  { name: 'Mother Dairy', slug: 'mother-dairy' },
  { name: 'Milky Mist', slug: 'milky-mist' },
  { name: 'Britannia', slug: 'britannia' },
  { name: 'Nandini', slug: 'nandini' },
  // Staples
  { name: 'Aashirvaad', slug: 'aashirvaad' },
  { name: 'Fortune', slug: 'fortune' },
  { name: 'India Gate', slug: 'india-gate' },
  { name: 'Dawat', slug: 'dawat' },
  { name: 'Kohinoor', slug: 'kohinoor' },
  { name: 'Tata Sampann', slug: 'tata-sampann' },
  { name: 'Tata', slug: 'tata' },
  { name: 'Double Horse', slug: 'double-horse' },
  // Oils & Spices
  { name: 'Dhara', slug: 'dhara' },
  { name: 'Saffola', slug: 'saffola' },
  { name: 'MDH', slug: 'mdh' },
  { name: 'Everest', slug: 'everest' },
  { name: 'Catch', slug: 'catch' },
  // Snacks & Confectionery
  { name: "Lay's", slug: 'lays' },
  { name: 'Kurkure', slug: 'kurkure' },
  { name: 'Bingo', slug: 'bingo' },
  { name: "Haldiram's", slug: 'haldirams' },
  { name: 'Pringles', slug: 'pringles' },
  { name: 'Too Yumm', slug: 'too-yumm' },
  { name: 'Cornitos', slug: 'cornitos' },
  { name: 'Parle', slug: 'parle' },
  { name: 'Sunfeast', slug: 'sunfeast' },
  { name: "McVitie's", slug: 'mcvities' },
  { name: 'Oreo', slug: 'oreo' },
  { name: 'Cadbury', slug: 'cadbury' },
  { name: 'Nestlé', slug: 'nestle' },
  { name: 'Ferrero', slug: 'ferrero' },
  { name: 'Mars', slug: 'mars' },
  // Beverages
  { name: 'Coca-Cola', slug: 'coca-cola' },
  { name: 'Pepsi', slug: 'pepsi' },
  { name: 'Bisleri', slug: 'bisleri' },
  { name: 'Red Bull', slug: 'red-bull' },
  { name: 'Monster', slug: 'monster' },
  { name: 'Tropicana', slug: 'tropicana' },
  { name: 'Real', slug: 'real' },
  { name: 'Minute Maid', slug: 'minute-maid' },
  { name: 'Maaza', slug: 'maaza' },
  { name: 'Frooti', slug: 'frooti' },
  { name: 'Appy', slug: 'appy' },
  // Tea & Coffee
  { name: 'Nescafé', slug: 'nescafe' },
  { name: 'BRU', slug: 'bru' },
  { name: 'Red Label', slug: 'red-label' },
  { name: 'Tetley', slug: 'tetley' },
  { name: 'Lipton', slug: 'lipton' },
  // Breakfast & Sauces
  { name: "Kellogg's", slug: 'kelloggs' },
  { name: 'Quaker', slug: 'quaker' },
  { name: 'Kissan', slug: 'kissan' },
  { name: 'Horlicks', slug: 'horlicks' },
  { name: 'Bournvita', slug: 'bournvita' },
  { name: "Maggi", slug: 'maggi' },
  { name: 'Knorr', slug: 'knorr' },
  { name: 'Del Monte', slug: 'del-monte' },
  { name: "Veeba", slug: 'veeba' },
  // Packaged Food
  { name: 'MTR', slug: 'mtr' },
  { name: 'Gits', slug: 'gits' },
  { name: 'Haldiram', slug: 'haldiram' },
  // Instant Food
  { name: 'Top Ramen', slug: 'top-ramen' },
  // Ice Cream
  { name: "Kwality Wall's", slug: 'kwality-walls' },
  { name: 'Vadilal', slug: 'vadilal' },
  { name: 'McCain', slug: 'mccain' },
  // Bakery
  { name: 'Harvest Gold', slug: 'harvest-gold' },
  { name: 'English Oven', slug: 'english-oven' },
  { name: 'Modern', slug: 'modern' },
  { name: "The Baker's Dozen", slug: 'the-bakers-dozen' },
  { name: 'Pillsbury', slug: 'pillsbury' },
  // Meat
  { name: 'Licious', slug: 'licious' },
  { name: 'Godrej', slug: 'godrej' },
  // Personal Care
  { name: 'Dove', slug: 'dove' },
  { name: 'Dettol', slug: 'dettol' },
  { name: 'Lifebuoy', slug: 'lifebuoy' },
  { name: 'Pantene', slug: 'pantene' },
  { name: 'Sunsilk', slug: 'sunsilk' },
  { name: 'Head & Shoulders', slug: 'head-and-shoulders' },
  { name: 'Colgate', slug: 'colgate' },
  { name: 'Pepsodent', slug: 'pepsodent' },
  { name: 'Sensodyne', slug: 'sensodyne' },
  { name: 'Oral-B', slug: 'oral-b' },
  { name: 'Nivea', slug: 'nivea' },
  { name: 'Himalaya', slug: 'himalaya' },
  { name: 'Vaseline', slug: 'vaseline' },
  { name: 'Parachute', slug: 'parachute' },
  { name: 'Fogg', slug: 'fogg' },
  { name: 'Biotique', slug: 'biotique' },
  // Baby Care
  { name: 'Pampers', slug: 'pampers' },
  { name: 'Huggies', slug: 'huggies' },
  { name: "Johnson's", slug: 'johnsons' },
  { name: 'Mee Mee', slug: 'mee-mee' },
  { name: 'Farex', slug: 'farex' },
  // Cleaning
  { name: 'Surf Excel', slug: 'surf-excel' },
  { name: 'Ariel', slug: 'ariel' },
  { name: 'Tide', slug: 'tide' },
  { name: 'Rin', slug: 'rin' },
  { name: 'Harpic', slug: 'harpic' },
  { name: 'Lizol', slug: 'lizol' },
  { name: 'Domex', slug: 'domex' },
  { name: 'Vim', slug: 'vim' },
  { name: 'Pril', slug: 'pril' },
  { name: 'Colin', slug: 'colin' },
  // Home & Kitchen
  { name: 'Cello', slug: 'cello' },
  { name: 'Milton', slug: 'milton' },
  { name: 'Pigeon', slug: 'pigeon' },
  { name: 'Prestige', slug: 'prestige' },
  { name: 'Borosil', slug: 'borosil' },
  { name: 'Scotch-Brite', slug: 'scotch-brite' },
  { name: 'Halonix', slug: 'halonix' },
  // Stationery
  { name: 'Classmate', slug: 'classmate' },
  { name: 'Reynolds', slug: 'reynolds' },
  { name: 'Apsara', slug: 'apsara' },
  { name: 'Fevicol', slug: 'fevicol' },
  { name: 'Faber-Castell', slug: 'faber-castell' },
  { name: 'Natraj', slug: 'natraj' },
  { name: 'Camlin', slug: 'camlin' },
  // Pet
  { name: 'Pedigree', slug: 'pedigree' },
  { name: 'Drools', slug: 'drools' },
  { name: 'Whiskas', slug: 'whiskas' },
  { name: 'Royal Canin', slug: 'royal-canin' },
  { name: 'Himalaya Pet', slug: 'himalaya-pet' },
  // Electronics
  { name: 'Syska', slug: 'syska' },
  { name: 'Portronics', slug: 'portronics' },
  { name: 'boAt', slug: 'boat' },
  { name: 'Ambrane', slug: 'ambrane' },
  { name: 'Energizer', slug: 'energizer' },
  { name: 'Duracell', slug: 'duracell' },
  // Adult Wellness
  { name: 'Durex', slug: 'durex' },
  { name: 'Skore', slug: 'skore' },
  { name: 'Prega News', slug: 'prega-news' },
  { name: 'Everteen', slug: 'everteen' },
  { name: 'VWash', slug: 'vwash' },
  { name: 'Whisper', slug: 'whisper' },
  { name: 'Stayfree', slug: 'stayfree' },
  // Other Essentials
  { name: 'Vicks', slug: 'vicks' },
  { name: 'Savlon', slug: 'savlon' },
  { name: 'Eno', slug: 'eno' },
  { name: 'Moov', slug: 'moov' },
  // Pooja
  { name: 'Cycle', slug: 'cycle' },
  { name: 'HEM', slug: 'hem' },
  { name: 'Patanjali', slug: 'patanjali' },
  // Local
  { name: 'Local Farm', slug: 'local-farm' },
  { name: 'Green Valley', slug: 'green-valley' },
  { name: 'Organic Farms', slug: 'organic-farms' },
  { name: 'Kashmiri Orchards', slug: 'kashmiri-orchards' },
];

// ── Categories (25 top-level) ─────────────────────────────────
const CATEGORIES = [
  { name: 'Fruits & Vegetables',       slug: 'fruits-vegetables',       sortOrder: 1,  desc: 'Fresh fruits and vegetables delivered daily from local farms' },
  { name: 'Dairy & Breakfast',         slug: 'dairy-breakfast',         sortOrder: 2,  desc: 'Milk, eggs, butter, curd, paneer, and breakfast essentials' },
  { name: 'Atta, Rice & Dals',         slug: 'atta-rice-dals',          sortOrder: 3,  desc: 'Wheat flour, basmati rice, dals, and pulses' },
  { name: 'Oil, Ghee & Masala',        slug: 'oil-ghee-masala',         sortOrder: 4,  desc: 'Cooking oils, pure ghee, spices, and masalas' },
  { name: 'Snacks & Munchies',         slug: 'snacks',                  sortOrder: 5,  desc: 'Chips, namkeen, popcorn, and all your snack cravings' },
  { name: 'Biscuits & Cookies',        slug: 'biscuits-cookies',        sortOrder: 6,  desc: 'Glucose biscuits, digestive, cream biscuits, and cookies' },
  { name: 'Chocolates & Sweets',       slug: 'chocolates-sweets',       sortOrder: 7,  desc: 'Chocolates, candies, mithai, and sweet treats' },
  { name: 'Breakfast & Sauces',        slug: 'breakfast-sauces',        sortOrder: 8,  desc: 'Cereals, oats, jams, peanut butter, sauces, and spreads' },
  { name: 'Packaged Food',             slug: 'packaged-food',           sortOrder: 9,  desc: 'Ready mixes, health drinks, canned food, and packaged items' },
  { name: 'Instant & Ready to Eat',    slug: 'instant-food',            sortOrder: 10, desc: 'Instant noodles, soups, ready-to-eat meals in minutes' },
  { name: 'Beverages',                 slug: 'beverages',               sortOrder: 11, desc: 'Cold drinks, juices, energy drinks, and water' },
  { name: 'Tea & Coffee',              slug: 'tea-coffee',              sortOrder: 12, desc: 'Premium teas, instant coffee, and hot beverage essentials' },
  { name: 'Ice Cream & Frozen Food',   slug: 'ice-cream-frozen',        sortOrder: 13, desc: 'Ice creams, frozen snacks, kulfi, and frozen ready-to-cook' },
  { name: 'Bakery',                    slug: 'bakery',                  sortOrder: 14, desc: 'Fresh breads, cakes, pastries, and baked goodness' },
  { name: 'Meat & Seafood',            slug: 'meat-seafood',            sortOrder: 15, desc: 'Fresh chicken, mutton, fish, and seafood' },
  { name: 'Personal Care',             slug: 'personal-care',           sortOrder: 16, desc: 'Skincare, haircare, dental care, and personal hygiene products' },
  { name: 'Baby Care',                 slug: 'baby-care',               sortOrder: 17, desc: 'Baby diapers, wipes, feeding essentials, and baby skincare' },
  { name: 'Cleaning Essentials',       slug: 'household',               sortOrder: 18, desc: 'Detergents, floor cleaners, dishwash, and home cleaning products' },
  { name: 'Home & Kitchen',            slug: 'home-kitchen',            sortOrder: 19, desc: 'Containers, cookware, storage, and home utility items' },
  { name: 'Stationery & Office',       slug: 'stationery',              sortOrder: 20, desc: 'Notebooks, pens, art supplies, and office essentials' },
  { name: 'Pet Care',                  slug: 'pet-care',                sortOrder: 21, desc: 'Dog food, cat food, pet treats, and pet hygiene products' },
  { name: 'Electronics & Accessories', slug: 'electronics',             sortOrder: 22, desc: 'Bulbs, cables, chargers, earphones, and batteries' },
  { name: 'Pooja & Festive',           slug: 'pooja-festive',           sortOrder: 23, desc: 'Incense sticks, diyas, camphor, and festive essentials' },
  { name: 'Adult Wellness',            slug: 'adult-personal-wellness',  sortOrder: 24, desc: 'Contraceptives, pregnancy tests, intimate care, and personal hygiene' },
  { name: 'Other Essentials',          slug: 'other-essentials',        sortOrder: 25, desc: 'Handwash, pain relief, antiseptics, and daily health essentials' },
];

// ── Product helper ─────────────────────────────────────────────
// Returns a product object for the PRODUCTS array
// img() will pick a real product photo if available, else use Unsplash ID as fallback
function mk(c, b, n, d, p, op, dp, w, u, imgId, t, f = false, r = 4.2, rc = 120) {
  return {
    catSlug: c, brandName: b,
    name: n, description: d,
    price: p, originalPrice: op, discountPct: dp,
    weight: w, unit: u,
    images: [img(n, imgId)],   // ← real image first, Unsplash fallback
    tags: t,
    isActive: true, isFeatured: f,
    avgRating: r, reviewCount: rc,
  };
}

// ── Products ──────────────────────────────────────────────────
// Arguments: mk(categorySlug, brandName, name, description, price_paise, origPrice_paise, discountPct, weight, unit, unsplashPhotoId, tags[], isFeatured, avgRating, reviewCount)
const PRODUCTS = [

  // ── FRUITS & VEGETABLES ───────────────────────────────────
  mk('fruits-vegetables', 'Local Farm',       'Fresh Bananas',           'Sweet, ripe bananas rich in potassium and natural sugars.',                          3800,  4500, 16, '500 g',          'g',   '1571771894821-ce9b6c11b08e', ['banana','fruit','fresh','potassium'],                      false, 4.4, 380),
  mk('fruits-vegetables', 'Green Valley',     'Red Tomatoes',            'Firm, vine-ripened tomatoes picked fresh from farms daily.',                         2900,  3500, 17, '500 g',          'g',   '1546470427-e26264be0b0d',   ['tomato','vegetable','fresh','lycopene'],                    false, 4.5, 280),
  mk('fruits-vegetables', 'Kashmiri Orchards','Himalayan Apples',        'Crispy, sweet apples from the orchards of Kashmir. Rich in fibre.',                 14900, 18000, 17, '4 pcs (~700 g)', 'pcs', '1560806887-1e4cd0b6cbd6',   ['apple','fruit','kashmir','fresh'],                          true,  4.7, 520),
  mk('fruits-vegetables', 'Organic Farms',    'Baby Spinach',            'Tender baby spinach leaves, triple-washed and ready to use.',                        4500,  5500, 18, '250 g',          'g',   '1576045057995-568f588f82fb', ['spinach','organic','greens','iron'],                        false, 4.3, 190),
  mk('fruits-vegetables', 'Local Farm',       'Sweet Corn',              'Juicy sweet corn perfect for boiling, roasting, or stir-frying.',                    5500,  6500, 15, '3 pcs',          'pcs', '1601648764658-cf37e8c89b70', ['corn','vegetable','fresh','sweet'],                         false, 4.6, 340),
  mk('fruits-vegetables', 'Local Farm',       'Yellow Onions',           'Aromatic yellow onions — a kitchen essential for everyday cooking.',                 3500,  4000, 13, '1 kg',           'g',   '1587132137056-bfbf0166836e', ['onion','vegetable','essential'],                           false, 4.3, 460),
  mk('fruits-vegetables', 'Local Farm',       'Potatoes',                'Farm-fresh potatoes. Versatile for sabzi, fries, and curries.',                     3500,  4000, 13, '1 kg',           'g',   '1518977676601-b53f82aba655', ['potato','vegetable','aloo','starch'],                       false, 4.4, 520),
  mk('fruits-vegetables', 'Local Farm',       'Fresh Carrots',           'Crunchy, sweet carrots — great for salads, halwa, and curries.',                    3900,  4800, 19, '500 g',          'g',   '1447175008436-054170c2e979', ['carrot','vegetable','fresh','vitamin-a'],                   false, 4.5, 310),
  mk('fruits-vegetables', 'Green Valley',     'Brinjal (Baingan)',       'Tender brinjal ideal for baingan bharta, sabzi, and curries.',                     4500,  5500, 18, '500 g',          'g',   '1615484477778-ca3b77940c25', ['brinjal','baingan','vegetable','fresh'],                    false, 4.1, 145),
  mk('fruits-vegetables', 'Local Farm',       'Alphonso Mangoes',        'The king of mangoes — naturally ripened Alphonso from Ratnagiri.',                 29900, 36000, 17, '6 pcs (~900 g)', 'pcs', '1553279768-865429fa0078',   ['mango','alphonso','fruit','seasonal'],                      true,  4.8, 820),
  mk('fruits-vegetables', 'Green Valley',     'Watermelon',              'Chilled, sweet watermelon — the perfect summer refresher.',                         9900, 12900, 23, '1 pcs (~3 kg)',  'pcs', '1587049352846-4a222e784d38', ['watermelon','fruit','summer','hydration'],                  false, 4.5, 290),
  mk('fruits-vegetables', 'Local Farm',       'Green Grapes (Seedless)', 'Plump, seedless green grapes — sweet with a crisp bite.',                          8900, 11500, 23, '500 g',          'g',   '1537640538966-79f369143f8f', ['grapes','fruit','seedless','fresh'],                        false, 4.4, 230),
  mk('fruits-vegetables', 'Local Farm',       'Fresh Lemons',            'Tangy, juicy lemons for cooking, drinks, and garnish.',                             2900,  3500, 17, '6 pcs',          'pcs', '1587252323571-a8b64b99c09b', ['lemon','citrus','fruit','tangy'],                           false, 4.2, 180),
  mk('fruits-vegetables', 'Green Valley',     'Cauliflower (Gobhi)',     'Fresh white cauliflower — great for gobi sabzi, aloo gobi, and soups.',            5500,  6500, 15, '1 pcs (~500 g)', 'pcs', '1568584711075-3d021a7c3ca3', ['cauliflower','gobhi','vegetable','fresh'],                  false, 4.3, 155),
  mk('fruits-vegetables', 'Local Farm',       'Fresh Peas (Matar)',      'Sweet green peas — great for matar paneer, pulao, and curries.',                   4900,  5900, 17, '500 g',          'g',   '1529695783690-eb394dc9f4e8', ['peas','matar','green','vegetable'],                         false, 4.4, 195),
  mk('fruits-vegetables', 'Local Farm',       'Green Chillies',          'Fresh green chillies — adds the perfect kick to any dish.',                        1500,  1800, 17, '100 g',          'g',   '1614532458374-8b4ba0c52344', ['chilli','green','spicy','fresh'],                           false, 4.3, 210),
  mk('fruits-vegetables', 'Local Farm',       'Fresh Ginger (Adrak)',   'Aromatic fresh ginger root — essential for chai, curries, and remedies.',          2500,  3000, 17, '100 g',          'g',   '1573734849730-0d73ca88c3a0', ['ginger','adrak','spice','fresh'],                           false, 4.4, 250),
  mk('fruits-vegetables', 'Local Farm',       'Garlic (Lehsun)',         'Fresh garlic cloves — adds depth and flavour to every Indian dish.',               3500,  4200, 17, '100 g',          'g',   '1587132137056-bfbf0166836e', ['garlic','lehsun','spice','fresh'],                          false, 4.3, 280),
  mk('fruits-vegetables', 'Local Farm',       'Cucumber (Kheera)',       'Cool, crunchy cucumbers — perfect for salads, raita, and snacking.',               3000,  3800, 21, '500 g',          'g',   '1539622106-5200927f-b0e8',  ['cucumber','kheera','vegetable','fresh'],                    false, 4.3, 190),
  mk('fruits-vegetables', 'Green Valley',     'Mixed Capsicum (3 pcs)', 'Colourful red, yellow, and green capsicum for salads, stir-fries, and gravies.',   5500,  6500, 15, '3 pcs',          'pcs', '1556909232-a6f9e-c7f2d-9b7', ['capsicum','bell pepper','colourful','fresh'],                false, 4.4, 175),
  mk('fruits-vegetables', 'Organic Farms',    'Broccoli',                'Nutrient-packed broccoli — great for stir-fries, soups, and as a healthy side.',   9900, 12900, 23, '350 g',          'g',   '1510627498664-4753900e3a-8', ['broccoli','healthy','green','superfood'],                   true,  4.5, 220),
  mk('fruits-vegetables', 'Green Valley',     'Cherry Tomatoes',         'Sweet, bite-sized cherry tomatoes — great for salads, pizzas, and snacking.',      7900,  9900, 20, '200 g',          'g',   '1558818370-a8cfde41b09a-c',  ['cherry tomato','salad','fresh','bite-sized'],               false, 4.5, 150),
  mk('fruits-vegetables', 'Local Farm',       'Pomegranate (Anar)',      'Juicy pomegranate seeds bursting with antioxidants and natural sweetness.',       12900, 15900, 19, '2 pcs (~500 g)', 'pcs', '1550989460-0adf9ea622e2',   ['pomegranate','anar','fruit','antioxidant'],                  false, 4.6, 310),
  mk('fruits-vegetables', 'Local Farm',       'Pineapple',               'Sweet and tangy pineapple — enjoy fresh or blend into a tropical smoothie.',       8900, 11500, 23, '1 pcs (~900 g)', 'pcs', '1490818060-c1a0df1ae3a5',   ['pineapple','fruit','tropical','sweet'],                      false, 4.5, 195),

  // ── DAIRY & BREAKFAST ──────────────────────────────────────
  mk('dairy-breakfast', 'Amul',        'Amul Gold Full Cream Milk',       'Amul Gold full cream homogenised milk, rich in vitamins, calcium, and natural fat.',        6800,  7500,  9, '1 L',    'ml',  '1563636619-e9143da7973b', ['milk','dairy','amul','full cream','calcium'],        true,  4.7, 1240),
  mk('dairy-breakfast', 'Mother Dairy','Mother Dairy Toned Milk',         'Fresh toned milk with reduced fat content. Ideal for daily tea, coffee, and cooking.',       2800,  3200, 13, '500 ml', 'ml',  '1550583724-b2692b85b150', ['milk','dairy','toned','mother dairy'],               false, 4.5, 890),
  mk('dairy-breakfast', 'Amul',        'Amul Butter Salted',              'Rich, creamy salted butter made from fresh cream. Perfect for spreading and cooking.',      26500, 28000,  5, '500 g',  'g',   '1589985270826-4b7bb135bc9d',['butter','dairy','amul','salted','cream'],            true,  4.8, 2100),
  mk('dairy-breakfast', 'Britannia',   'Britannia NutriChoice Oats',      'Wholesome rolled oats for a nutritious, high-fibre breakfast. Heart healthy.',               7900,  9900, 20, '400 g',  'g',   '1517093157656-b9eccef91cb1', ['oats','breakfast','healthy','britannia','fibre'],    false, 4.3, 540),
  mk('dairy-breakfast', 'Local Farm',  'Farm Fresh Eggs',                 'Farm-fresh eggs sourced daily. Protein-rich and perfect for breakfast.',                     7200,  8000, 10, '6 pcs',  'pcs', '1582722872445-44dc5f7e3c8f', ['eggs','protein','fresh','dairy'],                   false, 4.6, 670),
  mk('dairy-breakfast', 'Amul',        'Amul Taaza Toned Milk',           'Low-fat toned milk for daily use in chai, coffee, and cooking.',                            5400,  6000, 10, '1 L',    'ml',  '1550583724-b2692b85b150', ['milk','toned','amul','taaza'],                       false, 4.5, 780),
  mk('dairy-breakfast', 'Mother Dairy','Mother Dairy Fresh Curd',         'Thick, creamy curd made from fresh pasteurised milk. No preservatives.',                    3800,  4500, 16, '400 g',  'g',   '1488477304112-4944851de03d', ['curd','dahi','fresh','probiotic'],                   false, 4.5, 450),
  mk('dairy-breakfast', 'Amul',        'Amul Masti Dahi',                 'Thick, set curd from Amul — smooth, tangy, and rich in probiotics.',                       8900, 10000, 11, '1 kg',   'g',   '1488477304112-4944851de03d', ['curd','dahi','amul','masti','probiotic'],             false, 4.6, 560),
  mk('dairy-breakfast', 'Milky Mist',  'Milky Mist Paneer',               'Soft, fresh paneer made from pure cow milk. Perfect for curries and tikkas.',              9500, 10500,  9, '200 g',  'g',   '1588166524941-3bf61a9c41db', ['paneer','cottage cheese','dairy','fresh'],           true,  4.6, 670),
  mk('dairy-breakfast', 'Amul',        'Amul Processed Cheese',           'Smooth, meltable processed cheese slices perfect for burgers and sandwiches.',            12000, 13500, 11, '200 g',  'g',   '1486297678162-eb2a19b0a32d', ['cheese','processed','amul','burger'],                false, 4.5, 890),
  mk('dairy-breakfast', 'Nandini',     'Nandini Pure Ghee',               'Authentic cow ghee from Nandini — rich aroma and traditional taste.',                     16000, 18000, 11, '200 ml', 'ml',  '1597733336794-12d05021d510', ['ghee','cow ghee','pure','nandini'],                  true,  4.7, 430),
  mk('dairy-breakfast', 'Britannia',   'Britannia White Bread',           'Soft, fluffy white bread — ideal for sandwiches, toast, and everyday breakfasts.',         4500,  5200, 13, '400 g',  'g',   '1509440159596-0249088772ff', ['bread','white','britannia','soft'],                  false, 4.4, 620),
  mk('dairy-breakfast', 'Mother Dairy','Mother Dairy Full Cream Milk',    'Rich full cream milk from Mother Dairy — great taste, fresh daily.',                       6800,  7500,  9, '1 L',    'ml',  '1563636619-e9143da7973b', ['milk','full cream','mother dairy','rich'],            false, 4.6, 540),
  mk('dairy-breakfast', 'Amul',        'Amul Kool Chocolate Milk',        'Delicious chilled chocolate-flavoured milk drink — a favourite for kids.',                 2500,  3000, 17, '180 ml', 'ml',  '1550583724-b2692b85b150', ['chocolate milk','amul','kool','kids'],                false, 4.5, 380),
  mk('dairy-breakfast', 'Amul',        'Amul Lassi (Sweet)',              'Chilled, creamy sweet lassi made from fresh curd. Refreshing and filling.',                3000,  3500, 14, '200 ml', 'ml',  '1488477304112-4944851de03d', ['lassi','sweet','amul','refreshing'],                 false, 4.4, 290),

  // ── ATTA, RICE & DALS ──────────────────────────────────────
  mk('atta-rice-dals', 'Aashirvaad',   'Aashirvaad Select Atta',         'Premium whole wheat atta — soft rotis with 100% sampoorna atta goodness.',            22500, 26000, 13, '5 kg',  'kg',  '1509228468518-4ec62e4bed71', ['atta','wheat flour','aashirvaad','roti'],            true,  4.6, 1240),
  mk('atta-rice-dals', 'Aashirvaad',   'Aashirvaad Multigrain Atta',     'Multigrain atta with 6 grains for added nutrition — perfect for health-conscious families.', 27900, 31000, 10, '5 kg',  'kg',  '1509228468518-4ec62e4bed71', ['atta','multigrain','healthy','fibre'],               false, 4.5, 560),
  mk('atta-rice-dals', 'Fortune',      'Fortune Chakki Fresh Atta',      'Stone-ground chakki atta for soft, fluffy rotis with natural wheat flavour.',          39500, 45000, 12, '10 kg', 'kg',  '1509228468518-4ec62e4bed71', ['atta','chakki','fortune','soft roti'],               false, 4.5, 780),
  mk('atta-rice-dals', 'India Gate',   'India Gate Super Basmati Rice',  'Premium aged Basmati rice — long, aromatic grains that cook perfectly every time.',   12500, 14500, 14, '1 kg',  'kg',  '1516684669163-d7c080eb7eb9', ['rice','basmati','india gate','aromatic'],            true,  4.7, 920),
  mk('atta-rice-dals', 'Dawat',        'Dawat Basmati Rice',             'Classic Basmati rice with extra-long grains, fluffy texture, and divine aroma.',      49000, 55000, 11, '5 kg',  'kg',  '1516684669163-d7c080eb7eb9', ['rice','basmati','dawat','long grain'],               false, 4.6, 640),
  mk('atta-rice-dals', 'Kohinoor',     'Kohinoor Silver Basmati Rice',   'Royal Basmati rice with each grain perfectly elongated after cooking.',               44500, 50000, 11, '5 kg',  'kg',  '1516684669163-d7c080eb7eb9', ['rice','basmati','kohinoor','royal'],                 false, 4.5, 450),
  mk('atta-rice-dals', 'Tata Sampann', 'Tata Sampann Chana Dal',         'Hulled split chickpeas — great for dal tadka, sundal, and curries.',                  13500, 15500, 13, '1 kg',  'kg',  '1515543779262-b3b69c0a6f8b', ['chana dal','dal','tata','protein'],                  false, 4.5, 380),
  mk('atta-rice-dals', 'Tata Sampann', 'Tata Sampann Toor Dal',          'Premium arhar/toor dal — perfect for everyday dal, sambar, and rasam.',               15900, 18000, 12, '1 kg',  'kg',  '1515543779262-b3b69c0a6f8b', ['toor dal','arhar','dal','tata sampann'],             true,  4.5, 540),
  mk('atta-rice-dals', 'Tata Sampann', 'Tata Sampann Moong Dal',         'Split yellow moong dal — light, easy to digest, great for moong soup and khichdi.',    9500, 11000, 14, '500 g', 'g',   '1515543779262-b3b69c0a6f8b', ['moong dal','yellow','light','healthy'],              false, 4.4, 310),
  mk('atta-rice-dals', 'Tata Sampann', 'Tata Sampann Masoor Dal',        'Split red lentils — quick-cooking, great for dal soup and khichdi.',                   7500,  8800, 15, '500 g', 'g',   '1515543779262-b3b69c0a6f8b', ['masoor','red lentil','dal','quick cook'],             false, 4.4, 260),
  mk('atta-rice-dals', 'Double Horse', 'Double Horse Poha (Beaten Rice)', 'Flattened rice for quick poha breakfast, chivda, or snacks. Soft texture.',           5500,  6500, 15, '500 g', 'g',   '1509228468518-4ec62e4bed71', ['poha','beaten rice','breakfast','quick'],            false, 4.3, 220),
  mk('atta-rice-dals', 'Tata Sampann', 'Tata Sampann Kabuli Chana',      'Large, whole white chickpeas — ideal for chole, hummus, and chana masala.',           12500, 14500, 14, '500 g', 'g',   '1515543779262-b3b69c0a6f8b', ['kabuli chana','chickpeas','chole','protein'],         false, 4.5, 290),
  mk('atta-rice-dals', 'Aashirvaad',   'Aashirvaad Sooji (Semolina)',    'Fine-grained semolina for upma, rava idli, halwa, and sheera.',                       4500,  5500, 18, '500 g', 'g',   '1509228468518-4ec62e4bed71', ['sooji','semolina','rava','upma'],                    false, 4.4, 180),

  // ── OIL, GHEE & MASALA ─────────────────────────────────────
  mk('oil-ghee-masala', 'Fortune',     'Fortune Sunflower Oil',           'Light, healthy sunflower oil for daily cooking, frying, and sautéing.',              13000, 15000, 13, '1 L',   'ml',  '1474979985543-dae96dbf8b76', ['oil','sunflower','cooking','fortune'],                false, 4.4, 560),
  mk('oil-ghee-masala', 'Dhara',       'Dhara Pure Mustard Oil',          'Pungent, cold-pressed kachi ghani mustard oil — essential for North Indian cooking.', 16500, 19000, 13, '1 L',   'ml',  '1474979985543-dae96dbf8b76', ['oil','mustard','dhara','kachi ghani'],                false, 4.5, 420),
  mk('oil-ghee-masala', 'Saffola',     'Saffola Gold Oil',                'Blended cooking oil with dual-seed technology — good for a healthy heart.',          17500, 20000, 13, '1 L',   'ml',  '1474979985543-dae96dbf8b76', ['oil','saffola','healthy','heart care'],               true,  4.5, 780),
  mk('oil-ghee-masala', 'Amul',        'Amul Pure Cow Ghee',              'Pure cow ghee with natural golden colour — traditional taste for every celebration.', 29000, 33000, 12, '500 ml','ml',  '1597733336794-12d05021d510', ['ghee','cow ghee','amul','pure','traditional'],        true,  4.7, 1100),
  mk('oil-ghee-masala', 'Mother Dairy','Mother Dairy Cow Ghee',           'Aromatic, pure cow ghee — made from fresh cream of desi cows.',                     34000, 38000, 11, '500 ml','ml',  '1597733336794-12d05021d510', ['ghee','cow ghee','mother dairy','pure'],              false, 4.6, 560),
  mk('oil-ghee-masala', 'MDH',         'MDH Chana Masala',                'Authentic blend of 25 spices for the perfect chole and chana masala every time.',     5500,  6500, 15, '100 g', 'g',   '1596040033229-a537fe33002c', ['masala','chana','mdh','chole','spices'],              false, 4.6, 890),
  mk('oil-ghee-masala', 'Everest',     'Everest Garam Masala',            'Royal blend of premium whole spices — enhances any curry or biryani.',               8500,  9900, 14, '100 g', 'g',   '1596040033229-a537fe33002c', ['garam masala','spices','everest','premium'],          true,  4.7, 1200),
  mk('oil-ghee-masala', 'Catch',       'Catch Turmeric Powder',           'Pure, vibrant turmeric powder — rich in curcumin for colour and health.',            9500, 11000, 14, '200 g', 'g',   '1596040033229-a537fe33002c', ['turmeric','haldi','catch','pure','colour'],           false, 4.5, 450),
  mk('oil-ghee-masala', 'Tata',        'Tata Salt Crystal',               'Pure iodised rock salt — an Indian kitchen essential since generations.',            2200,  2500, 12, '1 kg',  'kg',  '1596040033229-a537fe33002c', ['salt','tata salt','iodised','pure'],                 false, 4.5, 1500),
  mk('oil-ghee-masala', 'MDH',         'MDH Kitchen King Masala',         'The king of masalas — a blend of exotic spices for vegetable and meat dishes.',      6500,  7500, 13, '100 g', 'g',   '1596040033229-a537fe33002c', ['kitchen king','masala','mdh','spices'],               false, 4.6, 780),

  // ── SNACKS & MUNCHIES ──────────────────────────────────────
  mk('snacks', "Lay's",        "Lay's Classic Salted Chips",          'Crispy potato chips with just the right amount of salt. India\'s favourite snack.',   2000,  2000,  0, '73 g',  'g',   '1566478989037-eec170784d0b', ['chips','lays','salted','potato'],                    true,  4.5, 3400),
  mk('snacks', "Haldiram's",   'Haldiram Aloo Bhujia',                'Crispy potato-based namkeen with aromatic spices — a timeless tea-time snack.',       5000,  5500,  9, '200 g', 'g',   '1599490659213-e2b9527bd087', ['namkeen','bhujia','haldiram','aloo'],                 false, 4.6, 2200),
  mk('snacks', 'Cadbury',      'Cadbury Dairy Milk',                  'Classic smooth milk chocolate bar. Loved by every generation across India.',           4000,  4500, 11, '90 g',  'g',   '1481391319762-47dff72954d9', ['chocolate','cadbury','dairy milk','sweet'],           true,  4.8, 5100),
  mk('snacks', 'Parle',        'Parle-G Biscuits',                    'The world\'s most popular glucose biscuit — crispy, sweet, and energising.',          1000,  1000,  0, '250 g', 'g',   '1558961363-fa8fdf82db35',   ['biscuit','parle-g','glucose','iconic'],               false, 4.7, 6200),
  mk('snacks', 'Kurkure',      'Kurkure Masala Munch',                'Crunchy, flavourful puffed snack with a spicy masala twist. Simply irresistible.',     2000,  2000,  0, '90 g',  'g',   '1566478989037-eec170784d0b', ['kurkure','masala','crunch','snack'],                 false, 4.5, 2800),
  mk('snacks', 'Bingo',        'Bingo Mad Angles Achaari Masti',      'Triangular cracker snack loaded with achaari flavour and crunchiness.',                2000,  2000,  0, '75 g',  'g',   '1566478989037-eec170784d0b', ['bingo','mad angles','achaari','crunchy'],            false, 4.4, 1650),
  mk('snacks', "Lay's",        "Lay's Magic Masala",                  'Bold, spicy masala-flavoured potato chips — a desi flavour made for India.',           1000,  1000,  0, '26 g',  'g',   '1566478989037-eec170784d0b', ['lays','magic masala','spicy','chips'],               false, 4.6, 3100),
  mk('snacks', "Haldiram's",   "Haldiram's Mixture",                  'Crunchy mixed namkeen with sev, nuts, and seasoned puffed rice. Perfect tea companion.',6000,  7000, 14, '150 g', 'g',   '1599490659213-e2b9527bd087', ['mixture','namkeen','haldirams','crunchy'],           false, 4.5, 1100),
  mk('snacks', 'Too Yumm',     'Too Yumm Veggie Sticks',              'Baked veggie sticks with no MSG — a guilt-free, crunchy snack option.',                2000,  2500, 20, '55 g',  'g',   '1566478989037-eec170784d0b', ['veggie sticks','baked','healthy','too yumm'],        false, 4.2, 480),
  mk('snacks', 'Pringles',     'Pringles Original',                   'Stacked, crispy potato chips in the iconic can. Consistent crunch in every bite.',    10000, 12000, 17, '107 g', 'g',   '1566478989037-eec170784d0b', ['pringles','original','chips','can'],                 true,  4.5, 1200),
  mk('snacks', 'Cornitos',     'Cornitos Nacho Chips Sizzlin Jalapeno','Tortilla nacho chips with a fiery jalapeno kick — great with dips.',                 9000, 10500, 14, '150 g', 'g',   '1566478989037-eec170784d0b', ['nachos','cornitos','jalapeno','tortilla'],           false, 4.4, 560),
  mk('snacks', "Haldiram's",   "Haldiram's Bhujia",                   'The original Bikaner-style bhujia — spiced moong dal sev at its finest.',            13500, 15500, 13, '400 g', 'g',   '1599490659213-e2b9527bd087', ['bhujia','haldirams','sev','bikaner'],                false, 4.7, 1800),

  // ── BISCUITS & COOKIES ──────────────────────────────────────
  mk('biscuits-cookies', 'Parle',      'Parle-G Original Glucose Biscuits','Timeless glucose biscuit — crispy, mildly sweet, perfect with chai or milk.',       9400, 10000,  6, '799 g', 'g',  '1558961363-fa8fdf82db35',   ['biscuit','parle-g','glucose','chai'],                 true,  4.8, 5600),
  mk('biscuits-cookies', 'Britannia',  'Britannia Good Day Cashew Cookies','Buttery cookies packed with real cashew pieces — rich and indulgent every bite.',   4500,  5500, 18, '250 g', 'g',  '1499636136210-6f4ee915583e', ['cookies','cashew','britannia','buttery'],             true,  4.6, 1800),
  mk('biscuits-cookies', 'Britannia',  'Britannia Bourbon Chocolate Cream','Dark chocolate cream biscuit sandwiched between two crispy chocolate wafers.',       3000,  3500, 14, '175 g', 'g',  '1558961363-fa8fdf82db35',   ['bourbon','chocolate','cream','britannia'],           false, 4.7, 2300),
  mk('biscuits-cookies', 'Sunfeast',   'Sunfeast Dark Fantasy Choco Fills','Premium dark chocolate filled cookie — intensely chocolatey and satisfying.',        5500,  6500, 15, '150 g', 'g',  '1499636136210-6f4ee915583e', ['dark fantasy','chocolate','sunfeast','premium'],     true,  4.7, 1600),
  mk('biscuits-cookies', "McVitie's", "McVitie's Digestive Biscuits",    'High-fibre wheat digestive biscuits — a healthy everyday snacking choice.',          6500,  7500, 13, '250 g', 'g',  '1558961363-fa8fdf82db35',   ['digestive','mcvities','fibre','healthy'],             false, 4.5, 980),
  mk('biscuits-cookies', 'Parle',      'Parle Hide & Seek Chocolate Chips','Crunchy biscuits with real chocolate chip pieces — a kids\' absolute favourite.',   6000,  7000, 14, '200 g', 'g',  '1499636136210-6f4ee915583e', ['hide and seek','chocolate chips','parle','kids'],   false, 4.6, 1200),
  mk('biscuits-cookies', 'Oreo',       'Oreo Original Sandwich Cookies',  'The iconic chocolate sandwich cookie — twist, lick, and dunk. Loved worldwide.',    8000,  9500, 16, '264 g', 'g',  '1499636136210-6f4ee915583e', ['oreo','chocolate','cookie','sandwich'],              true,  4.7, 3100),
  mk('biscuits-cookies', 'Parle',      'Parle Monaco Classic',             'Light, crispy salted biscuits — great as a base for toppings and cheese snacks.',   5000,  5800, 14, '210 g', 'g',  '1558961363-fa8fdf82db35',   ['monaco','salted','crispy','parle'],                  false, 4.4, 780),
  mk('biscuits-cookies', 'Britannia',  'Britannia NutriChoice 5 Grain',   'Multi-grain digestive biscuit packed with oats, wheat, corn, rye, and rice.',        7500,  8800, 15, '200 g', 'g',  '1558961363-fa8fdf82db35',   ['nutrichoice','multigrain','healthy','britannia'],    false, 4.4, 640),
  mk('biscuits-cookies', 'Britannia',  'Britannia Marie Gold',             'Classic light, crispy Marie biscuit — the perfect tea-time companion.',              4000,  4500, 11, '250 g', 'g',  '1558961363-fa8fdf82db35',   ['marie','biscuit','britannia','crispy','light'],      false, 4.5, 1450),
  mk('biscuits-cookies', 'Sunfeast',   'Sunfeast Bounce Strawberry Cream','Soft, fun cream biscuit with a strawberry surprise — kids love it!',                 3500,  4000, 13, '200 g', 'g',  '1499636136210-6f4ee915583e', ['cream biscuit','strawberry','kids','sunfeast'],      false, 4.3, 520),
  mk('biscuits-cookies', 'Britannia',  'Britannia Tiger Glucose',          'Energy-packed glucose biscuit fortified with iron and vitamins for growing kids.',   2500,  3000, 17, '200 g', 'g',  '1558961363-fa8fdf82db35',   ['tiger','glucose','kids','energy','fortified'],       false, 4.4, 680),

  // ── CHOCOLATES & SWEETS ─────────────────────────────────────
  mk('chocolates-sweets', 'Cadbury',  'Cadbury Dairy Milk Silk',          'Silky smooth milk chocolate — velvety, rich, and the perfect gift for loved ones.',  20000, 23000, 13, '145 g', 'g',  '1481391319762-47dff72954d9', ['dairy milk silk','chocolate','premium','cadbury'],    true,  4.8, 3200),
  mk('chocolates-sweets', 'Cadbury',  'Cadbury 5 Star',                   'Chewy caramel and chocolate combo — the classic Indian chocolate bar.',               1500,  1500,  0, '40 g',  'g',  '1481391319762-47dff72954d9', ['5 star','cadbury','caramel','chocolate'],            false, 4.6, 2800),
  mk('chocolates-sweets', 'Nestlé',   'KitKat 4 Finger',                  'Crispy wafer fingers coated in smooth milk chocolate. Have a break!',                3000,  3500, 14, '37 g',  'g',  '1606312619070-d48b4c652a52', ['kitkat','wafer','chocolate','nestle'],               true,  4.7, 4100),
  mk('chocolates-sweets', 'Nestlé',   'Munch Choco Crunch',               'Crispy rice wafer covered in milk chocolate — light and crunchy.',                   1000,  1000,  0, '25.5 g','g',  '1606312619070-d48b4c652a52', ['munch','nestle','chocolate','wafer'],                false, 4.5, 2600),
  mk('chocolates-sweets', 'Cadbury',  'Perk Chocolate',                   'Light wafer chocolate bar — the perfect light chocolate snack.',                      1000,  1000,  0, '33 g',  'g',  '1481391319762-47dff72954d9', ['perk','cadbury','wafer','light'],                    false, 4.5, 1900),
  mk('chocolates-sweets', 'Ferrero',  'Ferrero Rocher Gift Box',          'Premium hazelnut chocolates in a luxurious gold presentation box. Perfect gifting.',  49000, 55000, 11, '16 pcs','pcs','1481391319762-47dff72954d9', ['ferrero rocher','premium','gift','hazelnut'],        true,  4.8, 1200),
  mk('chocolates-sweets', 'Mars',     'Snickers Chocolate Bar',           'Peanuts, nougat, caramel, and chocolate — hunger doesn\'t stand a chance.',          5500,  6500, 15, '50 g',  'g',  '1481391319762-47dff72954d9', ['snickers','peanut','caramel','mars'],                false, 4.6, 1400),
  mk('chocolates-sweets', 'Mars',     'Mars Bar',                         'Smooth milk chocolate with soft nougat and caramel — an iconic indulgence.',         5500,  6500, 15, '51 g',  'g',  '1481391319762-47dff72954d9', ['mars bar','chocolate','nougat','caramel'],           false, 4.5, 980),
  mk('chocolates-sweets', 'Cadbury',  'Cadbury Celebration Gift Pack',    'Assorted pack of Dairy Milk, 5 Star, Perk, and Gems — perfect for every occasion.', 49000, 55000, 11, '248.4 g','g', '1481391319762-47dff72954d9', ['celebration','cadbury','gift pack','assorted'],      true,  4.7, 2100),
  mk('chocolates-sweets', "Haldiram's",'Haldirams Soan Papdi',            'Flaky, melt-in-mouth soan papdi — the quintessential Indian festive sweet.',         9900, 12000, 18, '250 g', 'g',  '1481391319762-47dff72954d9', ['soan papdi','indian sweet','festive','haldirams'],   false, 4.4, 760),

  // ── BREAKFAST & SAUCES ──────────────────────────────────────
  mk('breakfast-sauces', "Kellogg's", "Kellogg's Corn Flakes",           'Classic crunchy corn flakes — the original wholesome breakfast cereal.',             33500, 38000, 12, '875 g', 'g',  '1517093157656-b9eccef91cb1', ['cornflakes','breakfast','kelloggs','cereal'],         true,  4.4, 1100),
  mk('breakfast-sauces', 'Saffola',   'Saffola Oats Classic Creamy',     'Instant oats with added goodness — a healthy, hearty breakfast in minutes.',         23900, 27000, 11, '1 kg',  'kg', '1517093157656-b9eccef91cb1', ['oats','saffola','healthy','breakfast'],               false, 4.5, 890),
  mk('breakfast-sauces', 'Quaker',    'Quaker Oats',                     'Classic rolled oats — naturally nutritious and heart-healthy breakfast option.',      22000, 25000, 12, '1 kg',  'kg', '1517093157656-b9eccef91cb1', ['oats','quaker','heart healthy','wholegrain'],         true,  4.6, 1200),
  mk('breakfast-sauces', 'Kissan',    'Kissan Mixed Fruit Jam',          'Fruity jam made with real mixed fruit pulp — perfect on bread, roti, and parathas.', 15500, 18000, 14, '500 g', 'g',  '1517093157656-b9eccef91cb1', ['jam','mixed fruit','kissan','breakfast','spread'],    false, 4.4, 780),
  mk('breakfast-sauces', 'Kissan',    'Kissan Tomato Ketchup',           'Classic tomato ketchup — thick, tangy, and loved by kids and adults alike.',         13500, 15500, 13, '500 g', 'g',  '1517093157656-b9eccef91cb1', ['ketchup','tomato','kissan','sauce'],                  false, 4.5, 1100),
  mk('breakfast-sauces', 'Maggi',     'Maggi Hot & Sweet Sauce',         'The iconic chilli-tomato sauce — perfect with samosas, pakoras, and chips.',         13000, 15000, 13, '450 g', 'g',  '1517093157656-b9eccef91cb1', ['hot sweet','sauce','maggi','chilli tomato'],          false, 4.6, 1300),
  mk('breakfast-sauces', 'Del Monte',  'Del Monte Peanut Butter Smooth', 'Creamy smooth peanut butter — rich in protein, great for toast and smoothies.',     28500, 32000, 11, '465 g', 'g',  '1517093157656-b9eccef91cb1', ['peanut butter','smooth','protein','del monte'],       true,  4.6, 920),
  mk('breakfast-sauces', 'Veeba',     'Veeba Olive Mayonnaise',          'Light, creamy mayonnaise made with real olive oil — elevates every snack.',          12900, 15000, 14, '250 g', 'g',  '1517093157656-b9eccef91cb1', ['mayo','mayonnaise','veeba','olive'],                  false, 4.3, 420),
  mk('breakfast-sauces', 'Horlicks',  'Horlicks Classic Malt',           'The great family nourisher — malted milk drink with essential vitamins and minerals.', 29900, 34000, 12, '500 g', 'g',  '1517093157656-b9eccef91cb1', ['horlicks','malt','health drink','family'],            true,  4.4, 1500),
  mk('breakfast-sauces', "Kellogg's", "Kellogg's Chocos",                'Chocolate-flavoured crunchy pillows of whole wheat — kids\' favourite breakfast.',   24900, 27000,  8, '700 g', 'g',  '1517093157656-b9eccef91cb1', ['chocos','chocolate','kelloggs','kids','cereal'],      false, 4.5, 780),
  mk('breakfast-sauces', 'Bournvita', 'Bournvita 5 Star Magic',          'Delicious chocolate health drink — rich in cocoa, iron, and vitamin D.',             29900, 34000, 12, '500 g', 'g',  '1481391319762-47dff72954d9', ['bournvita','chocolate','health drink','cadbury'],     false, 4.5, 1200),
  mk('breakfast-sauces', 'Kissan',    'Kissan Peanut Butter Crunchy',    'Chunky peanut butter with whole peanut pieces — bold flavour and satisfying crunch.', 17500, 20000, 13, '350 g', 'g',  '1517093157656-b9eccef91cb1', ['peanut butter','crunchy','kissan','protein'],         false, 4.4, 380),

  // ── PACKAGED FOOD ───────────────────────────────────────────
  mk('packaged-food', 'Nestlé',      'Nestlé Milkmaid Condensed Milk',  'Sweet, thick condensed milk — perfect for desserts, barfis, and kheer.',             13900, 15500, 10, '400 g', 'g',  '1563636619-e9143da7973b', ['condensed milk','milkmaid','nestle','dessert'],       false, 4.5, 680),
  mk('packaged-food', 'MTR',         'MTR Gulab Jamun Mix',             'Easy-to-make gulab jamun mix — soft, spongy jamuns in restaurant quality.',           9900, 11500, 14, '200 g', 'g',  '1481391319762-47dff72954d9', ['gulab jamun','sweet','mtr','dessert mix'],           true,  4.6, 780),
  mk('packaged-food', 'Gits',        'Gits Dal Makhani Mix',            'Restaurant-style dal makhani in 10 minutes — rich, creamy, and aromatic.',           15500, 17500, 11, '400 g', 'g',  '1515543779262-b3b69c0a6f8b', ['dal makhani','gits','ready mix','restaurant style'], false, 4.4, 420),
  mk('packaged-food', 'Knorr',       'Knorr Mixed Vegetable Soup',      'Comforting mixed vegetable soup — just add water and enjoy in minutes.',              5500,  6500, 15, '53 g',  'g',  '1547592166-23ac45744acd',   ['soup','knorr','veg soup','instant'],                 false, 4.3, 540),
  mk('packaged-food', 'Del Monte',   'Del Monte Sweet Corn (Canned)',   'Ready-to-use sweet corn kernels — great for salads, pastas, and quick snacks.',      12000, 14000, 14, '410 g', 'g',  '1601648764658-cf37e8c89b70', ['sweet corn','canned','del monte','salad'],            false, 4.3, 350),
  mk('packaged-food', 'Nestlé',      'Nestlé Milo Energy Drink Powder', 'Chocolate malt energy drink for active kids — packed with Actigen-E goodness.',      13500, 15500, 13, '200 g', 'g',  '1481391319762-47dff72954d9', ['milo','chocolate','energy','kids','nestle'],          false, 4.4, 420),
  mk('packaged-food', 'MTR',         'MTR Ready to Eat Palak Paneer',   'Authentic restaurant-style palak paneer — ready to eat in just 3 minutes.',          15500, 17500, 11, '300 g', 'g',  '1565557623262-b51c2513a641', ['palak paneer','ready to eat','mtr','quick'],         true,  4.3, 380),
  mk('packaged-food', 'Haldiram',    'Haldirams Aloo Matar Ready to Eat','Flavourful aloo matar curry — ready to serve in minutes, just heat and eat.',       13000, 15000, 13, '300 g', 'g',  '1565557623262-b51c2513a641', ['aloo matar','ready to eat','haldiram','quick meal'],  false, 4.2, 290),
  mk('packaged-food', 'MTR',         'MTR Rasam Powder',                'Authentic South Indian rasam powder — tangy, peppery, and simply irresistible.',      9900, 11500, 14, '200 g', 'g',  '1596040033229-a537fe33002c', ['rasam powder','mtr','south indian','spices'],         false, 4.6, 320),
  mk('packaged-food', 'Gits',        'Gits Instant Khichdi Mix',        'Wholesome khichdi mix — comfort food ready in 5 minutes. A one-pot meal.',           12500, 14500, 14, '350 g', 'g',  '1565557623262-b51c2513a641', ['khichdi','gits','comfort food','instant mix'],        false, 4.3, 280),
  mk('packaged-food', 'Amul',        'Amul Dark Chocolate',             'Intense 55% cocoa dark chocolate — rich, bitter-sweet, and luxurious.',              14500, 16500, 12, '150 g', 'g',  '1481391319762-47dff72954d9', ['dark chocolate','amul','cocoa','bittersweet'],       false, 4.5, 560),
  mk('packaged-food', 'Nestlé',      'Nestlé KitKat Senses Gift Box',   'Assorted KitKat collection in a premium gift box — for the chocolate lover in you.', 49000, 55000, 11, '258 g', 'g',  '1606312619070-d48b4c652a52', ['kitkat','gift box','assorted','nestle'],              true,  4.7, 450),

  // ── INSTANT & READY TO EAT ──────────────────────────────────
  mk('instant-food', 'Maggi',        'Maggi 2-Minute Noodles Masala',   'India\'s favourite instant noodles with the iconic masala taste. Ready in 2 minutes.', 1400,  1500,  7, '70 g',  'g',  '1569718212165-3a8278d5f624', ['noodles','maggi','instant','masala'],                true,  4.7, 6200),
  mk('instant-food', 'MTR',          'MTR Upma Mix',                    'Ready-to-cook upma mix for a quick, authentic South Indian breakfast.',               5500,  6000,  8, '500 g', 'g',  '1565557623262-b51c2513a641', ['upma','breakfast','instant','mtr'],                  false, 4.3, 340),
  mk('instant-food', 'Sunfeast',     'Sunfeast Yippee Magic Masala Noodles','Wavy noodles with masala that sticks — no clumping, big flavour.',              1400,  1500,  7, '70 g',  'g',  '1569718212165-3a8278d5f624', ['yippee','noodles','sunfeast','wavy'],                false, 4.5, 1800),
  mk('instant-food', 'Nestlé',       "Maggi Atta Noodles Masala",       'Whole wheat atta noodles — the healthier 2-minute noodles with real masala taste.',   1600,  1800, 11, '70 g',  'g',  '1569718212165-3a8278d5f624', ['atta noodles','maggi','whole wheat','healthy'],      false, 4.3, 540),
  mk('instant-food', 'Top Ramen',    'Top Ramen Curry Noodles',         'Classic noodles in rich curry flavour — quick, satisfying, and delicious.',           1400,  1500,  7, '70 g',  'g',  '1569718212165-3a8278d5f624', ['top ramen','curry','noodles','instant'],             false, 4.2, 420),
  mk('instant-food', 'Knorr',        'Knorr Classic Tomato Soup',       'Rich, velvety tomato soup — just add hot water for a warming bowl of goodness.',      5500,  6500, 15, '53 g',  'g',  '1547592166-23ac45744acd',   ['soup','tomato','knorr','instant'],                   false, 4.4, 820),
  mk('instant-food', 'MTR',          'MTR Malabar Parotta',             'Ready-to-eat flaky Malabar parotta — heat and serve with any curry.',                14900, 17000, 12, '400 g', 'g',  '1565557623262-b51c2513a641', ['parotta','malabar','mtr','ready'],                   false, 4.3, 260),
  mk('instant-food', 'Gits',         'Gits Dosa Mix',                   'Ready-mix for crispy, golden dosas — no overnight soaking or grinding needed.',       9900, 11500, 14, '200 g', 'g',  '1565557623262-b51c2513a641', ['dosa mix','gits','instant','south indian'],          false, 4.4, 310),
  mk('instant-food', 'MTR',          'MTR Sambar Powder',               'Traditional sambar powder from MTR — rich, tangy, and full of South Indian spices.',   9500, 11000, 14, '200 g', 'g',  '1596040033229-a537fe33002c', ['sambar powder','mtr','south indian','spices'],       false, 4.6, 580),
  mk('instant-food', 'Maggi',        'Maggi Oats Masala Noodles',       'Oats-based masala noodles — taste you love with added fibre of oats.',                1600,  1800, 11, '70 g',  'g',  '1569718212165-3a8278d5f624', ['oats noodles','maggi','healthy','fibre'],            false, 4.2, 380),
  mk('instant-food', 'Sunfeast',     'Sunfeast Yippee Desi Masala',     'Yippee noodles in a bold desi masala flavour — made for the adventurous palate.',    1400,  1500,  7, '70 g',  'g',  '1569718212165-3a8278d5f624', ['yippee','desi masala','noodles','bold'],             false, 4.3, 620),
  mk('instant-food', 'Knorr',        'Knorr Chicken Corn Soup',         'Thick chicken and corn soup — warm, hearty, and ready in minutes.',                   5500,  6500, 15, '53 g',  'g',  '1547592166-23ac45744acd',   ['chicken soup','corn','knorr','warm'],                false, 4.3, 350),

  // ── BEVERAGES ───────────────────────────────────────────────
  mk('beverages', 'Real',          'Real Fruit Juice Mixed Fruit',      '100% pure fruit juice with no added sugar — the taste of real fruits.',               5500,  6500, 15, '1 L',    'ml', '1621506289937-a8e4df240d0b', ['juice','mixed fruit','real','no sugar'],              true,  4.4, 780),
  mk('beverages', 'Red Bull',      'Red Bull Energy Drink',             'The original energy drink with caffeine, taurine, and B vitamins.',                  12500, 13500,  7, '250 ml', 'ml', '1629203851122-3726ecdf080e', ['energy drink','red bull','caffeine','boost'],         true,  4.3, 560),
  mk('beverages', 'Bisleri',       'Bisleri Mineral Water',             'Pure, safe drinking mineral water — the original packaged water of India.',           2000,  2000,  0, '1 L',    'ml', '1548839140-29a749e1cf4d',   ['water','bisleri','mineral','pure'],                   false, 4.2, 1100),
  mk('beverages', 'Coca-Cola',     'Coca-Cola Original',                'The classic refreshing cola drink — best served ice cold.',                           4500,  5000, 10, '750 ml', 'ml', '1554866585-cd94860890b7',   ['cola','coca-cola','refreshing','fizzy'],              true,  4.5, 1800),
  mk('beverages', 'Coca-Cola',     'Thums Up Strong Cola',              'India\'s bold, strong cola — with an extra kick of carbonation and flavour.',         4500,  5000, 10, '750 ml', 'ml', '1554866585-cd94860890b7',   ['thums up','cola','strong','fizzy'],                   false, 4.6, 1400),
  mk('beverages', 'Coca-Cola',     'Limca Lime Lemon',                  'Refreshing lime-lemon soda — tangy, fizzy, and perfectly refreshing.',               4500,  5000, 10, '750 ml', 'ml', '1554866585-cd94860890b7',   ['limca','lime','lemon','soda','refreshing'],           false, 4.3, 920),
  mk('beverages', 'Coca-Cola',     'Sprite Lemon-Lime',                 'Crystal-clear lemon-lime soda — no caffeine, all refreshment.',                      4500,  5000, 10, '750 ml', 'ml', '1554866585-cd94860890b7',   ['sprite','lemon lime','soda','fizzy'],                false, 4.4, 1100),
  mk('beverages', 'Pepsi',         'Pepsi Original',                    'Bold cola flavour with a refreshing kick — the choice of a new generation.',          4500,  5000, 10, '750 ml', 'ml', '1554866585-cd94860890b7',   ['pepsi','cola','refreshing','bold'],                   false, 4.4, 1200),
  mk('beverages', 'Pepsi',         '7UP Lemon-Lime Drink',              'Clean, crisp lemon-lime taste — refreshing and clear.',                              4500,  5000, 10, '750 ml', 'ml', '1621506289937-a8e4df240d0b', ['7up','lemon lime','clear','refreshing'],              false, 4.3, 820),
  mk('beverages', 'Frooti',        'Frooti Mango Drink',                'Juicy, pulpy mango drink — the taste of fresh mangoes in every sip.',                1500,  1800, 17, '200 ml', 'ml', '1621506289937-a8e4df240d0b', ['frooti','mango','juice','kids'],                     false, 4.5, 1600),
  mk('beverages', 'Appy',          'Appy Fizz Apple Sparkling Drink',   'Sparkling apple juice drink — the fun, fizzy way to enjoy apple flavour.',           2500,  3000, 17, '250 ml', 'ml', '1621506289937-a8e4df240d0b', ['appy fizz','apple','sparkling','fun'],               false, 4.4, 680),
  mk('beverages', 'Maaza',         'Maaza Mango Drink',                 'Pure mango drink made from real Alfonso mango pulp — thick, luscious, and filling.', 7900,  9500, 17, '1.2 L',  'ml', '1621506289937-a8e4df240d0b', ['maaza','mango','thick','alphonso'],                  false, 4.5, 1100),
  mk('beverages', 'Tropicana',     'Tropicana 100% Apple Juice',        '100% apple juice with no added sugar — pure fruit goodness in every glass.',         9500, 11000, 14, '1 L',    'ml', '1621506289937-a8e4df240d0b', ['apple juice','tropicana','pure','no sugar'],          true,  4.5, 890),
  mk('beverages', 'Minute Maid',   'Minute Maid Nimbu Fresh',           'Refreshing lime-flavoured drink with real lime extracts — tangy and delicious.',      8900, 10500, 15, '1 L',    'ml', '1621506289937-a8e4df240d0b', ['nimbu','lime','minute maid','refreshing'],            false, 4.3, 520),
  mk('beverages', 'Monster',       'Monster Energy Original',           'Monster energy with a massive dose of B vitamins and caffeine to keep you going.',    18000, 20000, 10, '473 ml', 'ml', '1629203851122-3726ecdf080e', ['monster','energy','caffeine','boost'],               false, 4.2, 380),

  // ── TEA & COFFEE ────────────────────────────────────────────
  mk('tea-coffee', 'Tata',         'Tata Tea Premium',                  'Premium tea blend with selected Assam and Darjeeling leaves — bold, aromatic brew.',  22500, 26000, 13, '500 g', 'g',  '1558618666-fcd25c85cd64',   ['tea','tata tea','premium','assam','darjeeling'],      true,  4.7, 1700),
  mk('tea-coffee', 'Tata',         'Tata Tea Gold',                     'Best of Assam and Darjeeling teas — for a superior cup with uplifting aroma.',        24000, 27500, 13, '500 g', 'g',  '1558618666-fcd25c85cd64',   ['tea','gold','tata','premium'],                        false, 4.7, 1100),
  mk('tea-coffee', 'Red Label',    'Red Label Natural Care Tea',        'Tea with natural goodness of ginger, cardamom, basil, and tulsi. Immunity-boosting.', 13500, 15500, 13, '250 g', 'g',  '1558618666-fcd25c85cd64',   ['tea','natural care','ginger','tulsi','immunity'],    false, 4.6, 980),
  mk('tea-coffee', 'Tata',         'Wagh Bakri Premium Tea',            'Strong and full-bodied tea from Gujarat — rich golden brew with lasting flavour.',    19000, 22000, 14, '500 g', 'g',  '1558618666-fcd25c85cd64',   ['wagh bakri','tea','gujarat','strong'],                false, 4.6, 760),
  mk('tea-coffee', 'Nescafé',      'Nescafé Classic Instant Coffee',    'Rich, aromatic instant coffee — for a perfect cup of café-style coffee at home.',    13000, 15000, 13, '50 g',  'g',  '1447933601403-0c6688de566e', ['coffee','nescafe','instant','aromatic'],              true,  4.6, 2300),
  mk('tea-coffee', 'BRU',          'BRU Gold Instant Coffee',           'Premium coffee blend with Arabica and Robusta beans — smooth, satisfying flavour.',   10900, 12500, 13, '50 g',  'g',  '1447933601403-0c6688de566e', ['coffee','bru','instant','arabica'],                  false, 4.4, 560),
  mk('tea-coffee', 'Nescafé',      'Nescafé Gold Blend',                'Rich premium blend coffee — perfect for those who want a barista-quality cup at home.',49000, 55000, 11, '100 g', 'g',  '1447933601403-0c6688de566e', ['nescafe gold','premium','coffee','barista'],          true,  4.7, 890),
  mk('tea-coffee', 'Tetley',       'Tetley Green Tea Original',         'Pure green tea with natural antioxidants — refreshing, light, and healthy.',          9900, 11500, 14, '25 bags','pcs','1558618666-fcd25c85cd64',   ['green tea','tetley','antioxidant','healthy'],         false, 4.4, 680),
  mk('tea-coffee', 'Lipton',       'Lipton Yellow Label Tea',           'World\'s number 1 tea brand — bright, refreshing, and perfectly balanced brew.',     14500, 16500, 12, '250 g', 'g',  '1558618666-fcd25c85cd64',   ['lipton','tea','yellow label','refreshing'],           false, 4.5, 920),
  mk('tea-coffee', 'Tata',         'Tata Tetley Masala Chai Bags',      'Spicy masala chai in a convenient tea bag — ginger, cardamom, and cinnamon blend.',  9900, 11500, 14, '25 bags','pcs','1558618666-fcd25c85cd64',   ['masala chai','tea bag','tata','ginger'],             false, 4.4, 450),

  // ── ICE CREAM & FROZEN FOOD ──────────────────────────────────
  mk('ice-cream-frozen', 'Amul',          'Amul Vanilla Royale Ice Cream',  'Classic creamy vanilla ice cream — smooth, rich, and delightfully indulgent.',        18000, 20000, 10, '1 L',     'ml', '1497034825429-c343d7c6a68f', ['ice cream','vanilla','amul','creamy'],                false, 4.5, 760),
  mk('ice-cream-frozen', "Kwality Wall's",'Kwality Walls Mango Dolly Kulfi','Authentic kulfi with mango flavour — the classic Indian summer treat on a stick.',   12000, 14000, 14, '60 ml × 4','ml', '1497034825429-c343d7c6a68f', ['kulfi','mango','kwality walls','summer'],            true,  4.6, 580),
  mk('ice-cream-frozen', 'Amul',          'Amul Chocobar',                  'Creamy vanilla ice cream coated in rich chocolate — an all-time favourite.',           3000,  3500, 14, '60 ml',   'ml', '1497034825429-c343d7c6a68f', ['chocobar','chocolate','amul','classic'],             false, 4.6, 1200),
  mk('ice-cream-frozen', "Kwality Wall's",'Kwality Walls Feast Choco Bar',  'Chunky chocolate-coated ice cream bar — premium ingredients, pure indulgence.',        3000,  3500, 14, '76 ml',   'ml', '1497034825429-c343d7c6a68f', ['feast','chocolate bar','kwality walls'],             false, 4.4, 670),
  mk('ice-cream-frozen', 'Vadilal',       'Vadilal Rajbhog Ice Cream',      'Traditional Rajbhog flavour — saffron, kesar, and pistachio in creamy ice cream.',    25000, 28500, 12, '750 ml',  'ml', '1497034825429-c343d7c6a68f', ['rajbhog','kesar','vadilal','premium'],               false, 4.6, 380),
  mk('ice-cream-frozen', 'Amul',          'Amul Strawberry Ice Cream',      'Strawberry flavoured ice cream bursting with real fruit pieces — fresh and fruity.',   17500, 20000, 13, '500 ml',  'ml', '1497034825429-c343d7c6a68f', ['strawberry','ice cream','amul','fruit'],             false, 4.4, 450),
  mk('ice-cream-frozen', 'Mother Dairy',  'Mother Dairy Kulfi Bar',         'Classic kulfi on a stick — dense, creamy, with a hint of cardamom and saffron.',      2500,  3000, 17, '70 g',    'g',  '1497034825429-c343d7c6a68f', ['kulfi','mother dairy','classic','cardamom'],         false, 4.5, 340),
  mk('ice-cream-frozen', 'McCain',        'McCain Smiles Frozen Potato Snacks','Happy face potato snacks — crispy outside, fluffy inside. Kids love them!',         17000, 19500, 13, '450 g',   'g',  '1518977676601-b53f82aba655', ['frozen','potato','mccain','kids'],                   false, 4.3, 290),

  // ── BAKERY ──────────────────────────────────────────────────
  mk('bakery', 'Britannia',       'Britannia Whole Wheat Bread',       'Soft whole wheat bread with added fibre — perfect for everyday sandwiches and toast.',   5200,  6000, 13, '400 g', 'g',  '1509440159596-0249088772ff', ['bread','wheat','britannia','toast'],                 false, 4.5, 1100),
  mk('bakery', 'Harvest Gold',    'Harvest Gold White Sandwich Bread', 'Pillowy soft white bread for the perfect sandwich — fresh-baked softness every time.',   4200,  5000, 16, '400 g', 'g',  '1509440159596-0249088772ff', ['bread','white','sandwich','harvest gold'],           false, 4.3, 650),
  mk('bakery', 'English Oven',    'English Oven Multigrain Bread',     'Artisan multigrain bread with 5 grains — nutritious, dense, and full of flavour.',       6500,  7500, 13, '400 g', 'g',  '1509440159596-0249088772ff', ['multigrain','bread','english oven','artisan'],       true,  4.5, 420),
  mk('bakery', 'Modern',          'Modern Brown Bread',                'Classic brown bread — moist, hearty, and perfect for healthy sandwiches.',               5500,  6500, 15, '400 g', 'g',  '1509440159596-0249088772ff', ['brown bread','modern','healthy','sandwich'],          false, 4.3, 380),
  mk('bakery', "The Baker's Dozen",'The Baker\'s Dozen Sourdough',    'Slow-fermented sourdough with a crispy crust and chewy interior — artisan quality.',    25000, 28500, 12, '500 g', 'g',  '1509440159596-0249088772ff', ['sourdough','artisan','bakers dozen','premium'],      true,  4.7, 280),
  mk('bakery', 'Britannia',       'Britannia Cake (Fruit & Nut)',      'Moist fruit cake packed with raisins, cashews, and cherries — a celebration cake.',     9000, 10500, 14, '250 g', 'g',  '1509440159596-0249088772ff', ['cake','fruit cake','britannia','celebration'],       false, 4.4, 560),
  mk('bakery', 'Pillsbury',       'Pillsbury Chocolate Mug Cake Mix',  'Make a rich chocolate mug cake in just 90 seconds — no baking expertise required.',    12900, 15000, 14, '250 g', 'g',  '1481391319762-47dff72954d9', ['mug cake','chocolate','pillsbury','quick'],           false, 4.3, 320),
  mk('bakery', 'Britannia',       'Britannia Rusk Toast',              'Crunchy, twice-baked rusk — the perfect companion for your morning chai or coffee.',    5000,  5800, 14, '225 g', 'g',  '1509440159596-0249088772ff', ['rusk','toast','britannia','chai'],                   false, 4.4, 780),
  mk('bakery', 'Pillsbury',       'Pillsbury Eggless Vanilla Cake Mix','Eggless cake mix for a moist, fluffy vanilla cake — easy to bake at home.',            14900, 17000, 12, '225 g', 'g',  '1509440159596-0249088772ff', ['vanilla cake','eggless','pillsbury','baking'],       false, 4.3, 260),
  mk('bakery', 'Modern',          'Modern Pav (Dinner Rolls)',         'Soft, pillowy pav buns — perfect with bhaji, vada pav, or as dinner rolls.',           3500,  4000, 13, '8 pcs', 'pcs','1509440159596-0249088772ff', ['pav','dinner rolls','soft','modern'],                false, 4.4, 680),

  // ── MEAT & SEAFOOD ──────────────────────────────────────────
  mk('meat-seafood', 'Licious',  'Licious Fresh Chicken Breast',       'Fresh, antibiotic-free chicken breast — cleaned, washed, and ready to cook.',         19900, 23000, 13, '500 g', 'g',  '1546547843-f41c2eff-e85c',  ['chicken breast','fresh','licious','protein'],         true,  4.6, 680),
  mk('meat-seafood', 'Licious',  'Licious Chicken Curry Cut',          'Bone-in chicken curry cut — fresh, cleaned, and perfectly portioned for curries.',     17900, 21000, 15, '500 g', 'g',  '1546547843-f41c2eff-e85c',  ['chicken curry cut','fresh','licious','curry'],        false, 4.5, 540),
  mk('meat-seafood', 'Godrej',   'Godrej Real Good Chicken Keema',     'Fresh minced chicken keema — antibiotic-free, great for kebabs and stuffings.',        17900, 21000, 15, '500 g', 'g',  '1546547843-f41c2eff-e85c',  ['chicken keema','minced','godrej','kebab'],            false, 4.4, 340),
  mk('meat-seafood', 'Licious',  'Licious Mutton Curry Cut',           'Fresh, farm-sourced mutton curry cut — tender pieces for the perfect mutton curry.',   39900, 45000, 11, '500 g', 'g',  '1546547843-f41c2eff-e85c',  ['mutton','curry cut','licious','fresh'],               true,  4.5, 420),
  mk('meat-seafood', 'Licious',  'Licious Prawns (Cleaned)',           'Fresh prawns — deveined, cleaned, and ready to cook for your favourite prawn dishes.', 29900, 34000, 12, '300 g', 'g',  '1546547843-f41c2eff-e85c',  ['prawns','seafood','fresh','cleaned'],                 false, 4.4, 290),
  mk('meat-seafood', 'Licious',  'Licious Rohu Fish Curry Cut',        'Fresh Rohu fish curry cut — cleaned, scaled, and ready for a delicious fish curry.',  17900, 21000, 15, '500 g', 'g',  '1546547843-f41c2eff-e85c',  ['fish','rohu','curry cut','fresh'],                    false, 4.3, 220),
  mk('meat-seafood', 'Licious',  'Licious Chicken Seekh Kebab',        'Pre-marinated chicken seekh kebabs — just grill or pan-fry for restaurant-style taste.',34900, 39000, 11, '500 g', 'g',  '1546547843-f41c2eff-e85c',  ['seekh kebab','chicken','marinated','licious'],        true,  4.5, 380),
  mk('meat-seafood', 'Godrej',   'Godrej Real Good Chicken Wings',     'Fresh chicken wings — great for frying, baking, or grilling. Party-ready!',           14900, 17500, 15, '400 g', 'g',  '1546547843-f41c2eff-e85c',  ['chicken wings','godrej','fresh','party'],             false, 4.4, 280),

  // ── PERSONAL CARE ───────────────────────────────────────────
  mk('personal-care', 'Dove',           'Dove Moisturizing Soap',              'Moisturising soap with ¼ moisturising cream — leaves skin soft and smooth.',          5900,  6500,  9, '100 g × 3','pcs','1607613009820-a29f7bb81c04', ['soap','dove','moisturizing','soft skin'],            false, 4.5, 890),
  mk('personal-care', 'Head & Shoulders','Head & Shoulders Anti-Dandruff',     'Clinically proven anti-dandruff shampoo — visibly dandruff-free hair from wash 1.',  19900, 22000,  9, '340 ml',  'ml', '1585751119414-ef2636f8aede', ['shampoo','anti dandruff','head shoulders'],          false, 4.4, 670),
  mk('personal-care', 'Dettol',         'Dettol Original Antiseptic Soap',     'Antiseptic soap that kills 100 germs — trusted germ protection for the whole family.', 9500, 10500,  9, '75 g × 3','pcs','1607613009820-a29f7bb81c04', ['dettol','antiseptic','soap','germ protection'],     true,  4.6, 1200),
  mk('personal-care', 'Lifebuoy',       'Lifebuoy Total Germ Protection',      'Soap with natural activ silver formula — 100% stronger germ protection for family.',   6500,  7500, 13, '150 g × 3','pcs','1607613009820-a29f7bb81c04', ['lifebuoy','germ protection','soap','family'],       false, 4.4, 780),
  mk('personal-care', 'Dove',           'Dove Body Wash Deeply Nourishing',    'Nourishing body wash that cleans and moisturises — for silky smooth skin daily.',    18500, 21000, 12, '250 ml',  'ml', '1598440947619-2c35fc9aa908', ['body wash','dove','nourishing','skin care'],         false, 4.6, 1340),
  mk('personal-care', 'Pantene',        'Pantene Smooth & Silky Shampoo',      'Advanced formula shampoo for smooth, frizz-free hair that stays manageable all day.',  19900, 22500, 12, '340 ml',  'ml', '1585751119414-ef2636f8aede', ['shampoo','pantene','smooth','silky'],                false, 4.4, 920),
  mk('personal-care', 'Sunsilk',        'Sunsilk Black Shine Shampoo',         'Black shine shampoo with keratin-yogurt fusion — visibly shiny, gorgeous hair.',      16500, 18500, 11, '360 ml',  'ml', '1585751119414-ef2636f8aede', ['shampoo','sunsilk','shine','keratin'],               false, 4.3, 680),
  mk('personal-care', 'Colgate',        'Colgate MaxFresh Toothpaste',         'Whitening toothpaste with breath strips — 24-hour fresh breath and strong teeth.',     9500, 10800, 12, '150 g',   'g',  '1607613009820-a29f7bb81c04', ['toothpaste','colgate','maxfresh','whitening'],       true,  4.7, 2890),
  mk('personal-care', 'Pepsodent',      'Pepsodent Germicheck Toothpaste',     'Fluoride toothpaste with Zinc Citrate — 24-hour protection against tooth decay.',      9900, 11000, 10, '200 g',   'g',  '1607613009820-a29f7bb81c04', ['toothpaste','pepsodent','germicheck','cavity'],      false, 4.4, 780),
  mk('personal-care', 'Sensodyne',      'Sensodyne Rapid Relief Toothpaste',   'Clinically proven toothpaste for sensitive teeth — fast relief from sensitivity.',    19900, 23000, 13, '75 g',    'g',  '1607613009820-a29f7bb81c04', ['toothpaste','sensodyne','sensitive','relief'],       true,  4.6, 1450),
  mk('personal-care', 'Nivea',          'Nivea Men Face Wash',                 'Oil control face wash for men — removes excess oil and unclogs pores.',               19500, 22000, 11, '100 ml',  'ml', '1607613009820-a29f7bb81c04', ['face wash','nivea','men','oil control'],             false, 4.4, 890),
  mk('personal-care', 'Himalaya',       'Himalaya Neem Purifying Face Wash',   'Ayurvedic neem face wash — purifies pores and controls acne for clear skin.',        13500, 15500, 13, '150 ml',  'ml', '1607613009820-a29f7bb81c04', ['face wash','himalaya','neem','acne control'],        false, 4.5, 1100),
  mk('personal-care', 'Vaseline',       'Vaseline Intensive Care Body Lotion', 'Non-greasy body lotion that absorbs instantly — 10× smoother skin in 2 weeks.',      28500, 32500, 12, '400 ml',  'ml', '1598440947619-2c35fc9aa908', ['lotion','vaseline','moisturiser','body'],            false, 4.5, 980),
  mk('personal-care', 'Nivea',          'Nivea Cocoa Butter Body Lotion',      'Rich body lotion with cocoa butter — deeply moisturises and nourishes dry skin.',    29500, 33500, 12, '400 ml',  'ml', '1598440947619-2c35fc9aa908', ['body lotion','cocoa butter','nivea','dry skin'],     true,  4.5, 760),
  mk('personal-care', 'Parachute',      'Parachute Advansed Jasmine Hair Oil', 'Fragrant jasmine hair oil for strong, lustrous hair — nourishes scalp and roots.',   16500, 19000, 13, '300 ml',  'ml', '1585751119414-ef2636f8aede', ['hair oil','parachute','jasmine','lustrous'],         false, 4.5, 1100),
  mk('personal-care', 'Fogg',           'Fogg Black Deodorant Spray',          'Long-lasting fragrance deodorant spray for men — no gas, no water, only perfume.',   29900, 34000, 12, '150 ml',  'ml', '1607613009820-a29f7bb81c04', ['deodorant','fogg','black','men'],                    false, 4.5, 1200),
  mk('personal-care', 'Biotique',       'Biotique Bio Papaya Face Scrub',      'Natural papaya face scrub with papain enzyme — gentle exfoliation for radiant skin.', 16500, 19000, 13, '75 g',    'g',  '1607613009820-a29f7bb81c04', ['face scrub','biotique','papaya','exfoliation'],     false, 4.3, 420),
  mk('personal-care', 'Himalaya',       'Himalaya Aloe Vera Moisturising Gel', 'Pure aloe vera gel — lightweight moisturiser for face and body, soothes skin.',     11500, 13500, 15, '100 g',   'g',  '1598440947619-2c35fc9aa908', ['aloe vera','gel','himalaya','soothing'],             false, 4.5, 680),

  // ── BABY CARE ───────────────────────────────────────────────
  mk('baby-care', 'Pampers',    'Pampers Active Baby Diapers (M)',   'Upto 12-hour dryness protection — soft, gentle, and leak-proof for baby\'s comfort.',  59900, 69900, 14, '30 pcs', 'pcs','1515488042361-ee00e0ddd4e4', ['diapers','pampers','baby','dry'],                    true,  4.6, 1200),
  mk('baby-care', 'Pampers',    'Pampers Baby Pants (L)',            'Pants-style diapers for easy wearing — for active babies who love to move and play.',   69900, 79900, 13, '40 pcs', 'pcs','1515488042361-ee00e0ddd4e4', ['pampers pants','diapers','large','baby'],            true,  4.5, 880),
  mk('baby-care', 'Huggies',    'Huggies Wonder Pants (M)',          'Pants-style diaper with triple layer absorption — for extra dry and comfortable baby.',  49900, 57500, 13, '30 pcs', 'pcs','1515488042361-ee00e0ddd4e4', ['huggies','diapers','wonder pants','baby'],           false, 4.5, 760),
  mk('baby-care', "Johnson's",  "Johnson's Baby Shampoo",            'Clinically proven gentle formula — no more tears, no more harsh chemicals for baby.',   17900, 20500, 13, '200 ml', 'ml', '1585751119414-ef2636f8aede', ['baby shampoo','johnsons','gentle','no tears'],       false, 4.7, 1400),
  mk('baby-care', "Johnson's",  "Johnson's Baby Lotion",             'Dermatologist-tested hypoallergenic lotion — gentle enough for baby\'s delicate skin.', 19900, 22500, 12, '200 ml', 'ml', '1598440947619-2c35fc9aa908', ['baby lotion','johnsons','hypoallergenic','gentle'],  false, 4.7, 1100),
  mk('baby-care', 'Himalaya',   'Himalaya Baby Massage Oil',         'Gentle daily massage oil with olive and winter cherry — promotes baby\'s bone strength.',18500, 21000, 12, '200 ml', 'ml', '1598440947619-2c35fc9aa908', ['baby oil','massage','himalaya','gentle'],            false, 4.6, 680),
  mk('baby-care', "Johnson's",  "Johnson's Baby Powder",             'Classic talc-free baby powder — gentle, soft, and keeps baby fresh and comfortable.',   14500, 16500, 12, '200 g',  'g',  '1515488042361-ee00e0ddd4e4', ['baby powder','johnsons','talc-free','fresh'],        false, 4.6, 860),
  mk('baby-care', 'Mee Mee',    'Mee Mee Baby Wet Wipes',           'Extra soft, alcohol-free wipes — gentle on baby\'s skin for quick clean-ups.',         19900, 22500, 12, '72 pcs', 'pcs','1515488042361-ee00e0ddd4e4', ['baby wipes','mee mee','gentle','alcohol-free'],      false, 4.5, 560),
  mk('baby-care', 'Farex',      'Farex Baby Cereal Rice (Stage 1)',  'First food for babies 6 months+ — fortified with iron, vitamins, and minerals.',        24500, 27500, 11, '300 g',  'g',  '1517093157656-b9eccef91cb1', ['baby food','cereal','farex','stage 1','iron'],       false, 4.4, 320),
  mk('baby-care', 'Nestlé',     'Nestlé NAN PRO 1 Infant Formula',  'Starter infant formula for 0–6 months — designed to be closest to breast milk.',        74500, 82500,  9, '400 g',  'g',  '1515488042361-ee00e0ddd4e4', ['infant formula','nestle','nan pro','newborn'],       false, 4.3, 280),

  // ── CLEANING ESSENTIALS ─────────────────────────────────────
  mk('household', 'Vim',         'Vim Dishwash Bar',                  'Powerful grease-cutting dishwash bar — removes tough stains effortlessly.',              3500,  4000, 13, '300 g',   'g',  '1585336261022-680e295ce3fe', ['dishwash','vim','cleaning','grease'],                false, 4.3, 450),
  mk('household', 'Colin',       'Colin Glass & Surface Cleaner',     'Streak-free shine on glass, mirrors, and surfaces — spray and wipe to perfection.',      7500,  8500, 12, '500 ml',  'ml', '1563453392212-326f5e854473', ['glass cleaner','colin','streak-free','surface'],     false, 4.4, 320),
  mk('household', 'Surf Excel',  'Surf Excel Quick Wash Powder',      'Quick wash detergent — tough on stains, gentle on clothes, great in cold water.',        19500, 22500, 13, '1 kg',    'kg', '1582735689369-4fe89db7114c', ['detergent','surf excel','washing powder','stain'],   true,  4.6, 1200),
  mk('household', 'Ariel',       'Ariel Liquid Detergent',            'Superior cleaning liquid detergent — dissolves completely, no residue, brilliant results.', 29900, 35000, 15, '1 L',  'ml', '1582735689369-4fe89db7114c', ['detergent','ariel','liquid','laundry'],              true,  4.6, 890),
  mk('household', 'Tide',        'Tide Plus Double Power Powder',     'Double power technology — tough on 15 types of stains, protects fabric colour.',        18500, 21000, 12, '1 kg',    'kg', '1582735689369-4fe89db7114c', ['detergent','tide','double power','stain'],           false, 4.4, 680),
  mk('household', 'Rin',         'Rin Detergent Powder Advanced',     'Advanced formula with 1000+ surfactants — removes tough stains and keeps clothes white.', 14900, 17000, 12, '1 kg',   'kg', '1582735689369-4fe89db7114c', ['detergent','rin','washing powder','white'],          false, 4.3, 540),
  mk('household', 'Harpic',      'Harpic Power Plus',                 '10× more power to remove tough toilet stains — kills 99.9% germs in the toilet bowl.', 12500, 14500, 14, '500 ml',  'ml', '1584515933487-779824d29309', ['toilet cleaner','harpic','germ kill','powerful'],    false, 4.4, 670),
  mk('household', 'Lizol',       'Lizol Disinfectant Surface Cleaner','Kills 99.9% germs on floors and surfaces — safe, effective, and fragrant.',             23500, 27000, 13, '975 ml',  'ml', '1563453392212-326f5e854473', ['floor cleaner','lizol','disinfectant','germ kill'],   true,  4.5, 780),
  mk('household', 'Domex',       'Domex Multi-Purpose Thick Bleach',  'Thick bleach formula for toilets and surfaces — kills all household germs and bacteria.',15900, 18500, 14, '500 ml',  'ml', '1584515933487-779824d29309', ['bleach','domex','germ kill','toilets'],              false, 4.3, 390),
  mk('household', 'Pril',        'Pril Power Degreaser Dishwash Gel', 'Concentrated gel that cuts through tough grease — sparkling clean dishes every time.',  13500, 15500, 13, '500 ml',  'ml', '1585336261022-680e295ce3fe', ['dishwash gel','pril','degreaser','sparkling'],       false, 4.4, 420),
  mk('household', 'Vim',         'Vim Anti-Bacterial Dishwash Gel',   'Dishwash gel with antibacterial protection — 100% hygiene for your family\'s utensils.',12500, 14500, 14, '500 ml',  'ml', '1585336261022-680e295ce3fe', ['dishwash','vim','antibacterial','hygiene'],           false, 4.4, 360),
  mk('household', 'Dettol',      'Dettol Floor Cleaner',              'Multi-surface disinfectant floor cleaner — kills germs, gives a sparkling fresh scent.', 14500, 16500, 12, '500 ml',  'ml', '1563453392212-326f5e854473', ['floor cleaner','dettol','disinfectant','fresh'],     false, 4.4, 450),

  // ── HOME & KITCHEN ──────────────────────────────────────────
  mk('home-kitchen', 'Cello',       'Cello Whizzo Plastic Container Set','Airtight, leakproof containers for fresh food storage — microwave safe, BPA-free.',  34900, 39900, 13, '4 pcs',  'pcs','1534452203293-494d7ddbf7e0', ['containers','cello','storage','airtight'],           false, 4.3, 560),
  mk('home-kitchen', 'Milton',      'Milton Casserole Steel Lunch Box', 'Stainless steel lunch box with 3 containers — keeps food hot for 5 hours.',           59900, 69900, 14, '3 pcs',  'pcs','1556909114-f6e7ad7d3136',   ['lunch box','milton','steel','hot','containers'],     true,  4.5, 380),
  mk('home-kitchen', 'Pigeon',      'Pigeon Non-Stick Frying Pan',     'Lightweight non-stick pan for healthy oil-free cooking — easy to clean and use.',      69900, 79900, 13, '24 cm',  'cm', '1556909114-f6e7ad7d3136',   ['frying pan','pigeon','non-stick','cooking'],         false, 4.3, 290),
  mk('home-kitchen', 'Prestige',    'Prestige Clip-On Pressure Cooker','Strong, durable pressure cooker — cooks food faster and retains nutrients.',           129900,149900, 13, '3 L',    'L',  '1556909114-f6e7ad7d3136',   ['pressure cooker','prestige','cook','durable'],       true,  4.5, 420),
  mk('home-kitchen', 'Borosil',     'Borosil Glass Meal Saver Set',    'Borosilicate glass containers — microwave, oven, and dishwasher safe storage.',       79900, 89900, 11, '4 pcs',  'pcs','1534452203293-494d7ddbf7e0', ['glass containers','borosil','microwave safe'],       false, 4.4, 280),
  mk('home-kitchen', 'Scotch-Brite','Scotch-Brite Heavy Duty Scrubber','Tough scrubbing pad for stubborn grease — scratch-free on non-stick cookware.',        14900, 17000, 12, '6 pcs',  'pcs','1585336261022-680e295ce3fe', ['scrubber','scotch-brite','cleaning','kitchen'],      false, 4.4, 380),
  mk('home-kitchen', 'Halonix',     'Halonix 9W LED Bulb (Cool White)','Energy-saving LED bulb with 3 year warranty — bright, long-lasting, and eco-friendly.',9900, 11500, 14, '1 pcs',  'pcs','1550009158-9ebf69173e03',   ['led bulb','halonix','energy saving','cool white'],   false, 4.3, 560),
  mk('home-kitchen', 'Cello',       'Cello Folding Chopping Board',    'Non-slip, foldable chopping board — hygienic and easy to clean, stores flat.',         19900, 23000, 13, '1 pcs',  'pcs','1556909114-f6e7ad7d3136',   ['chopping board','cello','kitchen','foldable'],       false, 4.2, 190),
  mk('home-kitchen', 'Milton',      'Milton Thermosteel Flask 1L',     'Double-wall vacuum flask — keeps beverages hot for 24 hours and cold for 12 hours.',  119900,139900, 14, '1 L',    'L',  '1548839140-29a749e1cf4d',   ['flask','milton','thermosteel','hot cold'],           true,  4.6, 460),
  mk('home-kitchen', 'Scotch-Brite','Scotch-Brite Kitchen Sponge Wipe','Sponge wipe that cleans better with less effort — absorbs liquid and cleans surfaces.',7900,  9500, 17, '3 pcs',  'pcs','1585336261022-680e295ce3fe', ['sponge','scotch-brite','wipe','kitchen'],            false, 4.3, 310),

  // ── STATIONERY & OFFICE ─────────────────────────────────────
  mk('stationery', 'Classmate',     'Classmate Single Line Notebook',  'A4 ruled notebook with 160 pages — smooth writing experience for students.',           7500,  8800, 15, '160 pages','pcs','1484101418753-36742b4fab60', ['notebook','classmate','student','ruled'],            false, 4.5, 780),
  mk('stationery', 'Classmate',     'Classmate Interleaved Notebook',  'Interleaved notebook for neat note-taking — 192 pages with integrated insert sheets.', 8900, 10500, 15, '192 pages','pcs','1484101418753-36742b4fab60', ['notebook','classmate','interleaved','organized'],   false, 4.4, 560),
  mk('stationery', 'Reynolds',      'Reynolds 045 Fine Carbure Pens',  'India\'s most-loved fine point pen — smooth, consistent flow with comfortable grip.',  5500,  6500, 15, 'Pack of 5','pcs','1455390582262-044cdead277a', ['pens','reynolds','ballpoint','smooth'],              true,  4.6, 1200),
  mk('stationery', 'Apsara',        'Apsara Platinum Extra Dark Pencils','Premium pencils with extra dark writing — great for sketching, drawing, and writing.',7500,  8800, 15, 'Box of 10','pcs','1455390582262-044cdead277a', ['pencils','apsara','platinum','extra dark'],          false, 4.5, 680),
  mk('stationery', 'Fevicol',       'Fevicol SH Synthetic Resin Adhesive','The original white glue — bonds paper, wood, fabric, and all craft projects.',      7900,  9500, 17, '100 g',   'g',  '1455390582262-044cdead277a', ['glue','fevicol','adhesive','bonding'],                false, 4.7, 980),
  mk('stationery', 'Faber-Castell', 'Faber-Castell Watercolour Pencils','Premium 12-colour watercolour pencils — vibrant, blendable, great for art projects.',24900, 28500, 13, '12 pcs',  'pcs','1455390582262-044cdead277a', ['watercolour pencils','faber-castell','art','kids'],  false, 4.5, 380),
  mk('stationery', 'Natraj',        'Natraj Sharpener & Eraser Set',   'Compact sharpener and eraser combo — essential for every student and artist.',          4900,  5800, 16, 'Pack of 5','pcs','1455390582262-044cdead277a', ['sharpener','eraser','natraj','stationery'],          false, 4.3, 420),
  mk('stationery', 'Camlin',        'Camlin Student Geometry Box',     'Complete geometry set with compass, protractor, set squares, and ruler.',              12900, 15000, 14, '1 set',   'pcs','1484101418753-36742b4fab60', ['geometry box','camlin','math','student'],            false, 4.4, 560),
  mk('stationery', 'Classmate',     'Classmate Spiral Notebook',       'Premium spiral notebook with micro-perforated pages — easy to tear out cleanly.',      12900, 15000, 14, '200 pages','pcs','1484101418753-36742b4fab60', ['spiral notebook','classmate','premium','organized'], false, 4.5, 420),
  mk('stationery', 'Reynolds',      'Reynolds Racer Gel Pen Set',      'Smooth gel pen with blue ink — consistent glide for comfortable writing sessions.',     4900,  5800, 16, 'Pack of 5','pcs','1455390582262-044cdead277a', ['gel pen','reynolds','smooth','blue'],                false, 4.5, 680),

  // ── PET CARE ────────────────────────────────────────────────
  mk('pet-care', 'Pedigree',     'Pedigree Adult Dry Dog Food',       'Complete nutrition for adult dogs — with real chicken, rice, and vegetables.',         39900, 45500, 12, '1.2 kg',  'kg', '1587300003388-59208cc962cb', ['dog food','pedigree','adult','dry food'],            true,  4.5, 780),
  mk('pet-care', 'Drools',       'Drools Chicken & Egg Dog Food',     'High-protein formula with chicken and egg — for healthy muscles and shiny coat.',       34900, 39500, 12, '1.2 kg',  'kg', '1587300003388-59208cc962cb', ['dog food','drools','chicken egg','protein'],         false, 4.4, 540),
  mk('pet-care', 'Whiskas',      'Whiskas Adult Cat Dry Food',        'Complete dry food for adult cats — ocean fish flavour with taurine for eye health.',    29500, 33500, 12, '480 g',   'g',  '1516750105099-4b8a83e217ee', ['cat food','whiskas','adult','ocean fish'],            true,  4.5, 460),
  mk('pet-care', 'Pedigree',     'Pedigree Dentastix Dental Treats',  'Daily dental treats for dogs — reduces tartar and plaque build-up while they chew.',   24900, 28500, 13, '200 g',   'g',  '1587300003388-59208cc962cb', ['dog treats','dental','pedigree','chew'],             false, 4.4, 320),
  mk('pet-care', 'Himalaya Pet', 'Himalaya Pet Dog Shampoo',          'Gentle shampoo for dogs with neem and turmeric — keeps coat clean and tick-free.',     23500, 27000, 13, '200 ml',  'ml', '1585751119414-ef2636f8aede', ['dog shampoo','himalaya','neem','turmeric'],          false, 4.3, 280),
  mk('pet-care', 'Royal Canin',  'Royal Canin Mini Adult Dog Food',   'Specially formulated kibble for small breed dogs — optimal stool odour reduction.',    129900,149900, 13, '2 kg',    'kg', '1587300003388-59208cc962cb', ['dog food','royal canin','small breed','premium'],    true,  4.6, 380),
  mk('pet-care', 'Whiskas',      'Whiskas Cat Treats Ocean Fish',     'Delicious bite-sized cat treats — irresistible ocean fish flavour, perfect for training.',15000, 17500, 14, '60 g',    'g',  '1516750105099-4b8a83e217ee', ['cat treats','whiskas','ocean fish','training'],      false, 4.4, 230),
  mk('pet-care', 'Drools',       'Drools Puppy Starter Dog Food',     'High DHA puppy formula — supports brain development and immune health for pups.',       44900, 51500, 13, '1.2 kg',  'kg', '1587300003388-59208cc962cb', ['puppy food','drools','starter','brain'],             false, 4.4, 290),

  // ── ELECTRONICS & ACCESSORIES ───────────────────────────────
  mk('electronics', 'Syska',       'Syska 9W LED Bulb Cool White',     'Energy-saving LED bulb — 900 lumens, 3 year warranty, and cool white light.',           7900,  9500, 17, '1 pcs',  'pcs','1550009158-9ebf69173e03',   ['led','syska','9w','cool white','energy saving'],     false, 4.3, 780),
  mk('electronics', 'Halonix',     'Halonix 10W LED Bulb (Pack of 2)', 'Value pack of 2 warm white LED bulbs — bright, durable, and energy efficient.',        14900, 17500, 15, 'Pack of 2','pcs','1550009158-9ebf69173e03',   ['led','halonix','10w','pack of 2','warm white'],      false, 4.3, 560),
  mk('electronics', 'Portronics',  'Portronics OTG USB Adapter',       'Compact OTG adapter — connect USB drives, keyboards, and devices to your phone.',       19900, 23000, 13, '1 pcs',  'pcs','1550009158-9ebf69173e03',   ['otg','usb','portronics','adapter','phone'],           false, 4.2, 340),
  mk('electronics', 'boAt',        'boAt BassHeads 100 Earphones',     'Dynamic sound quality wired earphones with tangle-free cable and HD mic.',             39900, 45500, 12, '1 pcs',  'pcs','1484704849700-f032ad7dac8b', ['earphones','boat','wired','bassheads','mic'],         true,  4.4, 1200),
  mk('electronics', 'Ambrane',     'Ambrane 10000mAh Power Bank',      'Slim, high-capacity power bank with dual USB ports — fast charging support.',          79900, 89900, 11, '1 pcs',  'pcs','1550009158-9ebf69173e03',   ['power bank','ambrane','10000mah','fast charge'],     false, 4.2, 560),
  mk('electronics', 'Energizer',   'Energizer AA Batteries (4 pcs)',   'Long-lasting AA batteries — for remotes, clocks, toys, and everyday devices.',         19900, 23000, 13, '4 pcs',  'pcs','1550009158-9ebf69173e03',   ['batteries','energizer','aa','long lasting'],         false, 4.4, 780),
  mk('electronics', 'Duracell',    'Duracell Coppertop AA Batteries',  'Duracell\'s longest-lasting AA battery — reliable power for all your devices.',        24900, 28500, 13, '4 pcs',  'pcs','1550009158-9ebf69173e03',   ['batteries','duracell','coppertop','aa'],             false, 4.5, 890),
  mk('electronics', 'Syska',       'Syska Smart Power Strip 4+1',      'Surge-protected power strip with 4 universal sockets and 1 USB port.',                 79900, 89900, 11, '1 pcs',  'pcs','1550009158-9ebf69173e03',   ['power strip','syska','surge protect','usb'],         false, 4.3, 420),

  // ── POOJA & FESTIVE ─────────────────────────────────────────
  mk('pooja-festive', 'HEM',       'HEM 7 Chakra Incense Sticks',      'Premium incense sticks blended for meditation and spiritual balance — divine fragrance.',12000, 14000, 14, '35 g',   'g',  '1579546929518-9e396f3cc809', ['incense','agarbatti','hem','chakra','meditation'],   false, 4.5, 560),
  mk('pooja-festive', 'Cycle',     'Cycle Brand Agarbatti Premium',    'India\'s most trusted incense brand — pure, long-lasting fragrance for daily pooja.',   9900, 11500, 14, '100 g',  'g',  '1579546929518-9e396f3cc809', ['agarbatti','cycle brand','incense','daily pooja'],   true,  4.6, 980),
  mk('pooja-festive', 'Patanjali', 'Patanjali Divya Dant Kanti',       'Patanjali\'s natural toothpaste with neem, clove, and herbs — Ayurvedic care.',        4500,  5500, 18, '100 g',  'g',  '1607613009820-a29f7bb81c04', ['toothpaste','patanjali','ayurvedic','neem'],          false, 4.3, 780),
  mk('pooja-festive', 'Patanjali', 'Patanjali Cow Ghee',               'Pure Patanjali cow ghee — ideal for havan, pooja, and everyday Ayurvedic cooking.',   14900, 16900, 12, '500 ml', 'ml', '1597733336794-12d05021d510', ['ghee','patanjali','cow ghee','havan','pure'],         false, 4.4, 420),
  mk('pooja-festive', 'HEM',       'HEM White Sage Incense Sticks',    'Cleansing white sage incense — purifies spaces and creates a calm environment.',       11000, 13000, 15, '35 g',   'g',  '1579546929518-9e396f3cc809', ['white sage','incense','cleansing','hem'],             false, 4.4, 320),
  mk('pooja-festive', 'Cycle',     'Cycle Dhoop Cones',                'Premium cone-shaped dhoop — deep, lasting fragrance for prayers and meditation.',       4900,  5800, 16, '40 pcs', 'pcs','1579546929518-9e396f3cc809', ['dhoop','cones','pooja','cycle'],                     false, 4.4, 380),
  mk('pooja-festive', "Haldiram's",'Haldirams Motichoor Ladoo',        'Mouth-melting motichoor laddoo — traditionally crafted, festive sweetness in every bite.',14900, 17500, 15, '500 g', 'g',  '1481391319762-47dff72954d9', ['ladoo','motichoor','haldirams','festive','sweet'],   true,  4.6, 560),
  mk('pooja-festive', "Haldiram's",'Haldirams Kaju Katli',             'Premium cashew katli — a classic Indian festive sweet crafted with whole cashews.',    22500, 25900, 13, '250 g',  'g',  '1481391319762-47dff72954d9', ['kaju katli','cashew','haldirams','festive'],          true,  4.7, 480),

  // ── ADULT WELLNESS ──────────────────────────────────────────
  mk('adult-personal-wellness', 'Durex',     'Durex Feel Thin Condoms',         'Ultra-thin condoms for natural feel — trusted quality for comfort and protection.',  16900, 19900, 15, '3 pcs',  'pcs','1584308666744-24d5c474f2ae', ['condoms','durex','ultra thin','protection'],          false, 4.4, 680),
  mk('adult-personal-wellness', 'Durex',     'Durex Real Feel Condoms',         'Premium non-latex condoms for natural skin-to-skin sensation — latex-free option.',  46900, 54900, 15, '10 pcs', 'pcs','1584308666744-24d5c474f2ae', ['condoms','durex','real feel','non-latex'],            true,  4.4, 520),
  mk('adult-personal-wellness', 'Skore',     'Skore Not Out Ribbed Condoms',    'Ribbed condoms for enhanced experience — reliable protection with added texture.',   34900, 39900, 13, '10 pcs', 'pcs','1584308666744-24d5c474f2ae', ['condoms','skore','ribbed','protection'],             false, 4.3, 380),
  mk('adult-personal-wellness', 'Prega News','Prega News Pregnancy Test Kit',   'Accurate pregnancy test with 99% accuracy — results in 5 minutes, easy to use.',    7900,  9500, 17, '1 test',  'pcs','1584308666744-24d5c474f2ae', ['pregnancy test','prega news','accurate','home test'], true,  4.5, 1200),
  mk('adult-personal-wellness', 'Prega News','Prega News Advanced (3 Pack)',    'Value pack of 3 advanced pregnancy tests — for early detection from Day 1.',        14900, 17500, 15, '3 tests', 'pcs','1584308666744-24d5c474f2ae', ['pregnancy test','prega news','3 pack','early'],     false, 4.5, 680),
  mk('adult-personal-wellness', 'Everteen',  'Everteen Natural Intimate Wash',  'pH-balanced intimate wash with natural ingredients — gentle for daily feminine care.', 18500, 21500, 14, '105 ml',  'ml', '1598440947619-2c35fc9aa908', ['intimate wash','everteen','pH balanced','feminine'],  false, 4.4, 560),
  mk('adult-personal-wellness', 'VWash',     'VWash Plus Expert Intimate Hygiene','Dermatologist-recommended intimate hygiene solution — maintains optimal pH balance.',19500, 22500, 13, '100 ml',  'ml', '1598440947619-2c35fc9aa908', ['intimate hygiene','vwash','pH balance','dermatologist'],true,4.4, 480),
  mk('adult-personal-wellness', 'Himalaya',  'Himalaya Intimate Wash',          'Gentle, soothing intimate wash from Himalaya with natural ingredients.',              17900, 20500, 13, '200 ml',  'ml', '1598440947619-2c35fc9aa908', ['intimate wash','himalaya','gentle','natural'],       false, 4.4, 380),
  mk('adult-personal-wellness', 'Whisper',   'Whisper Ultra Soft Pads (XL)',    'Super soft sanitary pads with XL wings — all-day comfort and leak protection.',     24900, 28500, 13, '15 pcs',  'pcs','1584308666744-24d5c474f2ae', ['sanitary pads','whisper','ultra soft','xl','wings'], true,  4.6, 1450),
  mk('adult-personal-wellness', 'Stayfree',  'Stayfree Secure Dry Cover Pads',  'Dry cover pads for 12-hour protection — keeps you dry and comfortable all day.',    24900, 28500, 13, '30 pcs',  'pcs','1584308666744-24d5c474f2ae', ['sanitary pads','stayfree','dry cover','protection'],  false, 4.5, 1100),

  // ── OTHER ESSENTIALS ────────────────────────────────────────
  mk('other-essentials', 'Dettol',  'Dettol Handwash Liquid Refill',   'Antibacterial handwash refill pack — kills 99.9% germs for clean, protected hands.',    9500, 10800, 12, '200 ml', 'ml', '1607613009820-a29f7bb81c04', ['handwash','dettol','antibacterial','germ kill'],     true,  4.6, 1100),
  mk('other-essentials', 'Savlon',  'Savlon Advanced Hand Sanitizer',  'Alcohol-based hand sanitizer — kills 99.99% germs without water. WHO-recommended.',      7900,  9500, 17, '200 ml', 'ml', '1607613009820-a29f7bb81c04', ['sanitizer','savlon','alcohol','germ kill'],           false, 4.4, 780),
  mk('other-essentials', 'Vicks',   'Vicks VapoRub Ointment',          'The trusted ointment for cold, cough, and blocked nose — fast relief with menthol.',      7900,  9200, 14, '25 ml',  'ml', '1607613009820-a29f7bb81c04', ['vicks','vaporub','cold','cough','relief'],            false, 4.6, 1600),
  mk('other-essentials', 'Dettol',  'Dettol Antiseptic Liquid',        'Multi-purpose antiseptic — for cuts, wounds, bathing, and household disinfection.',      17500, 20000, 13, '100 ml', 'ml', '1607613009820-a29f7bb81c04', ['antiseptic','dettol','first aid','wounds'],           false, 4.7, 1200),
  mk('other-essentials', 'Vicks',   'Vicks Action 500 Tablets',        'Effective relief from cold, fever, and headache — fast-acting formula.',                  7500,  9000, 17, '20 tabs','pcs','1607613009820-a29f7bb81c04', ['cold','fever','vicks','action 500','tablet'],        false, 4.4, 560),
  mk('other-essentials', 'Savlon',  'Savlon Wound Antiseptic Cream',   'Effective antiseptic cream for minor cuts, wounds, and burns — trusted first aid.',      8900, 10500, 15, '30 g',   'g',  '1607613009820-a29f7bb81c04', ['antiseptic cream','savlon','first aid','wound'],      false, 4.5, 450),
  mk('other-essentials', 'Moov',    'Moov Strong Rapid Action Pain Gel','Fast-acting diclofenac pain relief gel — targets muscle and joint pain directly.',      12900, 14900, 13, '30 g',   'g',  '1607613009820-a29f7bb81c04', ['pain relief','moov','muscle','joint','gel'],          false, 4.4, 680),
  mk('other-essentials', 'Eno',     'Eno Fruit Salt Regular',          'Fast-acting antacid for acidity and heartburn relief — quick, refreshing fizz.',         14900, 17000, 12, '30 sachets','pcs','1607613009820-a29f7bb81c04',['antacid','eno','acidity','heartburn','relief'],     false, 4.5, 890),
];

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding Phase 5 — QuickKart Comprehensive Catalog\n');
  console.log(`   Brands:     ${BRANDS.length}`);
  console.log(`   Categories: ${CATEGORIES.length}`);
  console.log(`   Products:   ${PRODUCTS.length}\n`);

  // ── 1. Upsert Brands ───────────────────────────────────────
  console.log('📦 Upserting brands...');
  const brandMap = {}; // name → id
  for (const brand of BRANDS) {
    const upserted = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name, isActive: true },
      create: { name: brand.name, slug: brand.slug, isActive: true },
      select: { id: true, name: true },
    });
    brandMap[brand.name] = upserted.id;
  }
  console.log(`   ✅ ${Object.keys(brandMap).length} brands ready\n`);

  // ── 2. Upsert Categories ───────────────────────────────────
  console.log('📁 Upserting categories...');
  const categoryMap = {}; // slug → id
  for (const cat of CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.desc,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.desc,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      select: { id: true, slug: true, name: true },
    });
    categoryMap[cat.slug] = upserted.id;
    console.log(`   ✅ ${upserted.name}`);
  }
  console.log('');

  // ── 3. Upsert Products ─────────────────────────────────────
  console.log('🛒 Upserting products...');
  let seeded = 0;
  let skipped = 0;

  for (const prod of PRODUCTS) {
    const categoryId = categoryMap[prod.catSlug];
    if (!categoryId) {
      console.warn(`   ⚠️  Category not found: ${prod.catSlug} — skipping: ${prod.name}`);
      skipped++;
      continue;
    }

    const brandId = prod.brandName ? brandMap[prod.brandName] : undefined;
    if (prod.brandName && !brandId) {
      console.warn(`   ⚠️  Brand not found: "${prod.brandName}" — product: ${prod.name}`);
    }

    const productSlug = slug(prod.name);

    // Resolve unique slug (handle collisions by checking existing record)
    let finalSlug = productSlug;
    let suffix = 0;
    while (true) {
      const existing = await prisma.product.findUnique({ where: { slug: finalSlug }, select: { id: true, categoryId: true, name: true } });
      if (!existing) break;
      // Same product (same category + name) → update it
      if (existing.categoryId === categoryId && existing.name === prod.name) break;
      suffix++;
      finalSlug = `${productSlug}-${suffix}`;
    }

    await prisma.product.upsert({
      where: { slug: finalSlug },
      update: {
        name:          prod.name,
        description:   prod.description,
        categoryId,
        brandId:       brandId ?? undefined,
        price:         prod.price,
        originalPrice: prod.originalPrice ?? null,
        discountPct:   prod.discountPct ?? 0,
        weight:        prod.weight ?? null,
        unit:          prod.unit ?? null,
        images:        prod.images ?? [],
        tags:          prod.tags ?? [],
        isActive:      prod.isActive ?? true,
        isFeatured:    prod.isFeatured ?? false,
        avgRating:     prod.avgRating ?? 0,
        reviewCount:   prod.reviewCount ?? 0,
      },
      create: {
        name:          prod.name,
        slug:          finalSlug,
        description:   prod.description,
        categoryId,
        brandId:       brandId ?? undefined,
        price:         prod.price,
        originalPrice: prod.originalPrice ?? null,
        discountPct:   prod.discountPct ?? 0,
        weight:        prod.weight ?? null,
        unit:          prod.unit ?? null,
        images:        prod.images ?? [],
        tags:          prod.tags ?? [],
        isActive:      prod.isActive ?? true,
        isFeatured:    prod.isFeatured ?? false,
        avgRating:     prod.avgRating ?? 0,
        reviewCount:   prod.reviewCount ?? 0,
      },
    });
    seeded++;
  }

  // ── 4. Summary ─────────────────────────────────────────────
  const finalBrandCount    = await prisma.brand.count();
  const finalCategoryCount = await prisma.category.count();
  const finalProductCount  = await prisma.product.count();

  console.log(`\n✅ Seed complete!`);
  console.log(`   Brands in DB:     ${finalBrandCount}`);
  console.log(`   Categories in DB: ${finalCategoryCount}`);
  console.log(`   Products in DB:   ${finalProductCount}`);
  if (skipped > 0) console.log(`   Skipped:          ${skipped} (missing category)`);
  console.log(`\n   Seeded/updated:   ${seeded} products this run`);

  process.exit(0);
}

main().catch(e => {
  console.error('\n❌ Seed failed:', e.message ?? e);
  process.exit(1);
});
