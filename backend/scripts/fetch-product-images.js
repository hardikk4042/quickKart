#!/usr/bin/env node
/**
 * scripts/fetch-product-images.js
 * Searches Open Food Facts for each product and collects real image URLs.
 * Outputs: scripts/product-images.json
 */

'use strict';

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Rate-limited HTTP GET (returns parsed JSON or null) ────────
function get(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'QuickKart-SeedHelper/1.0 (student-project)' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Search OFF by product name ─────────────────────────────────
async function searchOFF(query) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,brands,image_front_url`;
  const data = await get(url);
  if (!data || !data.products || !data.products.length) return null;

  // Prefer entries that have an image
  const withImg = data.products.find(p => p.image_front_url && p.image_front_url.includes('https://images.openfoodfacts.org'));
  return withImg?.image_front_url || null;
}

// ── Product list: [name, brand, OFF search query] ─────────────
const PRODUCTS = [
  // DAIRY
  ['Amul Gold Full Cream Milk',        'Amul',         'amul gold full cream milk'],
  ['Mother Dairy Toned Milk',          'Mother Dairy', 'mother dairy toned milk'],
  ['Amul Butter Salted',               'Amul',         'amul butter salted 500g'],
  ['Farm Fresh Eggs',                  'Local Farm',   'fresh eggs 6'],
  ['Mother Dairy Fresh Curd',          'Mother Dairy', 'mother dairy fresh curd dahi'],
  ['Amul Masti Dahi',                  'Amul',         'amul masti dahi curd'],
  ['Milky Mist Paneer',                'Milky Mist',   'paneer cottage cheese fresh'],
  ['Amul Processed Cheese',            'Amul',         'amul processed cheese slices'],
  ['Nandini Pure Ghee',                'Nandini',      'cow ghee pure desi'],
  ['Britannia White Bread',            'Britannia',    'britannia white bread'],
  ['Britannia NutriChoice Oats',       'Britannia',    'oats rolled 400g'],
  ['Amul Kool Chocolate Milk',         'Amul',         'amul kool chocolate milk'],
  // ATTA RICE DALS
  ['Aashirvaad Select Atta',           'Aashirvaad',   'aashirvaad atta wheat flour'],
  ['India Gate Super Basmati Rice',    'India Gate',   'india gate basmati rice'],
  ['Tata Sampann Toor Dal',            'Tata Sampann', 'toor dal arhar split'],
  ['Tata Sampann Moong Dal',           'Tata Sampann', 'moong dal split yellow'],
  ['Tata Sampann Rajma',               'Tata Sampann', 'rajma kidney beans'],
  ['Tata Sampann Chana Dal',           'Tata Sampann', 'chana dal bengal gram'],
  // OILS GHEE MASALA
  ['Fortune Sunflower Oil',            'Fortune',      'fortune sunflower oil cooking'],
  ['Saffola Total Oil',                'Saffola',      'saffola oil blended heart'],
  ['Amul Pure Ghee',                   'Amul',         'amul pure desi ghee'],
  ['MDH Garam Masala',                 'MDH',          'mdh garam masala spice'],
  ['Everest Kitchen King Masala',      'Everest',      'everest kitchen king masala'],
  ['Catch Iodised Salt',               'Catch',        'salt iodised table'],
  ['Tata Salt',                        'Tata',         'tata salt iodised'],
  // SNACKS
  ["Lay's Classic Salted Chips",       "Lay's",        'lays classic salted potato chips'],
  ['Kurkure Masala Munch',             'Kurkure',      'kurkure masala munch puffed corn'],
  ["Haldiram's Bhujia",                "Haldiram's",   'haldirams bhujia namkeen sev'],
  ['Bingo Mad Angles',                 'Bingo',        'bingo mad angles chips'],
  ['Pringles Original',                'Pringles',     'pringles original potato crisps'],
  // BISCUITS
  ['Parle-G Glucose Biscuits',         'Parle',        'parle g glucose biscuits'],
  ['Britannia Marie Gold',             'Britannia',    'britannia marie gold biscuit'],
  ['Sunfeast Dark Fantasy',            'Sunfeast',     'sunfeast dark fantasy choco fills'],
  ["McVitie's Digestive Biscuits",     "McVitie's",    'mcvities digestive wheat biscuit'],
  ['Oreo Original Sandwich Cookies',   'Oreo',         'oreo sandwich cookie chocolate'],
  // CHOCOLATES
  ['Cadbury Dairy Milk',               'Cadbury',      'cadbury dairy milk chocolate bar'],
  ['KitKat 4 Finger',                  'Nestlé',       'kitkat 4 finger chocolate wafer'],
  ['Amul Dark Chocolate',              'Amul',         'amul dark chocolate 55%'],
  ['Ferrero Rocher',                   'Ferrero',      'ferrero rocher praline chocolate'],
  ['5 Star Chocolate',                 'Cadbury',      'cadbury 5 star chocolate caramel'],
  // BREAKFAST SAUCES
  ["Kellogg's Corn Flakes",            "Kellogg's",    'kelloggs corn flakes breakfast cereal'],
  ['Quaker Oats Instant',              'Quaker',       'quaker oats instant quick'],
  ['Kissan Mixed Fruit Jam',           'Kissan',       'kissan mixed fruit jam'],
  ['Horlicks Classic Malt Drink',      'Horlicks',     'horlicks malt beverage 500g'],
  // INSTANT FOOD
  ['Maggi 2-Minute Masala Noodles',    'Maggi',        'maggi 2 minute masala noodles'],
  ['MTR Poha Ready to Cook',           'MTR',          'mtr poha ready to cook'],
  ['Knorr Tomato Soup',                'Knorr',        'knorr tomato soup instant'],
  // BEVERAGES
  ['Coca-Cola 1.25L',                  'Coca-Cola',    'coca cola cold drink pet bottle'],
  ['Tropicana Orange Juice',           'Tropicana',    'tropicana orange juice 1l'],
  ['Bisleri Mineral Water 1L',         'Bisleri',      'bisleri mineral water bottle'],
  ['Red Bull Energy Drink',            'Red Bull',     'red bull energy drink 250ml can'],
  ['Maaza Mango Drink',                'Maaza',        'maaza mango drink pet bottle'],
  // TEA COFFEE
  ['Tata Tea Gold',                    'Red Label',    'tata tea gold premium blend'],
  ['Red Label Tea',                    'Red Label',    'red label natural care tea'],
  ['Nescafé Classic Instant Coffee',   'Nescafé',      'nescafe classic instant coffee'],
  ['Bru Instant Coffee',               'BRU',          'bru instant coffee chicory'],
  // PERSONAL CARE
  ['Dove Moisturising Cream Bar',      'Dove',         'dove moisturising cream soap bar'],
  ['Head & Shoulders Anti Dandruff',   'Head & Shoulders', 'head shoulders anti dandruff shampoo'],
  ['Colgate MaxFresh Toothpaste',      'Colgate',      'colgate maxfresh toothpaste mint'],
  ['Gillette Guard Razor',             'Gillette',     'gillette guard manual shaving razor'],
  ['Whisper Ultra Soft Pads',          'Whisper',      'whisper ultra soft sanitary pads'],
  // BABY CARE
  ['Pampers New Born Diapers',         'Pampers',      'pampers new born baby diapers'],
  ['Himalaya Baby Lotion',             'Himalaya',     'himalaya baby lotion moisturising'],
  ['Johnson Baby Powder',              'Johnson',      'johnson baby powder soft'],
  // HOUSEHOLD
  ['Surf Excel Matic Front Load',      'Surf Excel',   'surf excel matic front load detergent'],
  ['Ariel Matic Powder',               'Ariel',        'ariel matic front load powder'],
  ['Harpic Power Plus',                'Harpic',       'harpic power plus toilet cleaner'],
  ['Lizol Disinfectant Floor Cleaner', 'Lizol',        'lizol disinfectant floor cleaner original'],
  ['Vim Dishwash Bar',                 'Vim',          'vim dishwash bar lemon'],
  // PET CARE
  ['Pedigree Adult Dry Dog Food',      'Pedigree',     'pedigree adult dry dog food chicken'],
  ['Whiskas Adult Cat Food',           'Whiskas',      'whiskas adult cat food fish'],
  // MEAT SEAFOOD
  ['Fresh Chicken Breast',             'Suguna',       'chicken breast fresh boneless'],
  ['Frozen Whole Chicken',             'Venky',        'frozen whole chicken cleaned'],
];

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const out = {};
  const total = PRODUCTS.length;
  let found = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const [name, , query] = PRODUCTS[i];
    process.stdout.write(`[${i + 1}/${total}] Searching: ${name} ... `);

    const url = await searchOFF(query);
    if (url) {
      out[name] = url;
      found++;
      console.log('✅');
    } else {
      out[name] = null;
      console.log('❌ not found');
    }

    // Be polite to OFF API (max ~1 req/s)
    await sleep(1100);
  }

  const outPath = path.join(__dirname, 'product-images.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');

  console.log(`\nDone — found images for ${found}/${total} products`);
  console.log(`Saved to: ${outPath}`);
}

main().catch(console.error);
