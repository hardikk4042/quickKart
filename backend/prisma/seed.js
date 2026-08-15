const prisma = require('../src/config/database');
const bcrypt = require('bcryptjs');

const BCRYPT_SALT_ROUNDS = 12;

async function main() {
  console.log('Starting seed...');

  const accounts = [
    { email: 'hardik@quickkart.com',   name: 'Hardik',          password: 'password123', role: 'CUSTOMER' },
    { email: 'admin@quickkart.com',    name: 'Admin User',      password: 'admin123',    role: 'ADMIN' },
    { email: 'store@quickkart.com',    name: 'Store Manager',   password: 'store123',    role: 'STORE_MANAGER' },
    { email: 'delivery@quickkart.com', name: 'Delivery Partner',password: 'delivery123', role: 'DELIVERY_PARTNER' },
  ];

  for (const acc of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: acc.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(acc.password, BCRYPT_SALT_ROUNDS);
      await prisma.user.create({
        data: {
          email: acc.email,
          name: acc.name,
          passwordHash,
          role: acc.role,
        },
      });
      console.log(`Created ${acc.role} user: ${acc.email}`);
    } else {
      console.log(`${acc.email} already exists.`);
    }
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
