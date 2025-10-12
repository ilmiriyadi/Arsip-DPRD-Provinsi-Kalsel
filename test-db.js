const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check users count
    const userCount = await prisma.user.count();
    console.log(`📊 Total users: ${userCount}`);
    
    if (userCount === 0) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await prisma.user.create({
        data: {
          email: 'admin@dprd.go.id',
          name: 'Administrator',
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log('✅ Admin user created:', admin.email);
    }
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();