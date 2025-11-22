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
  Send
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Ringkasan & Overview'
  },
  {
    name: 'Surat Masuk',
    href: '/dashboard/surat-masuk',
    icon: FileText,
    description: 'Kelola Surat Masuk'
  },
  {
    name: 'Surat Keluar',
    href: '/dashboard/surat-keluar',
    icon: Send,
    description: 'Kelola Surat Keluar'
  },
  {
    name: 'Disposisi',
    href: '/dashboard/disposisi',
    icon: SendHorizontal,
    description: 'Kelola Disposisi'
  }
]

const adminItems = [
  {
    name: 'Kelola Pengguna',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Kelola Pengguna'
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
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const isTamu = pathname?.startsWith('/tamu') || pathname?.startsWith('/surat-tamu')

  const handleSignOut = () => {
    const redirectTo = isTamu ? '/tamu/login' : '/arsip/login'
    signOut({ callbackUrl: redirectTo })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200 shadow-xl">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0 px-6 py-6 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center p-1">
                <Image
                  src="/logo-dprd.jpg"
                  alt="Logo DPRD Kalimantan Selatan"
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                />
              </div>
              <div>
                <h1 className="text-white text-sm font-bold leading-tight">Sistem Manajemen Arsip</h1>
                  <p className="text-white text-xs font-semibold">{isTamu ? 'Surat Tamu' : 'Surat Masuk DPRD'}</p>
                  <p className="text-blue-100 text-xs">Kalimantan Selatan</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {/* Main Navigation */}
              <div className="space-y-1">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Menu Utama
                </p>
                {(isTamu ? tamuNavigationItems : navigationItems).map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                      }`}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 transition-colors ${
                          active ? 'text-white' : 'text-slate-500 group-hover:text-blue-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${active ? 'text-white' : ''}`}>
                          {item.name}
                        </div>
                        <div className={`text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Admin Navigation (hide for tamu area) */}
              {session?.user.role === 'ADMIN' && !isTamu && (
                <div className="pt-6 space-y-1">
                  <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Administrator
                  </p>
                  {adminItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-purple-700'
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 transition-colors ${
                            active ? 'text-white' : 'text-slate-500 group-hover:text-purple-500'
                          }`}
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${active ? 'text-white' : ''}`}>
                            {item.name}
                          </div>
                          <div className={`text-xs ${active ? 'text-purple-100' : 'text-slate-500'}`}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 bg-slate-50">
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center w-full px-3 py-2 text-sm text-left bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {session?.user?.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg py-2">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
          <div className="fixed inset-y-0 left-0 w-72 bg-white border-r border-slate-200 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center p-1">
                  <Image
                    src="/logo-dprd.jpg"
                    alt="Logo DPRD Kalimantan Selatan"
                    width={32}
                    height={32}
                    className="rounded object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-white text-xs font-bold leading-tight">Sistem Manajemen Arsip</h1>
                  <p className="text-white text-xs font-semibold">{isTamu ? 'Surat Tamu' : 'Surat Masuk'}</p>
                  <p className="text-blue-100 text-xs">DPRD Kalimantan Selatan</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-blue-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-4 py-6 space-y-2">
                {/* Main Navigation */}
                <div className="space-y-1">
                  <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Menu Utama
                  </p>
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          active
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-blue-700'
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 transition-colors ${
                            active ? 'text-white' : 'text-slate-500 group-hover:text-blue-500'
                          }`}
                        />
                        <div className="flex-1">
                          <div className={`font-medium ${active ? 'text-white' : ''}`}>
                            {item.name}
                          </div>
                          <div className={`text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Admin Navigation */}
                {session?.user.role === 'ADMIN' && !isTamu && (
                  <div className="pt-6 space-y-1">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                          className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            active
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-purple-700'
                          }`}
                        >
                          <Icon
                            className={`mr-3 h-5 w-5 transition-colors ${
                              active ? 'text-white' : 'text-slate-500 group-hover:text-purple-500'
                            }`}
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${active ? 'text-white' : ''}`}>
                              {item.name}
                            </div>
                            <div className={`text-xs ${active ? 'text-purple-100' : 'text-slate-500'}`}>
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </nav>

              {/* User Profile */}
              <div className="flex-shrink-0 px-4 py-4 border-t border-slate-200 bg-slate-50">
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center w-full px-3 py-2 text-sm text-left bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {session?.user?.role}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg py-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
      <div className="lg:pl-72">
        {/* Top navigation bar */}
        <div className="bg-white shadow-sm border-b border-slate-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-sm font-semibold text-slate-900">Sistem Manajemen Arsip - DPRD Kalsel</h1>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}