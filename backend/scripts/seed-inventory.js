require('dotenv').config();
const prisma = require('../src/config/database');

async function main() {
  console.log('Fetching stores and products...');
  
  const stores = await prisma.store.findMany({ select: { id: true, name: true } });
  const products = await prisma.product.findMany({ select: { id: true, name: true } });
  
  if (stores.length === 0) {
    console.log('No stores found. Exiting.');
    return;
  }
  if (products.length === 0) {
    console.log('No products found. Exiting.');
    return;
  }
  
  console.log(`Found ${stores.length} stores and ${products.length} products.`);
  
  let createdCount = 0;
  
  // Random quantity generation function
  function getRandomStock() {
    const r = Math.random();
    if (r < 0.1) return 0; // 10% out of stock
    if (r < 0.3) return Math.floor(Math.random() * 5) + 1; // 20% low stock (1-5)
    return Math.floor(Math.random() * 91) + 10; // 70% normal stock (10-100)
  }

  for (const store of stores) {
    console.log(`Seeding inventory for store: ${store.name}`);
    
    for (const product of products) {
      const quantity = getRandomStock();
      
      const inventory = await prisma.inventory.upsert({
        where: {
          storeId_productId: {
            storeId: store.id,
            productId: product.id,
          }
        },
        update: {}, // Don't overwrite if it already exists
        create: {
          storeId: store.id,
          productId: product.id,
          quantityOnHand: quantity,
          quantityReserved: 0,
          lowStockThreshold: 5,
        }
      });
      
      // Check if we just created it (this is a bit hacky but works for the seed script)
      // Upsert update={} actually doesn't change anything, so if updatedAt ~= createdAt it's new
      if (Math.abs(inventory.createdAt.getTime() - inventory.updatedAt.getTime()) < 1000) {
        createdCount++;
        
        // Create an initial stock transaction
        await prisma.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: 'STOCK_IN',
            quantityDelta: quantity,
            reason: 'Initial seed',
          }
        });
      }
    }
  }
  
  console.log(`\nSuccessfully created ${createdCount} new inventory records.`);
  console.log('Inventory seeding complete.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
