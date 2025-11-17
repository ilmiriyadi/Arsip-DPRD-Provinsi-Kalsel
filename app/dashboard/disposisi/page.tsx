'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Hash,
  FileText,
  Calendar,
  Users,
  CheckCircle,
  User,
  Settings,
  Download,
  Loader2
} from 'lucide-react'

interface Disposisi {
  id: string
  noUrut: number
  tanggalDisposisi: string
  tujuanDisposisi: string
  isiDisposisi: string
  keterangan?: string
  status: 'SELESAI'
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  suratMasuk: {
    id: string
    nomorSurat: string
    perihal: string
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function DisposisiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [disposisiList, setDisposisiList] = useState<Disposisi[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [isExporting, setIsExporting] = useState(false)


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Debounce search term untuk real-time search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      // Reset ke halaman 1 ketika melakukan pencarian baru
      if (searchTerm !== debouncedSearchTerm) {
        setPagination(prev => ({ ...prev, page: 1 }))
      }
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearchTerm])

  useEffect(() => {
    if (session) {
      fetchDisposisi()
    }
  }, [session, pagination.page, debouncedSearchTerm, dateFilter, monthFilter])

  const fetchDisposisi = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
      if (dateFilter) params.append('tanggal', dateFilter)
      if (monthFilter) params.append('bulan', monthFilter)


