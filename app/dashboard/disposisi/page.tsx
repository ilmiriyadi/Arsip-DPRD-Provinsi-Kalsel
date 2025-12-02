'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { csrfFetch } from '@/lib/csrfFetch'
import { 
  ClipboardList, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
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
    nomorSurat: string | null
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

  const fetchDisposisi = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
      if (dateFilter) params.append('tanggal', dateFilter)
      if (monthFilter) params.append('bulan', monthFilter)


      const response = await csrfFetch(`/api/disposisi?${params}`)
      
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
  }, [pagination.page, pagination.limit, debouncedSearchTerm, dateFilter, monthFilter])

  useEffect(() => {
    if (session) {
      fetchDisposisi()
    }
  }, [session, fetchDisposisi])

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus disposisi ini?')) {
      return
    }

    try {
      const response = await csrfFetch(`/api/disposisi/${id}`, {
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
      const response = await csrfFetch('/api/disposisi/export')
      
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

  const getStatusBadge = () => {
    return (
      <span className="px-3 py-1.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="mr-1.5">✅</span>
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
            <p className="mt-4 text-[#737373] font-medium">Memuat disposisi...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) return null

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="civic-card civic-signature border-b border-[#E3E3E3]">
        <div className="mx-auto px-4 sm:px-6 lg:px-6">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#B82025] rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                  Disposisi
                </h1>
                <p className="mt-1 text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Sistem Manajemen Disposisi Surat
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="civic-btn-secondary px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Inter, sans-serif' }}
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
                  className="civic-btn-primary px-5 py-2.5 rounded-xl"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Disposisi
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

        <div className="mx-auto px-4 sm:px-6 lg:px-6 py-8">
          {/* Search and Filter */}
          <div className="civic-card mb-8 overflow-hidden">
            <div className="bg-[#F7F7F7] px-6 py-4 border-b border-[#E3E3E3]">
              <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center" style={{ fontFamily: 'Merriweather, serif' }}>
                <div className="w-8 h-8 bg-[#B82025] rounded-lg flex items-center justify-center mr-3">
                <Filter className="h-4 w-4 text-white" />
              </div>
              Pencarian & Filter Data
            </h3>
            <p className="text-sm text-[#737373] mt-1 ml-11" style={{ fontFamily: 'Inter, sans-serif' }}>Gunakan fitur pencarian untuk menemukan disposisi dengan cepat</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Pencarian Real-time
                    </label>
                    <div className="relative group">
                      <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="civic-input w-full px-4 py-3.5"
                      placeholder="Ketik untuk mencari tujuan, isi disposisi, atau nomor surat..."
                      style={{ fontFamily: 'Inter, sans-serif' }}
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
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                      📅 Filter Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border border-[#E3E3E3]-300 rounded-xl bg-[#F7F7F7] focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-[#1A1A1A] shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
                      🗓️ Filter Bulan
                    </label>
                    <input
                      type="month"
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border border-[#E3E3E3]-300 rounded-xl bg-[#F7F7F7] focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-[#1A1A1A] shadow-sm hover:shadow-md"
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
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#B82025]/20 text-[#B82025] border border-[#B82025]/30">
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
        <div className="bg-white shadow-xl rounded-2xl border border-[#E3E3E3]-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#F7F7F7] to-white px-6 py-5 border-b border-[#E3E3E3]-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#B82025]-500 #B82025] rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Daftar Disposisi
                  </h3>
                  {pagination.total > 0 && (
                    <p className="text-sm text-[#737373]">
                      Total {pagination.total} disposisi • Halaman {pagination.page} dari {pagination.totalPages}
                    </p>
                  )}
                </div>
              </div>
              {pagination.total > 0 && (
                <div className="hidden sm:flex items-center space-x-2 text-xs text-[#737373] bg-white px-3 py-1.5 rounded-lg border border-[#E3E3E3]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <span className="w-2 h-2 bg-[#B82025] rounded-full"></span>
                  <span>Aktif</span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#E3E3E3]"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#B82025] border-t-transparent absolute top-0"></div>
              </div>
              <p className="mt-4 text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Memuat data disposisi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Terjadi Kesalahan</h3>
              <p className="text-red-600">{error}</p>
            </div>
          ) : disposisiList.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="h-8 w-8 text-[#737373]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Merriweather, serif' }}>Belum Ada Disposisi</h3>
              <p className="text-[#737373] mb-6 max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sistem siap digunakan. Mulai dengan menambahkan disposisi pertama.
              </p>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/disposisi/add"
                  className="civic-btn-primary px-6 py-3 rounded-xl"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Disposisi
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-[#F7F7F7]">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                          <div className="flex items-center space-x-1">
                            <span>#</span>
                            <span>No Urut</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                          Surat Masuk
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                          Tanggal
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                          Tujuan
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                          Dibuat Oleh
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#E3E3E3]">
                      {disposisiList.map((disposisi) => (
                        <tr key={disposisi.id} className="hover:bg-white hover:border-l-4 hover:border-[#B82025] civic-transition group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-[#B82025] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {disposisi.noUrut}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="max-w-xs">
                              <div className="text-sm font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {disposisi.suratMasuk.nomorSurat || '-'}
                              </div>
                              <div className="text-sm text-[#737373] line-clamp-2" title={disposisi.suratMasuk.perihal} style={{ fontFamily: 'Inter, sans-serif' }}>
                                {disposisi.suratMasuk.perihal}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-[#B82025] rounded-full"></div>
                              <span className="text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {formatDate(disposisi.tanggalDisposisi)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-[#1A1A1A] max-w-xs truncate" title={disposisi.tujuanDisposisi} style={{ fontFamily: 'Inter, sans-serif' }}>
                              {disposisi.tujuanDisposisi}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            {getStatusBadge()}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {disposisi.createdBy.name}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-3">
                              <Link
                                href={`/dashboard/disposisi/${disposisi.id}`}
                                className="text-[#1A1A1A] hover:text-[#B82025] civic-transition p-2 hover:bg-[#F7F7F7] rounded-lg"
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              
                              {session.user.role === 'ADMIN' && (
                                <>
                                  <Link
                                    href={`/dashboard/disposisi/edit/${disposisi.id}`}
                                    className="text-[#C8A348] hover:text-[#1A1A1A] civic-transition p-2 hover:bg-[#F7F7F7] rounded-lg"
                                    title="Edit Disposisi"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                  
                                  <button
                                    onClick={() => handleDelete(disposisi.id)}
                                    className="text-[#B82025] hover:text-[#1A1A1A] civic-transition p-2 hover:bg-red-50 rounded-lg"
                                    title="Hapus Disposisi"
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
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-[#F7F7F7] px-6 py-4 border-t border-[#E3E3E3]">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="civic-btn-secondary px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="ml-3 civic-btn-secondary px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Selanjutnya
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Menampilkan{' '}
                        <span className="font-medium text-[#1A1A1A]">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{' '}
                        sampai{' '}
                        <span className="font-medium text-[#1A1A1A]">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        dari{' '}
                        <span className="font-medium text-[#1A1A1A]">{pagination.total}</span> hasil
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#E3E3E3] bg-white text-sm font-medium text-[#737373] hover:border-[#B82025] hover:text-[#B82025] civic-transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                              onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium civic-transition ${
                                pagination.page === pageNum
                                  ? 'z-10 bg-[#B82025] border-[#B82025] text-white'
                                  : 'bg-white border-[#E3E3E3] text-[#737373] hover:border-[#B82025] hover:text-[#B82025]'
                              }`}
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                        
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#E3E3E3] bg-white text-sm font-medium text-[#737373] hover:border-[#B82025] hover:text-[#B82025] civic-transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
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

