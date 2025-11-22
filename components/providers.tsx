'use client'

import { SessionProvider } from 'next-auth/react'
import { CsrfProvider } from '@/lib/csrfContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CsrfProvider>
        {children}
      </CsrfProvider>
    </SessionProvider>
  )
}