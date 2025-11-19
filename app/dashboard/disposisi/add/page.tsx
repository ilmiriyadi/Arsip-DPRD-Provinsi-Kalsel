'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { Save, X, FileText, CheckCircle } from 'lucide-react'

interface SuratMasuk {
  id: string
  noUrut: number
  nomorSurat: string | null
  perihal: string
  asalSurat: string
  tanggalSurat: string
}

function AddDisposisiContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const suratId = searchParams.get('suratId')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>([])
  const [selectedSurat, setSelectedSurat] = useState<SuratMasuk | null>(null)
  const [selectedBagian, setSelectedBagian] = useState('')
  const [selectedSubBagian, setSelectedSubBagian] = useState('')
  const [formData, setFormData] = useState({
    noUrut: '',
    tanggalDisposisi: '',
    tujuanDisposisi: '',
    isiDisposisi: '',
    keterangan: '',
    status: 'SELESAI' as const,
    suratMasukId: suratId || '',
  })

  const tujuanOptions = [
    'Ketua DPRD',
    'Wakil',
    'Ketua Komisi',
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session) {
      fetchSuratMasuk()
    }
  }, [session])

  // Auto-select surat masuk if suratId is provided
  useEffect(() => {
    if (suratId && suratMasukList.length > 0) {
      const surat = suratMasukList.find(s => s.id === suratId)
      if (surat) {
        setSelectedSurat(surat)
        
        setFormData(prev => ({
          ...prev,
          suratMasukId: suratId,
          noUrut: surat.noUrut.toString(),
          isiDisposisi: `Disposisi untuk surat ${surat.nomorSurat ? `nomor ${surat.nomorSurat}` : `no urut ${surat.noUrut}`} dengan perihal "${surat.perihal}" dari ${surat.asalSurat}.`
        }))
      }
    }
  }, [suratId, suratMasukList])

  const fetchSuratMasuk = async () => {
    try {
      const response = await fetch('/api/surat-masuk?limit=100')
      if (response.ok) {
        const data = await response.json()
        setSuratMasukList(data.suratMasuk || [])
      }
    } catch (error) {
      console.error('Error fetching surat masuk:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSuratSelection = (suratId: string) => {
    const surat = suratMasukList.find(s => s.id === suratId)
    setSelectedSurat(surat || null)
    setFormData(prev => ({
      ...prev,
      suratMasukId: suratId,
      noUrut: surat ? surat.noUrut.toString() : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validasi sub bagian
    if (!selectedBagian) {
      setError('Silakan pilih bagian tujuan')
      setLoading(false)
      return
    }

    if (!selectedSubBagian) {
      setError('Silakan pilih sub bagian')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/disposisi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          noUrut: parseInt(formData.noUrut),
          tanggalDisposisi: new Date(formData.tanggalDisposisi).toISOString(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard/disposisi')
      } else {
        setError(data.error || 'Terjadi kesalahan saat menyimpan disposisi')
      }
    } catch (error) {
      console.error('Error saving disposisi:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
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

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Buat Disposisi</h1>
              <p className="mt-1 text-sm text-gray-600">
                {suratId ? 'Buat disposisi dari surat masuk terpilih' : 'Buat disposisi baru untuk surat masuk'}
              </p>
              {suratId && selectedSurat && (
                <div className="mt-2 text-sm text-green-600">
                  ✓ Terhubung dengan surat: {selectedSurat.nomorSurat || `No Urut ${selectedSurat.noUrut}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Informasi Disposisi
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Pilih Surat Masuk */}
              <div>
                <label htmlFor="suratMasukId" className="block text-sm font-medium text-gray-900 mb-2">
                  Pilih Surat Masuk <span className="text-red-500">*</span>
                </label>
                <select
                  id="suratMasukId"
                  name="suratMasukId"
                  value={formData.suratMasukId}
                  onChange={(e) => handleSuratSelection(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="">Pilih surat masuk...</option>
                  {suratMasukList.map((surat) => (
                    <option key={surat.id} value={surat.id}>
                      {surat.nomorSurat || `No Urut ${surat.noUrut}`} - {surat.perihal}
                    </option>
                  ))}
                </select>
              </div>

              {/* Detail Surat yang Dipilih */}
              {selectedSurat && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Detail Surat yang Dipilih</h4>
                      <div className="mt-2 space-y-1 text-sm text-blue-800">
                        <p><span className="font-medium">Nomor:</span> {selectedSurat.nomorSurat || '-'}</p>
                        <p><span className="font-medium">Perihal:</span> {selectedSurat.perihal}</p>
                        <p><span className="font-medium">Asal:</span> {selectedSurat.asalSurat}</p>
                        <p><span className="font-medium">Tanggal:</span> {formatDate(selectedSurat.tanggalSurat)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="noUrut" className="block text-sm font-medium text-gray-900 mb-2">
                  No Urut <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="noUrut"
                  name="noUrut"
                  value={formData.noUrut}
                  onChange={handleChange}
                  required
                  min="1"
                  readOnly={!!selectedSurat}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    selectedSurat ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Akan otomatis terisi saat memilih surat masuk"
                />
                {selectedSurat && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ No Urut disposisi sama dengan surat masuk #{selectedSurat.noUrut}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="bagianTujuan" className="block text-sm font-medium text-gray-900 mb-2">
                    Bagian Tujuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="bagianTujuan"
                    value={selectedBagian}
                    onChange={(e) => {
                      const value = e.target.value
                      setSelectedBagian(value)
                      setSelectedSubBagian('')
                      // Set tujuanDisposisi langsung jika tidak punya sub bagian
                      if (!subBagianOptions[value as keyof typeof subBagianOptions]) {
                        setFormData(prev => ({ ...prev, tujuanDisposisi: value }))
                      } else {
                        setFormData(prev => ({ ...prev, tujuanDisposisi: '' }))
                      }
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Pilih bagian tujuan...</option>
                    {tujuanOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                {selectedBagian && subBagianOptions[selectedBagian as keyof typeof subBagianOptions] && (
                  <div>
                    <label htmlFor="subBagianTujuan" className="block text-sm font-medium text-gray-900 mb-2">
                      Sub Bagian <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subBagianTujuan"
                      value={selectedSubBagian}
                      onChange={(e) => {
                        setSelectedSubBagian(e.target.value)
                        setFormData(prev => ({ 
                          ...prev, 
                          tujuanDisposisi: `${selectedBagian} - ${e.target.value}` 
                        }))
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Pilih sub bagian...</option>
                      {subBagianOptions[selectedBagian as keyof typeof subBagianOptions]?.map((subOption) => (
                        <option key={subOption} value={subOption}>{subOption}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="tanggalDisposisi" className="block text-sm font-medium text-gray-900 mb-2">
                    Tanggal Disposisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="tanggalDisposisi"
                    name="tanggalDisposisi"
                    value={formData.tanggalDisposisi}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Selesai</span>
                  <span className="text-sm text-green-600">(Disposisi otomatis selesai)</span>
                </div>
                <input type="hidden" name="status" value="SELESAI" />
              </div>

              <div>
                <label htmlFor="isiDisposisi" className="block text-sm font-medium text-gray-900 mb-2">
                  Isi Disposisi <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="isiDisposisi"
                  name="isiDisposisi"
                  value={formData.isiDisposisi}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Tulis instruksi atau perintah disposisi..."
                />
              </div>

              <div>
                <label htmlFor="keterangan" className="block text-sm font-medium text-gray-900 mb-2">
                  Keterangan
                </label>
                <textarea
                  id="keterangan"
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Catatan atau keterangan tambahan (opsional)"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Link
                href="/dashboard/disposisi"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Disposisi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AddDisposisiPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <AddDisposisiContent />
    </Suspense>
  )
}

