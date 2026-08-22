#!/usr/bin/env node
require('dotenv').config({ path: '/Users/hardik/Desktop/QuickKart/backend/.env' });
const { image_search } = require('duckduckgo-images-api');
const prisma = require('/Users/hardik/Desktop/QuickKart/backend/src/config/database.js');
const fs = require('fs');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log('Fetching products from database...');
  const products = await prisma.product.findMany({
    select: { id: true, name: true, images: true }
  });
  
  console.log(`Found ${products.length} products. Fetching real images...`);
  
  let updatedCount = 0;
  const newRealImages = {};
  
  // Sort products by popularity or just do top 50 first
  // We'll just do all of them but fast
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    
    // Skip if already has a working openfoodfacts/wikimedia image
    const currentImg = p.images && p.images[0] ? p.images[0] : '';
    if (currentImg.includes('openfoodfacts.org') && !currentImg.includes('.4.') || currentImg.includes('wikimedia')) {
        newRealImages[p.name] = currentImg;
        continue;
    }

    process.stdout.write(`[${i+1}/${products.length}] ${p.name.padEnd(40)} `);
    
    try {
      const results = await image_search({ query: p.name + ' bigbasket', moderate: true, iterations: 1 });
      if (results && results.length > 0) {
        // Find first image that isn't wikipedia icon or fake
        let img = results.find(r => r.image && !r.image.includes('wikipedia') && !r.image.includes('logo'))?.image;
        if (!img) img = results[0].image;
        
        await prisma.product.update({
          where: { id: p.id },
          data: { images: [img] }
        });
        newRealImages[p.name] = img;
        console.log(`✅ ${img.substring(0, 60)}...`);
        updatedCount++;
      } else {
        console.log('❌ Not found');
      }
    } catch (e) {
      console.log(`❌ Error: ${e.message}`);
    }
    
    await sleep(200); // Wait slightly
  }
  
  console.log(`\nUpdated ${updatedCount} products with real images via DuckDuckGo!`);
  
  fs.writeFileSync('/tmp/imgsearch/real_images.json', JSON.stringify(newRealImages, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
