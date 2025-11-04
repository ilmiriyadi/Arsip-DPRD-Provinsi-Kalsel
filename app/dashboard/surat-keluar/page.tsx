'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  FileOutput, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface SuratKeluar {
  id: string
  noUrut: number
  klas: string
  pengolah: string
  tanggalSurat: string
  perihalSurat: string
  kirimKepada: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  suratMasuk?: {
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

const PENGOLAH_LABELS = {
  KETUA_DPRD: 'Ketua DPRD',
  WAKIL_KETUA_1: 'Wakil Ketua 1',
  WAKIL_KETUA_2: 'Wakil Ketua 2',
  WAKIL_KETUA_3: 'Wakil Ketua 3',
  SEKWAN: 'Sekwan'
}

export default function SuratKeluarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [suratList, setSuratList] = useState<SuratKeluar[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

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
      fetchSuratKeluar()
    }
  }, [session, pagination.page, debouncedSearchTerm, dateFilter, monthFilter])

  const fetchSuratKeluar = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
      if (dateFilter) params.append('tanggal', dateFilter)
      if (monthFilter) params.append('bulan', monthFilter)

      const response = await fetch(`/api/surat-keluar?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setSuratList(data.suratKeluar || data.data || [])
        setPagination(data.pagination)
      } else if (response.status === 404) {
        setSuratList([])
        setPagination({ total: 0, page: 1, limit: 10, totalPages: 0 })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Gagal mengambil data surat keluar')
      }
    } catch (error) {
      console.error('Error fetching surat keluar:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/surat-keluar/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSuratKeluar()
        alert('Surat berhasil dihapus')
      } else {
        alert('Gagal menghapus surat')
      }
    } catch (error) {
      console.error('Error deleting surat:', error)
      alert('Terjadi kesalahan sistem')
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <p className="text-slate-600 font-medium">Memuat...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileOutput className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-green-900 to-emerald-900 bg-clip-text text-transparent">
                    Surat Keluar
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 font-medium">
                    Kelola surat keluar dan dokumen resmi DPRD
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/dashboard/surat-keluar/add"
                    className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Surat Keluar
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filter */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-green-50 px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                  <Filter className="h-4 w-4 text-white" />
                </div>
                Pencarian & Filter Data
              </h3>
              <p className="text-sm text-slate-600 mt-1 ml-11">Gunakan fitur pencarian untuk menemukan dokumen dengan cepat</p>
            </div>
            <div className="p-6">
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      🔍 Pencarian Real-time
                    </label>
                    <div className="relative group">
                      <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${loading && searchTerm ? 'animate-spin text-green-500' : 'text-slate-400 group-focus-within:text-green-500'}`} />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm hover:shadow-md"
                        placeholder="Ketik untuk mencari klas, pengolah, atau perihal surat..."
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
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
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
                        className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex flex-wrap gap-2">
                    {(debouncedSearchTerm || dateFilter || monthFilter) && (
                      <div className="flex flex-wrap gap-2">
                        {debouncedSearchTerm && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Pencarian: &quot;{debouncedSearchTerm}&quot;
                          </span>
                        )}
                        {dateFilter && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            Tanggal: {formatDate(dateFilter)}
                          </span>
                        )}
                        {monthFilter && (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            Bulan: {new Date(monthFilter + '-01').toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {(debouncedSearchTerm || dateFilter || monthFilter) && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setDateFilter('')
                        setMonthFilter('')
                        setPagination(prev => ({ ...prev, page: 1 }))
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                    >
                      Hapus Semua Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Data Display */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-green-50 px-6 py-4 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                      <FileOutput className="h-4 w-4 text-white" />
                    </div>
                    Daftar Surat Keluar
                  </h3>
                  {pagination.total > 0 && (
                    <p className="text-sm text-slate-600">
                      Total {pagination.total} dokumen • Halaman {pagination.page} dari {pagination.totalPages}
                    </p>
                  )}
                </div>
              </div>
              {pagination.total > 0 && (
                <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Aktif</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent absolute top-0"></div>
                </div>
                <p className="mt-4 text-slate-600 font-medium">Memuat data surat keluar...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Terjadi Kesalahan</h3>
                <p className="text-red-600">{error}</p>
              </div>
            ) : suratList.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileOutput className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Belum Ada Surat Keluar</h3>
                <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                  Sistem siap digunakan. Mulai dengan menambahkan dokumen surat keluar pertama.
                </p>
                {session.user.role === 'ADMIN' && (
                  <Link
                    href="/dashboard/surat-keluar/add"
                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:shadow-xl"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Surat Keluar
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-green-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          <div className="flex items-center space-x-1">
                            <span>#</span>
                            <span>No Urut</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          📂 Klas
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          👤 Pengolah
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          📅 Tanggal Surat
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          📝 Perihal Surat
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          📤 Kirim Kepada
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          👤 Dibuat Oleh
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                          ⚙️ Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {suratList.map((surat, index) => (
                        <tr key={surat.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {surat.noUrut}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-medium">
                              {surat.klas}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-medium">
                              {PENGOLAH_LABELS[surat.pengolah as keyof typeof PENGOLAH_LABELS]}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-sm text-slate-600 font-medium">
                                {formatDate(surat.tanggalSurat)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-slate-700 max-w-xs truncate" title={surat.perihalSurat}>
                              {surat.perihalSurat}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-medium">
                              {surat.kirimKepada}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-slate-600">
                              {surat.createdBy.name}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                href={`/dashboard/surat-keluar/${surat.id}`}
                                className="text-green-600 hover:text-green-900 transition-colors duration-200 p-2 hover:bg-green-50 rounded-lg"
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              
                              {session.user.role === 'ADMIN' && (
                                <>
                                  <Link
                                    href={`/dashboard/surat-keluar/edit/${surat.id}`}
                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 hover:bg-blue-50 rounded-lg"
                                    title="Edit Surat"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  
                                  <button
                                    onClick={() => handleDelete(surat.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                                    title="Hapus Surat"
                                  >
                                    <Trash2 className="h-4 w-4" />
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-gradient-to-r from-slate-50 to-green-50 px-6 py-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1}
                          className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= pagination.totalPages}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-slate-700">
                            Menampilkan{' '}
                            <span className="font-medium">
                              {((pagination.page - 1) * pagination.limit) + 1}
                            </span>{' '}
                            sampai{' '}
                            <span className="font-medium">
                              {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            dari{' '}
                            <span className="font-medium">{pagination.total}</span> hasil
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => handlePageChange(pagination.page - 1)}
                              disabled={pagination.page <= 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Previous</span>
                              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(
                                pagination.totalPages - 4,
                                Math.max(1, pagination.page - 2)
                              )) + i
                              
                              if (pageNum > pagination.totalPages) return null
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    pagination.page === pageNum
                                      ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                      : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })}
                            
                            <button
                              onClick={() => handlePageChange(pagination.page + 1)}
                              disabled={pagination.page >= pagination.totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Next</span>
                              <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}