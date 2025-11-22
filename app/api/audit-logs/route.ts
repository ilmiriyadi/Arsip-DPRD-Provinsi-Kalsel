import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAuditLogs, getFailedLoginAttempts } from "@/lib/auditLog"

// GET - Retrieve audit logs (Admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") // 'all' or 'failed-logins'
    const userId = searchParams.get("userId") || undefined
    const action = searchParams.get("action") as any
    const entity = searchParams.get("entity") as any
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const days = parseInt(searchParams.get("days") || "30")

    // Get date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    if (type === 'failed-logins') {
      // Get only failed login attempts
      const hours = parseInt(searchParams.get("hours") || "24")
      const failedLogins = await getFailedLoginAttempts({ hours, limit })
      
      return NextResponse.json({
        logs: failedLogins,
        total: failedLogins.length,
        type: 'failed-logins'
      })
    }

    // Get all audit logs with filters
    const result = await getAuditLogs({
      userId,
      action,
      entity,
      startDate,
      endDate,
      limit,
      page
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
