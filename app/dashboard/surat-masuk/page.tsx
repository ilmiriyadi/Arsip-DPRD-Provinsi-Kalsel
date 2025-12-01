'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { csrfFetch } from '@/lib/csrfFetch'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Copy,
  Send,
  ChevronDown
} from 'lucide-react'

interface SuratMasuk {
  id: string
  noUrut: number
  nomorSurat: string | null
  tanggalSurat: string
  tanggalDiteruskan: string
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
  _count?: {
    disposisi: number
    suratKeluar: number
  }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

type SearchField = 'noUrut' | 'nomorSurat' | 'asalSurat' | 'perihal'

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
  const [searchField, setSearchField] = useState<SearchField>('noUrut')
  const [dateFilter, setDateFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  
  // Modal states
  const [showTujuanModal, setShowTujuanModal] = useState(false)
  const [selectedSurat, setSelectedSurat] = useState<{ id: string, nomorSurat: string } | null>(null)
  const [selectedTujuan, setSelectedTujuan] = useState('')
  const [selectedSubBagian, setSelectedSubBagian] = useState('')
  const [keteranganDisposisi, setKeteranganDisposisi] = useState('')
  const [tanggalDisposisi, setTanggalDisposisi] = useState('')

  // Modal Surat Keluar states
  const [showSuratKeluarModal, setShowSuratKeluarModal] = useState(false)
  const [selectedSuratForKeluar, setSelectedSuratForKeluar] = useState<SuratMasuk | null>(null)
  const [noUrutKeluar, setNoUrutKeluar] = useState('')
  const [klaSurat, setKlasSurat] = useState('')
  const [pengolahSurat, setPengolahSurat] = useState('')
  const [kirimKepada, setKirimKepada] = useState('')

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

  const fetchSuratMasuk = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm)
        params.append('searchField', searchField)
      }
      if (dateFilter) params.append('tanggal', dateFilter)
      if (monthFilter) params.append('bulan', monthFilter)

      const response = await csrfFetch(`/api/surat-masuk?${params}`)
      
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
  }, [pagination.page, pagination.limit, debouncedSearchTerm, searchField, dateFilter, monthFilter])

  useEffect(() => {
    if (session) {
      fetchSuratMasuk()
    }
  }, [session, fetchSuratMasuk])

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
      return
    }

    try {
      const response = await csrfFetch(`/api/surat-masuk/${id}`, {
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

  const getDisposisiStatus = (surat: SuratMasuk) => {
    const disposisiCount = surat._count?.disposisi || 0
    
    if (disposisiCount === 0) {
      return { 
        status: 'BELUM_ADA',
        text: 'Belum Disposisi',
        color: 'bg-gray-100 text-gray-800',
        icon: '⏳'
      }
    }

    return {
      status: 'SELESAI',
      text: `${disposisiCount} Disposisi`,
      color: 'bg-green-100 text-green-800',
      icon: '✅',
    }
  }

  const tujuanOptions = [
    'Ketua DPRD',
    'Wakil',
    'Ketua Komisi',
    'Anggota Dewan',
    'SEKWAN',
    'Bagian Persidangan dan Perundang-Undangan',
    'Bagian Fasilitasi Penganggaran dan Pengawasan',
    'Bagian Umum dan Keuangan',
    'Staff'
  ]

  const subBagianOptions: Record<string, string[]> = {
    'Wakil': [
      'Wakil I',
      'Wakil II',
      'Wakil III'
    ],
    'Ketua Komisi': [
      'Ketua Komisi I',
      'Ketua Komisi II',
      'Ketua Komisi III',
      'Ketua Komisi IV'
    ],
    'Bagian Persidangan dan Perundang-Undangan': [
      'Sub Bagian Kajian Perundang-Undangan',
      'Sub Bagian Persidangan dan Risalah',
      'Sub Bagian Humas, Protokol dan Publikasi'
    ],
    'Bagian Fasilitasi Penganggaran dan Pengawasan': [
      'Sub Bagian Fasilitasi dan Penganggaran',
      'Sub Bagian Fasilitasi Pengawasan',
      'Sub Bagian Kerjasama dan Aspirasi'
    ],
    'Bagian Umum dan Keuangan': [
      'Sub Bagian Perencanaan dan Keuangan',
      'Sub Bagian Tata Usaha dan Kepegawaian',
      'Sub Bagian Rumah Tangga & Aset'
    ]
  }

  const pengolahOptions = [
    { value: 'KETUA_DPRD', label: 'Ketua DPRD' },
    { value: 'WAKIL_KETUA_1', label: 'Wakil Ketua 1' },
    { value: 'WAKIL_KETUA_2', label: 'Wakil Ketua 2' },
    { value: 'WAKIL_KETUA_3', label: 'Wakil Ketua 3' },
    { value: 'SEKWAN', label: 'Sekwan' }
  ]

  const handleCopyToDisposisi = (suratId: string, nomorSurat: string | null) => {
    setSelectedSurat({ id: suratId, nomorSurat: nomorSurat || '-' })
    setSelectedTujuan('')
    setSelectedSubBagian('')
    setKeteranganDisposisi('')
    setTanggalDisposisi('')
    setShowTujuanModal(true)
  }

  const handleCreateSuratKeluar = (surat: SuratMasuk) => {
    setSelectedSuratForKeluar(surat)
    setNoUrutKeluar('')
    setKlasSurat('')
    setPengolahSurat('')
    setKirimKepada('')
    setShowSuratKeluarModal(true)
  }

  const handleConfirmCopy = async () => {
    if (!selectedSurat) return

    if (!selectedTujuan.trim()) {
      alert('Silakan pilih tujuan disposisi')
      return
    }

    if (!tanggalDisposisi.trim()) {
      alert('Silakan pilih tanggal disposisi')
      return
    }

    // Set finalTujuan: jika ada sub bagian dipilih gunakan format "Bagian - Sub Bagian", jika tidak gunakan nama bagian saja
    const finalTujuan = selectedSubBagian 
      ? `${selectedTujuan} - ${selectedSubBagian}`
      : selectedTujuan

    try {
      const response = await csrfFetch(`/api/surat-masuk/${selectedSurat.id}/copy-disposisi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tujuanDisposisi: finalTujuan.trim(),
          tanggalDisposisi: tanggalDisposisi,
          keterangan: keteranganDisposisi.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Surat berhasil disalin ke disposisi!')
        setShowTujuanModal(false)
        setSelectedSurat(null)
        setSelectedTujuan('')
        setSelectedSubBagian('')
        setKeteranganDisposisi('')
        setTanggalDisposisi('')
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
    setSelectedSubBagian('')
    setKeteranganDisposisi('')
    setTanggalDisposisi('')
  }

  const handleConfirmSuratKeluar = async () => {
    if (!selectedSuratForKeluar || !noUrutKeluar || !klaSurat || !pengolahSurat || !kirimKepada) {
      alert('Harap lengkapi semua field yang wajib diisi')
      return
    }

    try {
      const response = await csrfFetch('/api/surat-keluar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noUrut: parseInt(noUrutKeluar),
          klas: klaSurat,
          pengolah: pengolahSurat,
          tanggalSurat: selectedSuratForKeluar.tanggalSurat,
          perihalSurat: selectedSuratForKeluar.perihal,
          kirimKepada: kirimKepada,
          suratMasukId: selectedSuratForKeluar.id
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('Surat keluar berhasil dibuat!')
        setShowSuratKeluarModal(false)
        setSelectedSuratForKeluar(null)
        setNoUrutKeluar('')
        setKlasSurat('')
        setPengolahSurat('')
        setKirimKepada('')
      } else {
        alert(data.error || 'Gagal membuat surat keluar')
      }
    } catch (error) {
      console.error('Error creating surat keluar:', error)
      alert('Terjadi kesalahan sistem')
    }
  }

  const handleCancelSuratKeluar = () => {
    setShowSuratKeluarModal(false)
    setSelectedSuratForKeluar(null)
    setNoUrutKeluar('')
    setKlasSurat('')
    setPengolahSurat('')
    setKirimKepada('')
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
              <button
                onClick={async () => {
                  try {
                    const response = await csrfFetch('/api/surat-masuk/export')
                    if (response.ok) {
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `Surat-Masuk-${new Date().toISOString().split('T')[0]}.xlsx`
                      document.body.appendChild(a)
                      a.click()
                      window.URL.revokeObjectURL(url)
                      document.body.removeChild(a)
                    } else {
                      alert('Gagal mengekspor data')
                    }
                  } catch (error) {
                    console.error('Error exporting:', error)
                    alert('Terjadi kesalahan saat mengekspor data')
                  }
                }}
                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:shadow-xl"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </button>
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
                  <div className="flex gap-3">
                    {/* Dropdown Filter */}
                    <div className="relative">
                      <select
                        value={searchField}
                        onChange={(e) => {
                          setSearchField(e.target.value as SearchField)
                          setSearchTerm('') // Reset search saat ganti field
                        }}
                        className="h-full px-4 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 shadow-sm hover:shadow-md appearance-none pr-10 cursor-pointer font-medium"
                      >
                        <option value="noUrut">No Urut</option>
                        <option value="nomorSurat">No Surat</option>
                        <option value="asalSurat">Asal Surat</option>
                        <option value="perihal">Perihal</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    
                    {/* Search Input */}
                    <div className="relative group flex-1">
                      <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${loading && searchTerm ? 'animate-spin text-blue-500' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
                      <input
                        type={searchField === 'noUrut' ? 'number' : 'text'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-slate-700 placeholder-slate-400 shadow-sm hover:shadow-md"
                        placeholder={
                          searchField === 'noUrut' ? 'Ketik nomor urut surat...' :
                          searchField === 'nomorSurat' ? 'Ketik nomor surat...' :
                          searchField === 'asalSurat' ? 'Ketik asal surat...' :
                          'Ketik perihal surat...'
                        }
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
                        📅 Tanggal Surat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                        📤 Tanggal Diteruskan
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
                    {suratList.map((surat) => (
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
                            {surat.nomorSurat || '-'}
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
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span className="text-sm text-slate-600 font-medium">
                              {formatDate(surat.tanggalDiteruskan)}
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
                            const disposisiStatus = getDisposisiStatus(surat)
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
                                {(surat._count?.disposisi || 0) === 0 ? (
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
                                {(surat._count?.suratKeluar || 0) === 0 ? (
                                  <button
                                    onClick={() => handleCreateSuratKeluar(surat)}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                    title="Buat Surat Keluar"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCreateSuratKeluar(surat)}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                    title="Tambah Surat Keluar Baru"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
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
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
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
                    Surat: <span className="font-medium">{selectedSurat?.nomorSurat || '-'}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  🎯 Pilih Bagian Tujuan
                </label>
                <div className="space-y-2">
                  {tujuanOptions.map((option) => (
                    <label key={option} className="flex items-center p-2.5 rounded-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                      <input
                        type="radio"
                        name="tujuan"
                        value={option}
                        checked={selectedTujuan === option}
                        onChange={(e) => {
                          setSelectedTujuan(e.target.value)
                          setSelectedSubBagian('') // Reset sub bagian when changing main bagian
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-blue-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedTujuan && subBagianOptions[selectedTujuan as keyof typeof subBagianOptions] && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    📋 Pilih Sub Bagian
                  </label>
                  <div className="space-y-1.5">
                    {subBagianOptions[selectedTujuan as keyof typeof subBagianOptions].map((subOption) => (
                      <label key={subOption} className="flex items-center p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                        <input
                          type="radio"
                          name="subBagian"
                          value={subOption}
                          checked={selectedSubBagian === subOption}
                          onChange={(e) => setSelectedSubBagian(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="ml-3 text-xs font-medium text-slate-600 group-hover:text-blue-700">{subOption}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  📝 Keterangan Disposisi
                </label>
                <textarea
                  value={keteranganDisposisi}
                  onChange={(e) => setKeteranganDisposisi(e.target.value)}
                  placeholder="Masukkan keterangan disposisi..."
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700 placeholder-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  📅 Tanggal Disposisi
                </label>
                <input
                  type="date"
                  value={tanggalDisposisi}
                  onChange={(e) => setTanggalDisposisi(e.target.value)}
                  required
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-slate-700"
                />
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelCopy}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                ❌ Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCopy}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Buat Disposisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Surat Keluar */}
      {showSuratKeluarModal && selectedSuratForKeluar && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Buat Surat Keluar
                  </h3>
                  <p className="text-green-100 text-sm">
                    Dari: <span className="font-medium">{selectedSuratForKeluar.nomorSurat || '-'}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  📄 Nomor Urut Surat Keluar
                </label>
                <input
                  type="number"
                  value={noUrutKeluar}
                  onChange={(e) => setNoUrutKeluar(e.target.value)}
                  placeholder="Contoh: 1, 2, 3..."
                  min="1"
                  required
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  📂 Klas Surat
                </label>
                <input
                  type="text"
                  value={klaSurat}
                  onChange={(e) => setKlasSurat(e.target.value)}
                  placeholder="Contoh: 001/DPRD/XI/2024"
                  required
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  👤 Pengolah Surat
                </label>
                <div className="space-y-2">
                  {pengolahOptions.map((option) => (
                    <label key={option.value} className="flex items-center p-2.5 rounded-lg border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 cursor-pointer group">
                      <input
                        type="radio"
                        name="pengolah"
                        value={option.value}
                        checked={pengolahSurat === option.value}
                        onChange={(e) => setPengolahSurat(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300"
                      />
                      <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-green-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  📤 Kirim Kepada
                </label>
                <input
                  type="text"
                  value={kirimKepada}
                  onChange={(e) => setKirimKepada(e.target.value)}
                  placeholder="Contoh: Dinas Pendidikan Provinsi Kalimantan Selatan"
                  required
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-slate-700 placeholder-slate-400"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">📋 Data Otomatis (dari Surat Masuk):</h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <p><strong>Tanggal Surat:</strong> {new Date(selectedSuratForKeluar.tanggalSurat).toLocaleDateString('id-ID')}</p>
                  <p><strong>Perihal Surat:</strong> {selectedSuratForKeluar.perihal}</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelSuratKeluar}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                ❌ Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSuratKeluar}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 border border-transparent rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                ✅ Buat Surat Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

