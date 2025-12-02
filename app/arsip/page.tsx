'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  FileText, 
  ClipboardList, 
  Calendar,
  Search,
  Plus,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Send
} from 'lucide-react'

interface SuratMasuk {
  id: string
  noUrut: number
  nomorSurat: string | null
  tanggalSurat: string
  asalSurat: string
  perihal: string
  keterangan?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalSurat: 0,
    totalSuratKeluar: 0,
    totalDisposisi: 0,
    suratBulanIni: 0,
    disposisiPending: 0
  })
  const [recentSurats, setRecentSurats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/arsip/login')
    }
  }, [status, router])

  useEffect(() => {
    // Fetch dashboard data menggunakan dedicated stats API
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Single optimized API call instead of 3 separate calls
        const response = await fetch('/api/dashboard/stats')
        
        if (response.ok) {
          const data = await response.json()
          
          setStats(data.stats)
          setRecentSurats(data.recentSurats || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#E3E3E3]"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#B82025] border-t-transparent absolute top-0"></div>
            </div>
            <p className="mt-6 text-[#1A1A1A] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) return null

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header with Signature Red Border */}
        <div className="civic-signature bg-white rounded-lg p-8 shadow-sm border border-[#E3E3E3]">
          <h1 className="text-[32px] font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Merriweather, serif' }}>
            Dashboard Arsip Surat
          </h1>
          <p className="text-[#4A4A4A] text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sistem Manajemen Arsip DPRD Provinsi Kalimantan Selatan
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="civic-card civic-transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#737373] mb-2 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Total Surat Masuk</p>
                <p className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>{stats.totalSurat}</p>
                <p className="text-xs text-[#4A4A4A] mt-2 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Semua dokumen
                </p>
              </div>
              <div className="w-14 h-14 bg-[#B82025] rounded-lg flex items-center justify-center shadow-sm">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="civic-card civic-transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#737373] mb-2 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Total Surat Keluar</p>
                <p className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>{stats.totalSuratKeluar}</p>
                <p className="text-xs text-[#4A4A4A] mt-2 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Send className="w-3 h-3 mr-1" />
                  Terkirim
                </p>
              </div>
              <div className="w-14 h-14 bg-[#1A1A1A] rounded-lg flex items-center justify-center shadow-sm">
                <Send className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="civic-card civic-transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#737373] mb-2 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Total Disposisi</p>
                <p className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>{stats.totalDisposisi}</p>
                <p className="text-xs text-[#4A4A4A] mt-2 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Terdisposisi
                </p>
              </div>
              <div className="w-14 h-14 bg-[#B82025] rounded-lg flex items-center justify-center shadow-sm">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="civic-card civic-transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#737373] mb-2 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Surat Bulan Ini</p>
                <p className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>{stats.suratBulanIni}</p>
                <p className="text-xs text-[#4A4A4A] mt-2 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Calendar className="w-3 h-3 mr-1" />
                  Dokumen baru
                </p>
              </div>
              <div className="w-14 h-14 bg-[#1A1A1A] rounded-lg flex items-center justify-center shadow-sm">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="civic-card civic-transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#737373] mb-2 uppercase tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>Disposisi Pending</p>
                <p className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>{stats.disposisiPending}</p>
                <p className="text-xs text-[#4A4A4A] mt-2 flex items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <Clock className="w-3 h-3 mr-1" />
                  Belum didisposisi
                </p>
              </div>
              <div className="w-14 h-14 bg-[#C8A348] rounded-lg flex items-center justify-center shadow-sm">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          {session.user.role === 'ADMIN' && (
            <div className="civic-card">
              <div className="border-b border-[#E3E3E3] pb-4 mb-6">
                <h3 className="text-[18px] font-bold text-[#1A1A1A] flex items-center" style={{ fontFamily: 'Merriweather, serif' }}>
                  <div className="w-10 h-10 bg-[#B82025] rounded-lg flex items-center justify-center mr-3">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  Aksi Cepat
                </h3>
              </div>
              <div className="space-y-4">
                <Link
                  href="/arsip/surat-masuk/add"
                  className="flex items-center p-4 bg-white border-2 border-[#E3E3E3] rounded-lg hover:border-[#B82025] civic-transition group"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="w-12 h-12 bg-[#B82025] rounded-lg flex items-center justify-center group-hover:shadow-md civic-transition">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-[#1A1A1A]">Tambah Surat Masuk</h4>
                    <p className="text-sm text-[#737373]">Input dokumen surat baru</p>
                  </div>
                </Link>

                <Link
                  href="/arsip/disposisi/add"
                  className="flex items-center p-4 bg-white border-2 border-[#E3E3E3] rounded-lg hover:border-[#1A1A1A] civic-transition group"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center group-hover:shadow-md civic-transition">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-[#1A1A1A]">Buat Disposisi</h4>
                    <p className="text-sm text-[#737373]">Proses disposisi dokumen</p>
                  </div>
                </Link>

                <Link
                  href="/arsip/surat-keluar/add"
                  className="flex items-center p-4 bg-white border-2 border-[#E3E3E3] rounded-lg hover:border-[#B82025] civic-transition group"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="w-12 h-12 bg-[#B82025] rounded-lg flex items-center justify-center group-hover:shadow-md civic-transition">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-[#1A1A1A]">Tambah Surat Keluar</h4>
                    <p className="text-sm text-[#737373]">Buat surat keluar baru</p>
                  </div>
                </Link>

                <Link
                  href="/arsip/surat-masuk"
                  className="flex items-center p-4 bg-white border-2 border-[#E3E3E3] rounded-lg hover:border-[#1A1A1A] civic-transition group"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <div className="w-12 h-12 bg-[#1A1A1A] rounded-lg flex items-center justify-center group-hover:shadow-md civic-transition">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-[#1A1A1A]">Cari & Filter</h4>
                    <p className="text-sm text-[#737373]">Temukan dokumen dengan cepat</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="civic-card">
            <div className="border-b border-[#E3E3E3] pb-4 mb-6">
              <h3 className="text-[18px] font-bold text-[#1A1A1A] flex items-center" style={{ fontFamily: 'Merriweather, serif' }}>
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-lg flex items-center justify-center mr-3">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Aktivitas Terbaru
              </h3>
            </div>
            <div>
              {recentSurats.length > 0 ? (
                <div className="space-y-3">
                  {recentSurats.map((surat: SuratMasuk) => (
                    <div key={surat.id} className="flex items-center p-4 bg-[#F7F7F7] rounded-lg hover:bg-white hover:border hover:border-[#B82025] civic-transition border border-transparent" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <div className="w-12 h-12 bg-[#B82025] rounded-lg flex items-center justify-center text-white text-base font-bold shadow-sm">
                        {surat.noUrut}
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <p className="font-semibold text-[#1A1A1A] truncate">{surat.nomorSurat || '-'}</p>
                        <p className="text-sm text-[#4A4A4A] truncate">{surat.asalSurat}</p>
                        <p className="text-xs text-[#737373] mt-1">{formatDate(surat.tanggalSurat)}</p>
                      </div>
                      <Link
                        href={`/arsip/surat-masuk/${surat.id}`}
                        className="p-2 text-[#737373] hover:text-[#B82025] civic-transition"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  ))}
                  <Link
                    href="/arsip/surat-masuk"
                    className="block text-center text-sm text-[#B82025] hover:text-[#1A1A1A] font-semibold py-3 civic-transition"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Lihat Semua Surat →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-12" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <FileText className="w-16 h-16 text-[#E3E3E3] mx-auto mb-4" />
                  <p className="text-[#1A1A1A] font-semibold mb-1">Belum ada surat masuk</p>
                  <p className="text-sm text-[#737373]">Mulai dengan menambahkan surat pertama</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


