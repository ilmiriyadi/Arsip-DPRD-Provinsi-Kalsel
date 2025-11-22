/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { withCsrfProtection } from "@/lib/csrf"

const suratTamuSchema = z.object({
  noUrut: z.number().min(1),
  nama: z.string().min(1),
  keperluan: z.string().min(1),
  asalSurat: z.string().min(1),
  tujuanSurat: z.string().min(1),
  nomorTelpon: z.string().optional(),
  tanggal: z.string().datetime(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== 'MEMBER') return NextResponse.json({ error: "Forbidden - Member only" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { keperluan: { contains: search } },
        { asalSurat: { contains: search } },
        { tujuanSurat: { contains: search } },
      ]
    }

    const db: any = prisma
    const [data, total] = await Promise.all([
      db.suratTamu.findMany({ where, orderBy: { noUrut: 'desc' }, skip, take: limit, include: { createdBy: { select: { id: true, name: true, email: true } } } }),
      db.suratTamu.count({ where })
    ])

    return NextResponse.json({ suratTamu: data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (error) {
    console.error("Error fetching surat tamu:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== 'MEMBER') return NextResponse.json({ error: "Forbidden - Member only" }, { status: 403 })

    const body = await req.json()
    const data = suratTamuSchema.parse(body)

    // check unique noUrut
  const db: any = prisma
  const existing = await db.suratTamu.findFirst({ where: { noUrut: data.noUrut } })
    if (existing) return NextResponse.json({ error: `No urut ${data.noUrut} sudah digunakan` }, { status: 400 })

  const created = await db.suratTamu.create({ data: { ...data, tanggal: new Date(data.tanggal), createdById: session.user.id }, include: { createdBy: { select: { id: true, name: true, email: true } } } })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    console.error("Error creating surat tamu:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
  })
}
