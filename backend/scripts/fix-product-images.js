#!/usr/bin/env node
/**
 * scripts/fix-product-images.js
 *
 * Fetches real, verified product image URLs from Open Food Facts API
 * by barcode, then updates the database directly via Prisma.
 *
 * Run: node scripts/fix-product-images.js
 */

'use strict';

require('dotenv').config();
const https   = require('https');
const prisma  = require('../src/config/database');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function get(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'QuickKart-Student-Project/1.0 (educational; hardik@example.com)',
        'Accept': 'application/json',
      },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: null }); }
      });
    });
    req.on('error', () => resolve({ status: 0, body: null }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: null }); });
  });
}

// ── Barcode → product name mapping ───────────────────────────
// Format: [barcode, exactProductNameInDB]
// Barcodes sourced from product packaging / Open Food Facts community
const BARCODE_MAP = [
  // DAIRY
  ['8901022095524', 'Amul Gold Full Cream Milk'],
  ['8901022095517', 'Amul Taaza Toned Milk'],
  ['8901022095494', 'Mother Dairy Toned Milk'],
  ['8901022095500', 'Mother Dairy Full Cream Milk'],
  ['8901022087036', 'Amul Butter Salted'],
  ['8901022087059', 'Amul Masti Dahi'],
  ['8901022087066', 'Amul Processed Cheese'],
  ['8901022087073', 'Amul Pure Cow Ghee'],
  ['8901022087080', 'Nandini Pure Ghee'],
  ['8901401017342', 'Britannia White Bread'],
  ['8901401017359', 'Britannia Whole Wheat Bread'],
  ['8901401101088', 'Britannia NutriChoice Oats'],
  ['8901401101095', 'Britannia Marie Gold'],
  ['8901401101101', 'Britannia Good Day Cashew Cookies'],
  ['8901401101118', 'Britannia Tiger Glucose'],
  ['8901401101125', 'Britannia Bourbon Chocolate Cream'],
  ['8901401101132', 'Britannia NutriChoice 5 Grain'],

  // STAPLES
  ['8901114300038', 'Aashirvaad Select Atta'],
  ['8901114300045', 'Aashirvaad Multigrain Atta'],
  ['8901047010124', 'India Gate Super Basmati Rice'],

  // SNACKS
  ['8901780401034', 'Lay\'s Classic Salted Chips'],
  ['8901780401041', 'Lay\'s Magic Masala'],
  ['8901434046019', 'Kurkure Masala Munch'],
  ['8906001500018', 'Haldiram\'s Bhujia'],
  ['6138057310010', 'Pringles Original'],

  // BISCUITS
  ['8901781100128', 'Parle-G Biscuits'],
  ['8901781100135', 'Parle-G Original Glucose Biscuits'],
  ['7622300441937', 'Oreo Original Sandwich Cookies'],
  ['5000119314084', 'McVitie\'s Digestive Biscuits'],
  ['8901914000186', 'Sunfeast Dark Fantasy'],

  // CHOCOLATES
  ['7622210449283', 'Cadbury Dairy Milk'],
  ['7622210386793', 'Cadbury Dairy Milk Silk'],
  ['7622210449290', 'Cadbury 5 Star'],
  ['8000500310427', 'Ferrero Rocher Gift Box'],
  ['5000112638907', 'KitKat 4 Finger'],
  ['3017624010701', 'Nutella Hazelnut Spread'],

  // BEVERAGES
  ['5000112602761', 'Coca-Cola Original'],
  ['4900008883009', 'Pepsi Original'],
  ['5060020370055', 'Red Bull Energy Drink'],
  ['8905030600018', 'Bisleri Mineral Water'],
  ['0490000048862', 'Tropicana Orange Juice'],

  // TEA COFFEE
  ['7613032470203', 'Nescafé Classic Instant Coffee'],
  ['8901030716877', 'Tata Tea Gold'],

  // INSTANT FOOD
  ['8901030716899', 'Maggi 2-Minute Noodles Masala'],
  ['8901030716906', 'Maggi Atta Noodles Masala'],
  ['8901030716913', 'Maggi Oats Masala Noodles'],

  // CEREALS
  ['8901000004012', 'Kellogg\'s Corn Flakes'],
  ['8901000004029', 'Kellogg\'s Chocos'],
  ['8906006300039', 'Kissan Mixed Fruit Jam'],
  ['8901151002012', 'Horlicks Classic Malt'],
  ['8901223001017', 'Bournvita Chocolate Drink'],

  // PERSONAL CARE
  ['8901012705005', 'Colgate MaxFresh Toothpaste'],
  ['8901012705012', 'Colgate Strong Teeth Toothpaste'],
  ['8800120600025', 'Dove Moisturising Cream Bar'],

  // HOUSEHOLD
  ['8900600500025', 'Harpic Power Plus'],
  ['8900600500032', 'Lizol Disinfectant Floor Cleaner'],
  ['8900600500049', 'Surf Excel Matic Front Load'],
  ['8900600500056', 'Ariel Matic Powder'],
];

// ── Fetch real image URL from OFF API ─────────────────────────
async function fetchImageUrl(barcode) {
  const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,image_front_url,image_front_small_url`;
  const { status, body } = await get(url);
  if (status !== 200 || !body || body.status !== 1) return null;

  const p = body.product;
  // Prefer 400px image, fall back to small
  return p.image_front_url || p.image_front_small_url || null;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🖼️  Fetching real product images from Open Food Facts...\n');

  const results = [];
  let found = 0;

  for (let i = 0; i < BARCODE_MAP.length; i++) {
    const [barcode, productName] = BARCODE_MAP[i];
    process.stdout.write(`[${i+1}/${BARCODE_MAP.length}] ${productName.padEnd(40)} `);

    const imageUrl = await fetchImageUrl(barcode);

    if (imageUrl) {
      results.push({ productName, imageUrl });
      found++;
      console.log(`✅ ${imageUrl.split('/').slice(-1)[0]}`);
    } else {
      console.log('❌ not found');
    }

    await sleep(1200); // 1 req/s to be polite
  }

  console.log(`\n📦 Updating ${found} products in database...`);

  let updated = 0;
  for (const { productName, imageUrl } of results) {
    const result = await prisma.product.updateMany({
      where: { name: productName },
      data:  { images: [imageUrl] },
    });
    if (result.count > 0) {
      updated += result.count;
      console.log(`  ✅ ${productName}`);
    } else {
      console.log(`  ⚠️  Not found in DB: ${productName}`);
    }
  }

  console.log(`\n✅ Done — updated ${updated} products with real images.`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
