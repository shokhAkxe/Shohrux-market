const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding default admin user...');

  // Check if admin already exists by login
  const existingAdmin = await prisma.user.findUnique({
    where: { login: 'admin' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists, updating credentials...');
    
    // Update the existing admin with new credentials
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const updatedAdmin = await prisma.user.update({
      where: { login: 'admin' },
      data: {
        full_name: 'Shohrux Sotimboyev',
        email: 'admin@shohrux-market.uz',
        login: 'admin',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        phone: '+998901234567'
      }
    });

    console.log('✅ Admin credentials updated successfully:');
    console.log('   Login: admin');
    console.log('   Password: admin123');
    console.log('   Name: Shohrux Sotimboyev');
    console.log('   Role: SUPER_ADMIN');
    return;
  }

  // Create default admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      full_name: 'Shohrux Sotimboyev',
      email: 'admin@shohrux-market.uz',
      login: 'admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      phone: '+998901234567'
    }
  });

  console.log('✅ Default admin created successfully:');
  console.log('   Login: admin');
  console.log('   Password: admin123');
  console.log('   Name: Shohrux Sotimboyev');
  console.log('   Role: SUPER_ADMIN');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
