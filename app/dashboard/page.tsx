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
  nomorSurat: string
  tanggalSurat: string
  asalSurat: string
  perihal: string
  keterangan?: string
}

interface SuratMasukResponse {
  suratMasuk?: SuratMasuk[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
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
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [suratRes, disposisiRes, suratKeluarRes] = await Promise.all([
          fetch('/api/surat-masuk?limit=5'),
          fetch('/api/disposisi'),
          fetch('/api/surat-keluar')
        ])
        
        if (suratRes.ok && disposisiRes.ok && suratKeluarRes.ok) {
          const suratData = await suratRes.json()
          const disposisiData = await disposisiRes.json()
          const suratKeluarData = await suratKeluarRes.json()
          
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          
          const suratBulanIni = (suratData as SuratMasukResponse).suratMasuk?.filter((surat: SuratMasuk) => {
            const suratDate = new Date(surat.tanggalSurat)
            return suratDate.getMonth() === currentMonth && suratDate.getFullYear() === currentYear
          }).length || 0
          
          const totalSurat = suratData.pagination?.total || 0
          const totalSuratKeluar = suratKeluarData.pagination?.total || 0
          const totalDisposisi = disposisiData.pagination?.total || 0
          const disposisiPending = Math.max(0, totalSurat - totalDisposisi)
          
          setStats({
            totalSurat,
            totalSuratKeluar,
            totalDisposisi,
            suratBulanIni,
            disposisiPending
          })
          
          setRecentSurats(suratData.suratMasuk?.slice(0, 5) || [])
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
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">Memuat dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) return null

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Surat Masuk</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalSurat}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Semua dokumen
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Surat Keluar</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalSuratKeluar}</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <Send className="w-3 h-3 mr-1" />
                    Terkirim
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Total Disposisi</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalDisposisi}</p>
                  <p className="text-xs text-emerald-600 mt-1 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Terdisposisi
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Surat Bulan Ini</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.suratBulanIni}</p>
                  <p className="text-xs text-blue-600 mt-1 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Dokumen baru
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Disposisi Pending</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.disposisiPending}</p>
                  <p className="text-xs text-amber-600 mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    Belum didisposisi
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          {session.user.role === 'ADMIN' && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                  Aksi Cepat
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <Link
                  href="/dashboard/surat-masuk/add"
                  className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group border border-blue-200 hover:border-blue-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-slate-900">Tambah Surat Masuk</h4>
                    <p className="text-sm text-slate-600">Input dokumen surat baru</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/disposisi/add"
                  className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:from-emerald-100 hover:to-teal-100 transition-all duration-200 group border border-emerald-200 hover:border-emerald-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-slate-900">Buat Disposisi</h4>
                    <p className="text-sm text-slate-600">Proses disposisi dokumen</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/surat-keluar/add"
                  className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 group border border-green-200 hover:border-green-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-slate-900">Tambah Surat Keluar</h4>
                    <p className="text-sm text-slate-600">Buat surat keluar baru</p>
                  </div>
                </Link>

                <Link
                  href="/dashboard/surat-masuk"
                  className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group border border-purple-200 hover:border-purple-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-slate-900">Cari & Filter</h4>
                    <p className="text-sm text-slate-600">Temukan dokumen dengan cepat</p>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Aktivitas Terbaru
              </h3>
            </div>
            <div className="p-6">
              {recentSurats.length > 0 ? (
                <div className="space-y-4">
                  {recentSurats.map((surat: SuratMasuk) => (
                    <div key={surat.id} className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {surat.noUrut}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{surat.nomorSurat}</p>
                        <p className="text-sm text-slate-600 truncate">{surat.asalSurat}</p>
                        <p className="text-xs text-slate-500">{formatDate(surat.tanggalSurat)}</p>
                      </div>
                      <Link
                        href={`/dashboard/surat-masuk/${surat.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                  <Link
                    href="/dashboard/surat-masuk"
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2"
                  >
                    Lihat Semua Surat →
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">Belum ada surat masuk</p>
                  <p className="text-sm text-slate-500">Mulai dengan menambahkan surat pertama</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

