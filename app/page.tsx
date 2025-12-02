'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Building2, FileText, SendHorizontal, Users, ClipboardCheck, Search, Shield, Zap, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/arsip/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E3E3E3] mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B82025] border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-[#1A1A1A] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#B82025] via-[#8B1A1F] to-[#1A1A1A] border-b-4 border-[#C8A348] shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-18 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Merriweather, serif' }}>
                  Sistem Arsip Surat
                </h1>
                <p className="text-sm text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
                  DPRD Provinsi Kalimantan Selatan
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Pattern Background */}
      <div className="relative bg-gradient-to-br from-white via-[#F7F7F7] to-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#B82025] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C8A348] rounded-full blur-3xl"></div>
        </div>

        <main className="relative max-w-7xl mx-auto px-6 lg:px-18 py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-[#B82025]/10 border border-[#B82025]/20 rounded-full mb-8">
              <span className="text-[#B82025] text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>
                Borneo Civic Blueprint
              </span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-bold text-[#1A1A1A] mb-6 leading-tight" style={{ fontFamily: 'Merriweather, serif' }}>
              Sistem Manajemen<br />Arsip Surat Digital
            </h2>
            <p className="text-xl text-[#737373] mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Platform terintegrasi untuk mengelola surat masuk, surat keluar, disposisi, dan surat tamu dengan efisien, aman, dan terorganisir.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/arsip/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#B82025] to-[#8B1A1F] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 civic-transition text-lg group"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Building2 className="w-5 h-5" />
                Arsip Surat
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 civic-transition" />
              </Link>
              <Link
                href="/tamu/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#1A1A1A] border-2 border-[#E3E3E3] rounded-xl font-semibold hover:border-[#B82025] hover:text-[#B82025] civic-transition text-lg group"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Users className="w-5 h-5" />
                Surat Tamu
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 civic-transition" />
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E3E3E3] text-center hover:shadow-xl civic-transition">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Merriweather, serif' }}>100%</div>
              <div className="text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Aman</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E3E3E3] text-center hover:shadow-xl civic-transition">
              <div className="w-12 h-12 bg-gradient-to-br from-[#C8A348] to-[#A88A3A] rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Merriweather, serif' }}>24/7</div>
              <div className="text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Akses</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E3E3E3] text-center hover:shadow-xl civic-transition">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1A1A1A] to-[#3A3A3A] rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Merriweather, serif' }}>Digital</div>
              <div className="text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Arsip</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E3E3E3] text-center hover:shadow-xl civic-transition">
              <div className="w-12 h-12 bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-xl flex items-center justify-center mx-auto mb-4">
                <ClipboardCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Merriweather, serif' }}>Efisien</div>
              <div className="text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Proses</div>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-18 py-24">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
            Fitur Lengkap untuk Kebutuhan Anda
          </h3>
          <p className="text-lg text-[#737373] max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Semua yang Anda butuhkan untuk mengelola arsip surat dengan efisien dan terorganisir
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-[#E3E3E3] hover:shadow-xl hover:border-[#B82025] civic-transition">
            <div className="w-16 h-16 bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 civic-transition">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
              Surat Masuk
            </h3>
            <p className="text-[#737373] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Kelola dan organisir semua surat masuk dengan sistem yang terstruktur dan mudah dicari.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-[#E3E3E3] hover:shadow-xl hover:border-[#C8A348] civic-transition">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C8A348] to-[#A88A3A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 civic-transition">
              <SendHorizontal className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
              Surat Keluar
            </h3>
            <p className="text-[#737373] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Buat dan kelola surat keluar dengan template standar dan integrasi dengan surat masuk.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-[#E3E3E3] hover:shadow-xl hover:border-[#1A1A1A] civic-transition">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1A1A1A] to-[#3A3A3A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 civic-transition">
              <ClipboardCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
              Disposisi
            </h3>
            <p className="text-[#737373] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Buat dan kelola disposisi surat dengan tracking status yang jelas dan real-time.
            </p>
          </div>

          <div className="group bg-white rounded-2xl p-8 shadow-lg border border-[#E3E3E3] hover:shadow-xl hover:border-[#B82025] civic-transition">
            <div className="w-16 h-16 bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 civic-transition">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Merriweather, serif' }}>
              Pencarian Cepat
            </h3>
            <p className="text-[#737373] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Temukan surat yang Anda cari dengan cepat menggunakan filter dan pencarian lanjutan.
            </p>
          </div>
        </div>
      </section>

      {/* Role-based Features Section */}
      <section className="bg-gradient-to-br from-[#F7F7F7] to-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-18">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'Merriweather, serif' }}>
              Akses Berdasarkan Peran
            </h3>
            <p className="text-lg text-[#737373] max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Sistem dirancang untuk mendukung berbagai tingkat akses sesuai kebutuhan organisasi
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-[#B82025]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#B82025] to-[#8B1A1F] rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                    Administrator
                  </h4>
                  <p className="text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Akses Penuh</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#B82025] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Kelola semua surat masuk dan keluar</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#B82025] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Buat dan kelola disposisi</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#B82025] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Manajemen pengguna dan hak akses</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#B82025] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Akses ke audit log dan laporan</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-[#C8A348]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[#C8A348] to-[#A88A3A] rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                    Tamu
                  </h4>
                  <p className="text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>Akses Terbatas</p>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C8A348] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Buat dan kelola surat tamu</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C8A348] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Lihat status pengajuan surat</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C8A348] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Dashboard tracking surat tamu</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#C8A348] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>Notifikasi otomatis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] border-t-4 border-[#C8A348]">
        <div className="max-w-7xl mx-auto px-6 lg:px-18 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className="text-white font-bold text-lg" style={{ fontFamily: 'Merriweather, serif' }}>Arsip Surat</h5>
                  <p className="text-white/70 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>DPRD Kalsel</p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sistem manajemen arsip surat digital untuk DPRD Provinsi Kalimantan Selatan.
              </p>
            </div>
            
            <div>
              <h6 className="text-white font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Fitur Utama</h6>
              <ul className="space-y-2 text-white/70 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <li>Surat Masuk</li>
                <li>Surat Keluar</li>
                <li>Disposisi</li>
                <li>Surat Tamu</li>
              </ul>
            </div>
            
            <div>
              <h6 className="text-white font-bold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Akses</h6>
              <ul className="space-y-2 text-white/70 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                <li>
                  <Link href="/arsip/login" className="hover:text-white civic-transition">Login Arsip</Link>
                </li>
                <li>
                  <Link href="/tamu/login" className="hover:text-white civic-transition">Login Tamu</Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/60 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              &copy; 2024 DPRD Provinsi Kalimantan Selatan. Sistem Arsip Surat Digital. <span className="text-[#C8A348]">Borneo Civic Blueprint</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
