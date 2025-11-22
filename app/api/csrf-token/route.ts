import { NextRequest, NextResponse } from 'next/server'
import { createCsrfTokenResponse } from '@/lib/csrf'

/**
 * GET /api/csrf-token
 * Endpoint untuk mendapatkan CSRF token
 * Frontend akan call ini sebelum melakukan POST/PUT/DELETE
 */
export async function GET(request: NextRequest) {
  return createCsrfTokenResponse(request)
}
