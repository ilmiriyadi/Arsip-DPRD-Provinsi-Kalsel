import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ role: session.user.role })
  } catch (error) {
    console.error("Error checking role:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}