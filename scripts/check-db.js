import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log("🔍 Checking database...")
    
    // Cek users
    const users = await prisma.user.findMany()
    console.log("👥 Users:", users.map(u => ({ id: u.id, email: u.email, role: u.role })))
    
    // Cek surat masuk 
    const suratMasuk = await prisma.suratMasuk.findMany()
    console.log("📄 Surat Masuk:", suratMasuk.length, "records")
    
    // Cek disposisi
    const disposisi = await prisma.disposisi.findMany()
    console.log("📋 Disposisi:", disposisi.length, "records")
    
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()