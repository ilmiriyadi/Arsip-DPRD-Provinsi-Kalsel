import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'ilmiriyadi@gmail.com' }
    })

    if (existingUser) {
      console.log('❌ User dengan email ilmiriyadi@gmail.com sudah ada!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('12345678', 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'ilmii',
        email: 'ilmiriyadi@gmail.com',
        password: hashedPassword,
        role: 'ADMIN',
      }
    })

    console.log('✅ Berhasil membuat akun admin!')
    console.log('📧 Email:', adminUser.email)
    console.log('👤 Nama:', adminUser.name)
    console.log('🔑 Role:', adminUser.role)
    console.log('🆔 ID:', adminUser.id)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()