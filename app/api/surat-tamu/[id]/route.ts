/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withCsrfProtection } from "@/lib/csrf"
import { z } from "zod"

const suratTamuSchema = z.object({
  noUrut: z.number().min(1),
  nama: z.string().min(1),
  keperluan: z.string().min(1),
  asalSurat: z.string().min(1),
  tujuanSurat: z.string().min(1),
  nomorTelpon: z.string().optional(),
  tanggal: z.string().datetime(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (session.user.role !== 'MEMBER') return NextResponse.json({ error: "Forbidden - Member only" }, { status: 403 })

    const { id } = await params
    const db: any = prisma
    const item = await db.suratTamu.findUnique({ where: { id }, include: { createdBy: { select: { id: true, name: true, email: true } } } })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withCsrfProtection(req, async (request) => {
    try {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (session.user.role !== 'MEMBER') return NextResponse.json({ error: "Forbidden - Member only" }, { status: 403 })
      const { id } = await params
      const body = await request.json()
      const data = suratTamuSchema.partial().parse(body)
      const db: any = prisma
      const updated = await db.suratTamu.update({ where: { id }, data: { ...data, tanggal: data.tanggal ? new Date(data.tanggal) : undefined } })
      return NextResponse.json(updated)
    } catch (error) {
      if (error instanceof z.ZodError) return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
      console.error(error)
      return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withCsrfProtection(req, async (_request) => {
    try {
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      if (session.user.role !== 'MEMBER') return NextResponse.json({ error: "Forbidden - Member only" }, { status: 403 })
      const { id } = await params
      const db: any = prisma
      await db.suratTamu.delete({ where: { id } })
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error(error)
      return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
  })
}
