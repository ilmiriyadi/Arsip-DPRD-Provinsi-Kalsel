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
      router.push('/arsip/login')
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
        color: 'bg-[#E3E3E3] text-[#737373]',
        icon: '⏳'
      }
    }

    return {
      status: 'SELESAI',
      text: `${disposisiCount} Disposisi`,
      color: 'civic-badge-gold',
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
      <div className="bg-white shadow-lg border-b border-[#E3E3E3] civic-signature">
        <div className="mx-auto px-4 sm:px-6 lg:px-6">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-[#B82025] rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                  Surat Masuk
                </h1>
                <p className="mt-1 text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                className="civic-btn-primary inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/surat-masuk/add"
                  className="civic-btn-primary inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Surat
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-6 py-8">
        {/* Search and Filter */}
        <div className="civic-card bg-white rounded-2xl shadow-xl border border-[#E3E3E3] mb-8 overflow-hidden">
          <div className="bg-[#F7F7F7] px-6 py-4 border-b border-[#E3E3E3]">
            <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center" style={{ fontFamily: 'Merriweather, serif' }}>
              <div className="w-8 h-8 bg-[#B82025] rounded-lg flex items-center justify-center mr-3">
                <Filter className="h-4 w-4 text-white" />
              </div>
              Pencarian & Filter Data
            </h3>
            <p className="text-sm text-[#737373] mt-1 ml-11" style={{ fontFamily: 'Inter, sans-serif' }}>Gunakan fitur pencarian untuk menemukan dokumen dengan cepat</p>
          </div>
          <div className="p-6">
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Pencarian Real-time
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
                        className="civic-input h-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md appearance-none pr-10 cursor-pointer font-medium"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="noUrut">No Urut</option>
                        <option value="nomorSurat">No Surat</option>
                        <option value="asalSurat">Asal Surat</option>
                        <option value="perihal">Perihal</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    
                    {/* Search Input */}
                    <div className="flex-1">
                      <input
                        type={searchField === 'noUrut' ? 'number' : 'text'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] placeholder-[#737373] shadow-sm hover:shadow-md"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        placeholder={
                          searchField === 'noUrut' ? 'Ketik nomor urut surat...' :
                          searchField === 'nomorSurat' ? 'Ketik nomor surat...' :
                          searchField === 'asalSurat' ? 'Ketik asal surat...' :
                          'Ketik perihal surat...'
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Filter Tanggal
                    </label>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Filter Bulan
                    </label>
                    <input
                      type="month"
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="civic-input w-full px-4 py-3.5 border border-[#E3E3E3] rounded-xl bg-white focus:ring-2 focus:ring-[#B82025] focus:border-transparent civic-transition text-[#1A1A1A] shadow-sm hover:shadow-md"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex flex-wrap gap-2">
                  {(debouncedSearchTerm || dateFilter || monthFilter) && (
                    <>
                      {debouncedSearchTerm && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#B82025] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          &quot;{debouncedSearchTerm}&quot;
                        </span>
                      )}
                      {dateFilter && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1A1A] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {formatDate(dateFilter)}
                        </span>
                      )}
                      {monthFilter && (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1A1A] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {monthFilter}
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
                    className="civic-btn-secondary inline-flex items-center px-4 py-2.5 text-[#B82025] text-sm font-medium rounded-xl civic-transition shadow-lg hover:shadow-xl"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="civic-card bg-white shadow-xl rounded-2xl border border-[#E3E3E3] overflow-hidden">
          <div className="bg-[#F7F7F7] px-6 py-5 border-b border-[#E3E3E3]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#B82025] rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A]" style={{ fontFamily: 'Merriweather, serif' }}>
                    Daftar Surat Masuk
                  </h3>
                  {pagination.total > 0 && (
                    <p className="text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Total {pagination.total} dokumen • Halaman {pagination.page} dari {pagination.totalPages}
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
              <p className="mt-4 text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Memuat data surat masuk...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❌</span>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2" style={{ fontFamily: 'Merriweather, serif' }}>Terjadi Kesalahan</h3>
              <p className="text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>{error}</p>
            </div>
          ) : suratList.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-[#F7F7F7] rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-[#737373]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Merriweather, serif' }}>Belum Ada Surat Masuk</h3>
              <p className="text-[#737373] mb-6 max-w-sm mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
                Sistem siap digunakan. Mulai dengan menambahkan dokumen surat masuk pertama.
              </p>
              {session.user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/surat-masuk/add"
                  className="civic-btn-primary inline-flex items-center px-6 py-3 border border-transparent shadow-lg text-sm font-medium rounded-xl text-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Surat Masuk
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#E3E3E3]">
                  <thead className="bg-[#F7F7F7]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        <div className="flex items-center space-x-1">
                          <span>#</span>
                          <span>No Urut</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Nomor Surat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Tanggal Surat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Tanggal Diteruskan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Asal Surat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Perihal
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Status Disposisi
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Dibuat Oleh
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-[#1A1A1A] uppercase tracking-wider border-b border-[#E3E3E3]" style={{ fontFamily: 'Merriweather, serif' }}>
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E3E3E3]">
                    {suratList.map((surat) => (
                      <tr key={surat.id} className="hover:bg-white hover:border-l-4 hover:border-[#B82025] civic-transition group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#B82025] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                              {surat.noUrut}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[#1A1A1A] group-hover:text-[#B82025] civic-transition" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {surat.nomorSurat || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-[#B82025] rounded-full"></div>
                            <span className="text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {formatDate(surat.tanggalSurat)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-[#1A1A1A] rounded-full"></div>
                            <span className="text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {formatDate(surat.tanggalDiteruskan)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-[#1A1A1A] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {surat.asalSurat}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-[#1A1A1A] max-w-xs truncate" title={surat.perihal} style={{ fontFamily: 'Inter, sans-serif' }}>
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
                                    ? 'civic-badge-gold' 
                                    : 'bg-[#E3E3E3] text-[#737373]'
                                }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                                  <span className="mr-1.5">{disposisiStatus.icon}</span>
                                  {disposisiStatus.text}
                                </span>
                              </div>
                            )
                          })()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 bg-[#B82025] rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {surat.createdBy.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{surat.createdBy.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-1">
                            <Link
                              href={`/dashboard/surat-masuk/${surat.id}`}
                              className="inline-flex items-center justify-center w-8 h-8 bg-white border-2 border-[#E3E3E3] text-[#1A1A1A] hover:border-[#B82025] rounded-lg civic-transition shadow-sm hover:shadow-md"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            {session.user.role === 'ADMIN' && (
                              <>
                                {(surat._count?.disposisi || 0) === 0 ? (
                                  <button
                                    onClick={() => handleCopyToDisposisi(surat.id, surat.nomorSurat)}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-[#B82025] text-white hover:bg-[#1A1A1A] rounded-lg civic-transition shadow-sm hover:shadow-md"
                                    title="Salin ke Disposisi"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <Link
                                    href={`/dashboard/disposisi/add?suratId=${surat.id}`}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-[#B82025] text-white hover:bg-[#1A1A1A] rounded-lg civic-transition shadow-sm hover:shadow-md"
                                    title="Tambah Disposisi Baru"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Link>
                                )}
                                {(surat._count?.suratKeluar || 0) === 0 ? (
                                  <button
                                    onClick={() => handleCreateSuratKeluar(surat)}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-[#B82025] text-white hover:bg-[#1A1A1A] rounded-lg civic-transition shadow-sm hover:shadow-md"
                                    title="Buat Surat Keluar"
                                  >
                                    <Send className="h-4 w-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleCreateSuratKeluar(surat)}
                                    className="inline-flex items-center justify-center w-8 h-8 bg-[#B82025] text-white hover:bg-[#1A1A1A] rounded-lg civic-transition shadow-sm hover:shadow-md"
                                    title="Tambah Surat Keluar Baru"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                )}
                                <Link
                                  href={`/dashboard/surat-masuk/edit/${surat.id}`}
                                  className="inline-flex items-center justify-center w-8 h-8 bg-[#C8A348] text-white hover:bg-[#1A1A1A] rounded-lg civic-transition shadow-sm hover:shadow-md"
                                  title="Edit"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => handleDelete(surat.id)}
                                  className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg civic-transition shadow-sm hover:shadow-md"
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
                <div className="bg-[#F7F7F7] px-6 py-5 flex items-center justify-between border-t border-[#E3E3E3]">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-5 py-2.5 border border-[#E3E3E3] text-sm font-medium rounded-xl text-[#1A1A1A] bg-white hover:bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm civic-transition"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-5 py-2.5 border border-[#E3E3E3] text-sm font-medium rounded-xl text-[#1A1A1A] bg-white hover:bg-[#F7F7F7] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm civic-transition"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Next →
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#B82025] rounded-full"></div>
                      <p className="text-sm font-medium text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Menampilkan{' '}
                        <span className="font-bold text-[#B82025]">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{' '}
                        -{' '}
                        <span className="font-bold text-[#B82025]">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>{' '}
                        dari{' '}
                        <span className="font-bold text-[#B82025]">{pagination.total}</span> dokumen
                      </p>
                    </div>
                    <div>
                      <nav className="flex items-center space-x-2">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                          disabled={pagination.page === 1}
                          className="inline-flex items-center justify-center w-10 h-10 bg-white border border-[#E3E3E3] text-[#737373] hover:bg-[#F7F7F7] hover:border-[#B82025] hover:text-[#B82025] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm civic-transition"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center space-x-1">
                          <span className="px-4 py-2.5 bg-[#B82025] text-white text-sm font-semibold rounded-xl shadow-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {pagination.page}
                          </span>
                          <span className="text-[#737373] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>dari</span>
                          <span className="px-3 py-2 bg-white border border-[#E3E3E3] text-[#737373] text-sm font-medium rounded-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {pagination.totalPages}
                          </span>
                        </div>
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                          disabled={pagination.page === pagination.totalPages}
                          className="inline-flex items-center justify-center w-10 h-10 bg-white border border-[#E3E3E3] text-[#737373] hover:bg-[#F7F7F7] hover:border-[#B82025] hover:text-[#B82025] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm civic-transition"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden civic-card">
            <div className="bg-[#B82025] px-6 py-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Merriweather, serif' }}>
                    Pilih Tujuan Disposisi
                  </h3>
                  <p className="text-white text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Surat: <span className="font-medium">{selectedSurat?.nomorSurat || '-'}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Pilih Bagian Tujuan
                </label>
                <div className="space-y-2">
                  {tujuanOptions.map((option) => (
                    <label key={option} className="flex items-center p-2.5 rounded-lg border-2 border-[#E3E3E3] hover:border-[#B82025] hover:bg-[#F7F7F7] civic-transition cursor-pointer group">
                      <input
                        type="radio"
                        name="tujuan"
                        value={option}
                        checked={selectedTujuan === option}
                        onChange={(e) => {
                          setSelectedTujuan(e.target.value)
                          setSelectedSubBagian('') // Reset sub bagian when changing main bagian
                        }}
                        className="h-4 w-4 text-[#B82025] focus:ring-[#B82025] border-[#E3E3E3]"
                      />
                      <span className="ml-3 text-sm font-medium text-[#1A1A1A] group-hover:text-[#B82025]" style={{ fontFamily: 'Inter, sans-serif' }}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {selectedTujuan && subBagianOptions[selectedTujuan as keyof typeof subBagianOptions] && (
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Pilih Sub Bagian
                  </label>
                  <div className="space-y-1.5">
                    {subBagianOptions[selectedTujuan as keyof typeof subBagianOptions].map((subOption) => (
                      <label key={subOption} className="flex items-center p-2 rounded-lg border border-[#E3E3E3] hover:border-[#B82025] hover:bg-[#F7F7F7] civic-transition cursor-pointer group">
                        <input
                          type="radio"
                          name="subBagian"
                          value={subOption}
                          checked={selectedSubBagian === subOption}
                          onChange={(e) => setSelectedSubBagian(e.target.value)}
                          className="h-4 w-4 text-[#B82025] focus:ring-[#B82025] border-[#E3E3E3]"
                        />
                        <span className="ml-3 text-xs font-medium text-[#737373] group-hover:text-[#B82025]" style={{ fontFamily: 'Inter, sans-serif' }}>{subOption}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Keterangan Disposisi
                </label>
                <textarea
                  value={keteranganDisposisi}
                  onChange={(e) => setKeteranganDisposisi(e.target.value)}
                  placeholder="Masukkan keterangan disposisi..."
                  rows={2}
                  className="civic-input w-full px-3 py-2 border-2 border-[#E3E3E3] rounded-lg bg-white focus:ring-2 focus:ring-[#B82025] focus:border-[#B82025] civic-transition text-[#1A1A1A] placeholder-[#737373] resize-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Tanggal Disposisi
                </label>
                <input
                  type="date"
                  value={tanggalDisposisi}
                  onChange={(e) => setTanggalDisposisi(e.target.value)}
                  required
                  className="civic-input w-full px-3 py-2 border-2 border-[#E3E3E3] rounded-lg bg-white focus:ring-2 focus:ring-[#B82025] focus:border-[#B82025] civic-transition text-[#1A1A1A]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-4 bg-[#F7F7F7] border-t border-[#E3E3E3] flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelCopy}
                className="civic-btn-secondary px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#E3E3E3] rounded-lg hover:bg-[#F7F7F7] hover:border-[#B82025] focus:outline-none focus:ring-2 focus:ring-[#B82025] focus:ring-offset-2 civic-transition shadow-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCopy}
                className="civic-btn-primary px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82025] focus:ring-offset-2 civic-transition shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Buat Disposisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Surat Keluar */}
      {showSuratKeluarModal && selectedSuratForKeluar && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden civic-card">
            <div className="bg-[#B82025] px-6 py-5 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: 'Merriweather, serif' }}>
                    Buat Surat Keluar
                  </h3>
                  <p className="text-white text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Dari: <span className="font-medium">{selectedSuratForKeluar.nomorSurat || '-'}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Nomor Urut Surat Keluar
                </label>
                <input
                  type="number"
                  value={noUrutKeluar}
                  onChange={(e) => setNoUrutKeluar(e.target.value)}
                  placeholder="Contoh: 1, 2, 3..."
                  min="1"
                  required
                  className="civic-input w-full px-3 py-2 border-2 border-[#E3E3E3] rounded-lg bg-white focus:ring-2 focus:ring-[#B82025] focus:border-[#B82025] civic-transition text-[#1A1A1A] placeholder-[#737373]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Klas Surat
                </label>
                <input
                  type="text"
                  value={klaSurat}
                  onChange={(e) => setKlasSurat(e.target.value)}
                  placeholder="Contoh: 001/DPRD/XI/2024"
                  required
                  className="civic-input w-full px-3 py-2 border-2 border-[#E3E3E3] rounded-lg bg-white focus:ring-2 focus:ring-[#B82025] focus:border-[#B82025] civic-transition text-[#1A1A1A] placeholder-[#737373]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Pengolah Surat
                </label>
                <div className="space-y-2">
                  {pengolahOptions.map((option) => (
                    <label key={option.value} className="flex items-center p-2.5 rounded-lg border-2 border-[#E3E3E3] hover:border-[#B82025] hover:bg-[#F7F7F7] civic-transition cursor-pointer group">
                      <input
                        type="radio"
                        name="pengolah"
                        value={option.value}
                        checked={pengolahSurat === option.value}
                        onChange={(e) => setPengolahSurat(e.target.value)}
                        className="h-4 w-4 text-[#B82025] focus:ring-[#B82025] border-[#E3E3E3]"
                      />
                      <span className="ml-3 text-sm font-medium text-[#1A1A1A] group-hover:text-[#B82025]" style={{ fontFamily: 'Inter, sans-serif' }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Kirim Kepada
                </label>
                <input
                  type="text"
                  value={kirimKepada}
                  onChange={(e) => setKirimKepada(e.target.value)}
                  placeholder="Contoh: Dinas Pendidikan Provinsi Kalimantan Selatan"
                  required
                  className="civic-input w-full px-3 py-2 border-2 border-[#E3E3E3] rounded-lg bg-white focus:ring-2 focus:ring-[#B82025] focus:border-[#B82025] civic-transition text-[#1A1A1A] placeholder-[#737373]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="bg-[#F7F7F7] p-4 rounded-lg border border-[#E3E3E3]">
                <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2" style={{ fontFamily: 'Merriweather, serif' }}>Data Otomatis (dari Surat Masuk):</h4>
                <div className="space-y-1 text-sm text-[#737373]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <p><strong>Tanggal Surat:</strong> {new Date(selectedSuratForKeluar.tanggalSurat).toLocaleDateString('id-ID')}</p>
                  <p><strong>Perihal Surat:</strong> {selectedSuratForKeluar.perihal}</p>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-4 bg-[#F7F7F7] border-t border-[#E3E3E3] flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelSuratKeluar}
                className="civic-btn-secondary px-4 py-2 text-sm font-medium text-[#1A1A1A] bg-white border border-[#E3E3E3] rounded-lg hover:bg-[#F7F7F7] focus:outline-none focus:ring-2 focus:ring-[#B82025] focus:ring-offset-2 civic-transition shadow-sm hover:shadow-md"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmSuratKeluar}
                className="civic-btn-primary px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B82025] focus:ring-offset-2 civic-transition shadow-lg hover:shadow-xl"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Buat Surat Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}


