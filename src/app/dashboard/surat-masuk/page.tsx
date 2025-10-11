'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileOutput,
  Copy,
  CheckCircle
} from 'lucide-react'

interface SuratMasuk {
  id: string
  noUrut: number
  nomorSurat: string
  tanggalSurat: string
  asalSurat: string
  perihal: string
  keterangan?: string
  filePath?: string
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
  disposisi: {
    id: string
    noUrut: number
    status: 'SELESAI'
  }[]
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function SuratMasukPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [suratList, setSuratList] = useState<SuratMasuk[]>([])
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
  
  // Modal states
  const [showTujuanModal, setShowTujuanModal] = useState(false)
  const [selectedSurat, setSelectedSurat] = useState<{ id: string, nomorSurat: string } | null>(null)
  const [selectedTujuan, setSelectedTujuan] = useState('')
  const [customTujuan, setCustomTujuan] = useState('')

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
      fetchSuratMasuk()
    }
  }, [session, pagination.page, debouncedSearchTerm, dateFilter, monthFilter])

  const fetchSuratMasuk = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)
      if (dateFilter) params.append('tanggal', dateFilter)
      if (monthFilter) params.append('bulan', monthFilter)

      const response = await fetch(`/api/surat-masuk?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setSuratList(data.suratMasuk || [])
        setPagination(data.pagination)
      } else {
        setError('Gagal mengambil data surat masuk')
      }
    } catch (error) {
      console.error('Error fetching surat masuk:', error)
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
      const response = await fetch(`/api/surat-masuk/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchSuratMasuk()
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

  const getDisposisiStatus = (disposisi: SuratMasuk['disposisi']) => {
    if (!disposisi || disposisi.length === 0) {
      return { 
        status: 'BELUM_ADA',
        text: 'Belum Disposisi',
        color: 'bg-gray-100 text-gray-800',
        icon: '⏳'
      }
    }

    return {
      status: 'SELESAI',
      text: 'Sudah Disposisi',
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      count: disposisi.length
    }
  }

  const tujuanOptions = [
    'Pimpinan DPRD',
    'SEKWAN',
    'RTA',
    'Persidangan', 
    'Keuangan',
    'Fraksi'
  ]

  const handleCopyToDisposisi = (suratId: string, nomorSurat: string) => {
    setSelectedSurat({ id: suratId, nomorSurat })
    setSelectedTujuan('')
    setCustomTujuan('')
    setShowTujuanModal(true)
  }

  const handleConfirmCopy = async () => {
    if (!selectedSurat) return

    const tujuan = selectedTujuan === 'custom' ? customTujuan : selectedTujuan
    
    if (!tujuan.trim()) {
      alert('Silakan pilih atau masukkan tujuan disposisi')
      return
    }

    try {
      const response = await fetch(`/api/surat-masuk/${selectedSurat.id}/copy-disposisi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tujuanDisposisi: tujuan.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Surat berhasil disalin ke disposisi!')
        setShowTujuanModal(false)
        setSelectedSurat(null)
        fetchSuratMasuk() // Refresh data
      } else {
        alert(data.error || 'Gagal menyalin surat ke disposisi')
      }
    } catch (error) {
      console.error('Error copying to disposisi:', error)
      alert('Terjadi kesalahan sistem')
    }
  }

  const handleCancelCopy = () => {
    setShowTujuanModal(false)
    setSelectedSurat(null)
    setSelectedTujuan('')
    setCustomTujuan('')
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  Surat Masuk
                </h1>
                <p className="mt-1 text-sm text-slate-600 font-medium">
                  Sistem Manajemen Arsip Dokumen Resmi
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/surat-masuk/add"
                  className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Surat
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
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
                    <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${loading && searchTerm ? 'animate-spin text-blue-500' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm hover:shadow-md"
                      placeholder="Ketik untuk mencari nomor surat, asal, atau perihal..."
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
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
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
                      className="w-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                  {(debouncedSearchTerm || dateFilter || monthFilter) && (
                    <>
                      {debouncedSearchTerm && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          🔍 "{debouncedSearchTerm}"
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
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Daftar Surat Masuk
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
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
              </div>
              <p className="mt-4 text-slate-600 font-medium">Memuat data surat masuk...</p>
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
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Belum Ada Surat Masuk</h3>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                Sistem siap digunakan. Mulai dengan menambahkan dokumen surat masuk pertama.
              </p>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/surat-masuk/add"
                  className="inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Surat Masuk
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        <div className="flex items-center space-x-1">
                          <span>#</span>
                          <span>No Urut</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        📄 Nomor Surat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        📅 Tanggal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        🏢 Asal Surat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        📝 Perihal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        📊 Status Disposisi
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
                      <tr key={surat.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {surat.noUrut}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {surat.nomorSurat}
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
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-slate-900 font-medium">
                            {surat.asalSurat}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-slate-700 max-w-xs truncate" title={surat.perihal}>
                            {surat.perihal}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {(() => {
                            const disposisiStatus = getDisposisiStatus(surat.disposisi)
                            return (
                              <div className="flex flex-col space-y-1">
                                <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full shadow-sm ${
                                  disposisiStatus.status === 'SELESAI' 
                                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200'
                                }`}>
                                  <span className="mr-1.5">{disposisiStatus.icon}</span>
                                  {disposisiStatus.text}
                                </span>
                                {disposisiStatus.count && disposisiStatus.count > 0 && (
                                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 w-fit">
                                    {disposisiStatus.count} dokumen
                                  </span>
                                )}
                              </div>
                            )
                          })()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {surat.createdBy.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-600 font-medium">{surat.createdBy.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-1">
                            <Link
                              href={`/dashboard/surat-masuk/${surat.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {session.user.role === 'ADMIN' && (
                              <>
                                {surat.disposisi.length === 0 ? (
                                  <button
                                    onClick={() => handleCopyToDisposisi(surat.id, surat.nomorSurat)}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                    title="Salin ke Disposisi"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <Link
                                    href={`/dashboard/disposisi/add?suratId=${surat.id}`}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                    title="Tambah Disposisi Baru"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Link>
                                )}
                                <Link
                                  href={`/dashboard/surat-masuk/edit/${surat.id}`}
                                  className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(surat.id)}
                                  className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                  title="Hapus"
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
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5 flex items-center justify-between border-t border-slate-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-5 py-2.5 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-5 py-2.5 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                    >
                      Next →
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <p className="text-sm font-medium text-slate-700">
                        Menampilkan{' '}
                        <span className="font-bold text-blue-700">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{' '}
                        -{' '}
                        <span className="font-bold text-blue-700">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        dari{' '}
                        <span className="font-bold text-blue-700">{pagination.total}</span> dokumen
                      </p>
                    </div>
                    <div>
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                          disabled={pagination.page === 1}
                          className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all duration-200"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-1">
                          <span className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg">
                            {pagination.page}
                          </span>
                          <span className="text-slate-500 font-medium">dari</span>
                          <span className="px-3 py-2 bg-white border border-slate-300 text-slate-600 text-sm font-medium rounded-lg">
                            {pagination.totalPages}
                          </span>
                        </div>
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                          disabled={pagination.page === pagination.totalPages}
                          className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-300 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all duration-200"
                        >
                          <ChevronRight className="h-5 w-5" />
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

      {/* Modal Pilih Tujuan Disposisi */}
      {showTujuanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Pilih Tujuan Disposisi
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Surat: <span className="font-medium">{selectedSurat?.nomorSurat}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  🎯 Pilih Tujuan Disposisi
                </label>
                <div className="space-y-3">
                  {tujuanOptions.map((option) => (
                    <label key={option} className="flex items-center p-3 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                      <input
                        type="radio"
                        name="tujuan"
                        value={option}
                        checked={selectedTujuan === option}
                        onChange={(e) => setSelectedTujuan(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-blue-700">{option}</span>
                    </label>
                  ))}
                  <label className="flex items-center p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                    <input
                      type="radio"
                      name="tujuan"
                      value="custom"
                      checked={selectedTujuan === 'custom'}
                      onChange={(e) => setSelectedTujuan(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-blue-700">✏️ Lainnya (ketik sendiri)</span>
                  </label>
                </div>
              </div>

              {selectedTujuan === 'custom' && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label htmlFor="customTujuan" className="block text-sm font-semibold text-gray-900 mb-3">
                    📝 Tujuan Custom
                  </label>
                  <input
                    type="text"
                    id="customTujuan"
                    value={customTujuan}
                    onChange={(e) => setCustomTujuan(e.target.value)}
                    placeholder="Masukkan tujuan disposisi..."
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelCopy}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                ❌ Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCopy}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Buat Disposisi
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

