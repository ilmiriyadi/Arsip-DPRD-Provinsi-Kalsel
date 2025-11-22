'use client'

/**
 * CSRF-protected fetch utility
 * Auto-includes CSRF token untuk semua POST/PUT/DELETE requests
 */

let csrfToken: string | null = null

// Fetch CSRF token dari server
async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken
  
  try {
    const response = await fetch('/api/csrf-token')
    const data = await response.json()
    csrfToken = data.csrfToken
    return csrfToken || ''
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
    return ''
  }
}

// Refresh CSRF token
export async function refreshCsrfToken(): Promise<void> {
  csrfToken = null
  await getCsrfToken()
}

/**
 * Fetch wrapper dengan auto CSRF protection
 * Drop-in replacement untuk fetch()
 */
export async function csrfFetch(
  url: string | URL | Request,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase()
  
  // Tambahkan CSRF token untuk non-safe methods
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await getCsrfToken()
    
    options.headers = {
      ...options.headers,
      'x-csrf-token': token,
    }
  }
  
  const response = await fetch(url, options)
  
  // Jika CSRF error, refresh token dan retry
  if (response.status === 403) {
    try {
      const data = await response.clone().json()
      if (data.error === 'Invalid CSRF token') {
        await refreshCsrfToken()
        const token = await getCsrfToken()
        options.headers = {
          ...options.headers,
          'x-csrf-token': token,
        }
        return fetch(url, options)
      }
    } catch {
      // Not a JSON response, return original
    }
  }
  
  return response
}

// Initialize token on load
if (typeof window !== 'undefined') {
  getCsrfToken().catch(console.error)
}
