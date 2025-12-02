'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  FileText,
  SendHorizontal,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Send,
  Shield,
  Users
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/arsip/dashboard',
    icon: Home,
    description: 'Ringkasan & Overview'
  },
  {
    name: 'Surat Masuk',
    href: '/arsip/surat-masuk',
    icon: FileText,
    description: 'Kelola Surat Masuk'
  },
  {
    name: 'Surat Keluar',
    href: '/arsip/surat-keluar',
    icon: Send,
    description: 'Kelola Surat Keluar'
  },
  {
    name: 'Disposisi',
    href: '/arsip/disposisi',
    icon: SendHorizontal,
    description: 'Kelola Disposisi'
  }
]

const adminItems = [
  {
    name: 'Audit Logs',
    href: '/arsip/admin/audit-logs',
    icon: Shield,
    description: 'Security & Activity Logs'
  },
  {
    name: 'Pengaturan',
    href: '/arsip/settings',
    icon: Settings,
    description: 'Kelola Pengguna & Akun'
  }
]

const tamuNavigationItems = [
  {
    name: 'Dashboard',
    href: '/tamu/dashboard',
    icon: Home,
    description: 'Ringkasan Surat Tamu'
  },
  {
    name: 'Surat Tamu',
    href: '/surat-tamu',
    icon: FileText,
    description: 'Kelola Surat Tamu'
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/arsip/dashboard') {
      return pathname === '/arsip/dashboard'
    }
    return pathname.startsWith(href)
  }

  const isTamu = pathname?.startsWith('/tamu') || pathname?.startsWith('/surat-tamu')

  const handleSignOut = () => {
    const redirectTo = isTamu ? '/tamu/login' : '/arsip/login'
    signOut({ callbackUrl: redirectTo })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-[#E3E3E3]">
          {/* Logo/Brand with Signature Red Border */}
          <div className="civic-signature flex items-center flex-shrink-0 px-6 py-5 bg-white border-b border-[#E3E3E3]">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-[#B82025] rounded-lg flex items-center justify-center p-0.5 shadow-md">
                <Image
                  src="/logo-dprd.jpg"
                  alt="Logo DPRD Kalimantan Selatan"
                  width={48}
                  height={48}
                  className="rounded object-contain"
                />
              </div>
              <div>
                <div className="text-sm font-bold leading-tight" style={{ fontFamily: 'Merriweather, serif', color: '#1A1A1A' }}>
                  <div>Arsip Surat</div>
                  <div>DPRD</div>
                </div>
                <p className="text-[10px] font-medium leading-tight mt-0.5" style={{ fontFamily: 'Inter, sans-serif', color: '#4A4A4A' }}>
                  {isTamu ? 'Surat Tamu' : 'Provinsi Kalimantan Selatan'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6">
            <nav className="flex-1 space-y-8">
              {/* Main Navigation */}
              <div className="space-y-1">
                <p className="px-4 text-xs font-semibold text-[#737373] uppercase tracking-wider mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Menu Utama
                </p>
                {(isTamu ? tamuNavigationItems : navigationItems).map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg civic-transition relative overflow-hidden ${
                        active
                          ? 'bg-[#B82025] text-white shadow-sm'
                          : 'text-[#1A1A1A] hover:bg-[#F7F7F7]'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          active ? 'text-white' : 'text-[#B82025]'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-semibold">
                          {item.name}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Admin Navigation (hide for tamu area) */}
              {session?.user.role === 'ADMIN' && !isTamu && (
                <div className="space-y-1">
                  <p className="px-4 text-xs font-semibold text-[#737373] uppercase tracking-wider mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Administrator
                  </p>
                  {adminItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg civic-transition relative overflow-hidden ${
                          active
                            ? 'bg-[#1A1A1A] text-white shadow-sm'
                            : 'text-[#1A1A1A] hover:bg-[#F7F7F7]'
                        }`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8A348]"></div>}
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            active ? 'text-[#C8A348]' : 'text-[#737373]'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold">
                            {item.name}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 mt-auto pt-6 border-t border-[#E3E3E3]">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center w-full px-4 py-3 text-sm text-left bg-[#F7F7F7] border border-[#E3E3E3] rounded-lg hover:bg-white civic-transition"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="w-10 h-10 bg-[#B82025] rounded-lg flex items-center justify-center text-white text-base font-bold mr-3">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1A1A1A] truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-[#737373] truncate uppercase tracking-wide">
                      {session?.user?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#737373]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#E3E3E3] rounded-lg shadow-lg py-1 civic-fade">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-3 text-sm text-[#B82025] hover:bg-red-50 civic-transition font-medium"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl civic-fade">
            {/* Header with Signature Red Border */}
            <div className="civic-signature flex items-center justify-between px-6 py-5 bg-white border-b border-[#E3E3E3]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#B82025] rounded-lg flex items-center justify-center p-0.5 shadow-md">
                  <Image
                    src="/logo-dprd.jpg"
                    alt="Logo DPRD Kalimantan Selatan"
                    width={40}
                    height={40}
                    className="rounded object-contain"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold leading-tight" style={{ fontFamily: 'Merriweather, serif', color: '#1A1A1A' }}>
                    <div>Arsip Surat</div>
                    <div>DPRD</div>
                  </div>
                  <p className="text-[11px] font-medium mt-0.5" style={{ fontFamily: 'Inter, sans-serif', color: '#4A4A4A' }}>
                    {isTamu ? 'Surat Tamu' : 'Kalimantan Selatan'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-[#737373] hover:text-[#B82025] civic-transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-6 py-8 space-y-8">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <p className="px-4 text-xs font-semibold text-[#737373] uppercase tracking-wider mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Menu Utama
                  </p>
                  {(isTamu ? tamuNavigationItems : navigationItems).map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg civic-transition relative overflow-hidden ${
                          active
                            ? 'bg-[#B82025] text-white shadow-sm'
                            : 'text-[#1A1A1A] hover:bg-[#F7F7F7]'
                        }`}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
                        <Icon
                          className={`mr-3 h-5 w-5 ${
                            active ? 'text-white' : 'text-[#B82025]'
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-semibold">
                            {item.name}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Admin Navigation */}
                {session?.user.role === 'ADMIN' && !isTamu && (
                  <div className="space-y-1">
                    <p className="px-4 text-xs font-semibold text-[#737373] uppercase tracking-wider mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Administrator
                    </p>
                    {adminItems.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.href)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg civic-transition relative overflow-hidden ${
                            active
                              ? 'bg-[#1A1A1A] text-white shadow-sm'
                              : 'text-[#1A1A1A] hover:bg-[#F7F7F7]'
                          }`}
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C8A348]"></div>}
                          <Icon
                            className={`mr-3 h-5 w-5 ${
                              active ? 'text-[#C8A348]' : 'text-[#737373]'
                            }`}
                          />
                          <div className="flex-1">
                            <div className="font-semibold">
                              {item.name}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </nav>

              {/* User Profile */}
              <div className="flex-shrink-0 px-6 py-4 border-t border-[#E3E3E3]">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center w-full px-4 py-3 text-sm text-left bg-[#F7F7F7] border border-[#E3E3E3] rounded-lg hover:bg-white civic-transition"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <div className="w-10 h-10 bg-[#B82025] rounded-lg flex items-center justify-center text-white text-base font-bold mr-3">
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1A1A1A] truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-[#737373] truncate uppercase tracking-wide">
                        {session?.user?.role}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-[#737373]" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#E3E3E3] rounded-lg shadow-lg py-1 civic-fade">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-3 text-sm text-[#B82025] hover:bg-red-50 civic-transition font-medium"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation bar */}
        <div className="civic-signature-top bg-white shadow-sm border-b border-[#E3E3E3] lg:hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-[#1A1A1A] hover:text-[#B82025] civic-transition"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>Arsip DPRD Kalsel</h1>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content with proper margin */}
        <main className="min-h-screen bg-[#F7F7F7]">
          <div className="mx-auto px-6 sm:px-8 lg:px-12 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}