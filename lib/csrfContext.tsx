'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface CsrfContextType {
  csrfToken: string | null
  refreshToken: () => Promise<void>
}

const CsrfContext = createContext<CsrfContextType>({
  csrfToken: null,
  refreshToken: async () => {},
})

export function CsrfProvider({ children }: { children: ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/csrf-token')
      const data = await response.json()
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken)
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
    }
  }

  useEffect(() => {
    refreshToken()
  }, [])

  return (
    <CsrfContext.Provider value={{ csrfToken, refreshToken }}>
      {children}
    </CsrfContext.Provider>
  )
}

export function useCsrf() {
  const context = useContext(CsrfContext)
  if (!context) {
    throw new Error('useCsrf must be used within CsrfProvider')
  }
  return context
}

/**
 * Helper hook untuk fetch dengan CSRF protection
 */
export function useCsrfFetch() {
  const { csrfToken, refreshToken } = useCsrf()

  return async (url: string, options: RequestInit = {}) => {
    // Jika belum ada token, refresh dulu
    if (!csrfToken && options.method && !['GET', 'HEAD'].includes(options.method)) {
      await refreshToken()
    }

    // Add CSRF token untuk non-safe methods
    const method = options.method?.toUpperCase()
    if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      options.headers = {
        ...options.headers,
        'x-csrf-token': csrfToken || '',
      }
    }

    const response = await fetch(url, options)

    // Jika CSRF error, refresh token dan retry
    if (response.status === 403) {
      const data = await response.json()
      if (data.error === 'Invalid CSRF token') {
        await refreshToken()
        // Retry dengan token baru
        options.headers = {
          ...options.headers,
          'x-csrf-token': csrfToken || '',
        }
        return fetch(url, options)
      }
    }

    return response
  }
}
