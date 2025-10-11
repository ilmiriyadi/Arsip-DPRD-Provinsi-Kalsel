import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    console.log('\n📋 Daftar User yang Terdaftar:')
    console.log('=' .repeat(50))
    
    if (users.length === 0) {
      console.log('❌ Tidak ada user yang terdaftar')
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. 👤 ${user.name}`)
        console.log(`   📧 Email: ${user.email}`)
        console.log(`   🔑 Role: ${user.role}`)
        console.log(`   🕒 Dibuat: ${user.createdAt.toLocaleString('id-ID')}`)
        console.log(`   🆔 ID: ${user.id}`)
      })
    }
    
    console.log('\n' + '=' .repeat(50))
    
  } catch (error) {
    console.error('❌ Error getting users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()