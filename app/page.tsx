'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Sistem Arsip Surat
            </h1>
            <div className="space-x-4">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Kelola Arsip Surat
            <span className="text-blue-600"> dengan Mudah</span>
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
            Sistem manajemen arsip surat masuk, surat keluar, dan disposisi yang membantu Anda 
            mengorganisir, mencari, dan mengelola dokumen dengan efisien.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/arsip/login"
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              Arsip Surat
            </Link>
              <Link
              href="/tamu/login"
              className="bg-green-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-700 transition duration-200"
            >
              Surat Tamu
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-3xl mb-4">�</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Surat Masuk
            </h3>
            <p className="text-gray-600">
              Kelola dan organisir semua surat masuk dengan sistem yang terstruktur dan mudah dicari.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-green-600 text-3xl mb-4">📤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Surat Keluar
            </h3>
            <p className="text-gray-600">
              Buat dan kelola surat keluar dengan template standar dan integrasi dengan surat masuk.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-purple-600 text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Disposisi
            </h3>
            <p className="text-gray-600">
              Buat dan kelola disposisi surat dengan tracking status yang jelas dan real-time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-indigo-600 text-3xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Filter & Pencarian
            </h3>
            <p className="text-gray-600">
              Temukan dokumen dengan cepat menggunakan filter tanggal, bulan, dan pencarian teks.
            </p>
          </div>
        </div>

        {/* Role Features */}
        <div className="mt-20 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Fitur Berdasarkan Role
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-4">👑</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Admin</h4>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Menambah, edit, dan hapus surat masuk & keluar</li>
                <li>✓ Membuat disposisi dan surat keluar</li>
                <li>✓ Manajemen user dan pengaturan sistem</li>
                <li>✓ Akses penuh ke semua fitur</li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-blue-600 text-4xl mb-4">👤</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Member</h4>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Melihat daftar surat masuk & keluar</li>
                <li>✓ Melihat detail surat dan disposisi</li>
                <li>✓ Menggunakan fitur pencarian dan filter</li>
                <li>✓ Download dokumen (jika tersedia)</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Sistem Arsip Surat. Dibuat dengan Next.js dan Tailwind CSS.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