      const response = await fetch(`/api/disposisi?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setDisposisiList(data.disposisi || [])
        setPagination(data.pagination)
      } else {
        setError('Gagal mengambil data disposisi')
      }
    } catch (error) {
      console.error('Error fetching disposisi:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus disposisi ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/disposisi/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDisposisi()
        alert('Disposisi berhasil dihapus')
      } else {
        alert('Gagal menghapus disposisi')
      }
    } catch (error) {
      console.error('Error deleting disposisi:', error)
      alert('Terjadi kesalahan sistem')
    }
  }

  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/disposisi/export')
      
      if (!response.ok) {
        throw new Error('Gagal mengexport data')
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'disposisi-export.xlsx'

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      alert('Data disposisi berhasil diexport ke Excel!')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Gagal mengexport data ke Excel')
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    return (
      <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        <span className="mr-1">✅</span>
        Selesai
      </span>
    )
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <p className="mt-4 text-slate-600 font-medium">Memuat disposisi...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) return null

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-900 to-teal-900 bg-clip-text text-transparent">
                  Disposisi
                </h1>
                <p className="mt-1 text-sm text-slate-600 font-medium">
                  Sistem Manajemen Disposisi Surat
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="inline-flex items-center px-5 py-2.5 border border-emerald-300 rounded-xl shadow-lg text-sm font-medium text-emerald-700 bg-white hover:bg-emerald-50 transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Mengexport...' : 'Export Excel'}
              </button>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/disposisi/add"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Disposisi
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mr-3">
                <Filter className="h-4 w-4 text-white" />
              </div>
              Pencarian & Filter Data
            </h3>
            <p className="text-sm text-slate-600 mt-1 ml-11">Gunakan fitur pencarian untuk menemukan disposisi dengan cepat</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    🔍 Pencarian Real-time
                  </label>
                  <div className="relative group">
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${loading && searchTerm ? 'animate-spin text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm hover:shadow-md"
                      placeholder="Ketik untuk mencari tujuan, isi disposisi, atau nomor surat..."
                    />
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 hover:text-red-500 transition-colors duration-200 bg-slate-100 hover:bg-red-50 rounded-full p-1"
                        title="Hapus pencarian"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      📅 Filter Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      🗓️ Filter Bulan
                    </label>
                    <input
                      type="month"
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                  {(debouncedSearchTerm || dateFilter || monthFilter) && (
                    <>
                      {debouncedSearchTerm && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                          🔍 &quot;{debouncedSearchTerm}&quot;
                        </span>
                      )}
                      {dateFilter && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          📅 {formatDate(dateFilter)}
                        </span>
                      )}
                      {monthFilter && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          🗓️ {monthFilter}
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {(debouncedSearchTerm || dateFilter || monthFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('')
                      setDateFilter('')
                      setMonthFilter('')
                      setPagination(prev => ({ ...prev, page: 1 }))
                    }}
                    className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    🗑️ Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Daftar Disposisi
                  </h3>
                  {pagination.total > 0 && (
                    <p className="text-sm text-slate-600">
                      Total {pagination.total} disposisi • Halaman {pagination.page} dari {pagination.totalPages}
                    </p>
                  )}
                </div>
              </div>
              {pagination.total > 0 && (
                <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                  <span>Aktif</span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : disposisiList.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">Belum ada disposisi</h3>
              <p className="text-slate-500 mb-6">Disposisi yang ditambahkan akan muncul di sini.</p>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/disposisi/add"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Disposisi Pertama
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-emerald-50">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4" />
                            <span>No Urut</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-emerald-50">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Surat Masuk</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-emerald-50">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Tanggal</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-emerald-50">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>Tujuan</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-emerald-50">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Status</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-emerald-50">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Dibuat Oleh</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider bg-gradient-to-r from-slate-50 to-emerald-50">
                          <div className="flex items-center justify-end space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Aksi</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {disposisiList.map((disposisi, index) => (
                        <tr key={disposisi.id} className="group hover:bg-gradient-to-r hover:from-slate-50 hover:to-emerald-50 transition-all duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center text-xs font-semibold text-emerald-700">
                                {index + 1 + (pagination.page - 1) * 10}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">#{disposisi.noUrut}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="font-semibold text-gray-900 mb-1">{disposisi.suratMasuk.nomorSurat || '-'}</div>
                              <div className="text-slate-600 text-sm line-clamp-2" title={disposisi.suratMasuk.perihal}>
                                {disposisi.suratMasuk.perihal}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                              <span className="text-sm font-medium text-slate-600">
                                {formatDate(disposisi.tanggalDisposisi)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <p className="font-medium text-slate-700 line-clamp-2" title={disposisi.tujuanDisposisi}>
                                {disposisi.tujuanDisposisi}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(disposisi.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-xs font-semibold text-white">
                                {disposisi.createdBy.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-slate-600">{disposisi.createdBy.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                href={`/dashboard/disposisi/${disposisi.id}`}
                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200"
                                title="Lihat Detail"
                              >
                                <Eye className="w-3 h-3 mr-1.5" />
                                <span>Detail</span>
                              </Link>
                              {session.user.role === 'ADMIN' && (
                                <>
                                  <Link
                                    href={`/dashboard/disposisi/edit/${disposisi.id}`}
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-medium rounded-lg border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 transition-all duration-200"
                                    title="Edit"
                                  >
                                    <Edit className="w-3 h-3 mr-1.5" />
                                    <span>Edit</span>
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(disposisi.id)}
                                    className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 text-xs font-medium rounded-lg border border-red-200 hover:from-red-100 hover:to-rose-100 hover:border-red-300 transition-all duration-200"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-3 h-3 mr-1.5" />
                                    <span>Hapus</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-gradient-to-r from-slate-50 to-emerald-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2.5 bg-white border border-slate-300 text-sm font-medium rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-4 py-2.5 bg-white border border-slate-300 text-sm font-medium rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                    >
                      Selanjutnya
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <p className="text-sm font-medium text-slate-600">
                        Menampilkan <span className="font-bold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> - <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari <span className="font-bold text-gray-900">{pagination.total}</span> disposisi
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={pagination.page === 1}
                        className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-300 text-sm font-medium rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Sebelumnya
                      </button>
                      <div className="flex items-center px-4 py-2.5 bg-white border-2 border-emerald-200 text-sm font-bold rounded-xl text-emerald-700 shadow-sm">
                        Halaman {pagination.page} dari {pagination.totalPages}
                      </div>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-300 text-sm font-medium rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                      >
                        Selanjutnya
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

