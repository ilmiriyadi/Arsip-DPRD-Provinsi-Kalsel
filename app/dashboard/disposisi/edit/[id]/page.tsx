'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save, X, ArrowLeft, FileText, Calendar, Building, MessageSquare } from 'lucide-react'

interface SuratMasuk {
  id: string
  noUrut: number
  nomorSurat: string | null
  perihal: string
  asalSurat: string
  tanggalSurat: string
}

interface Disposisi {
  id: string
  noUrut: number
  tanggalDisposisi: string
  tujuanDisposisi: string
  isiDisposisi: string
  keterangan?: string
  status: 'SELESAI'
  suratMasukId: string
  suratMasuk: SuratMasuk
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export default function EditDisposisiPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>([])
  const [disposisi, setDisposisi] = useState<Disposisi | null>(null)
  const [selectedBagian, setSelectedBagian] = useState('')
  const [selectedSubBagian, setSelectedSubBagian] = useState('')
  const [formData, setFormData] = useState({
    noUrut: '',
    tanggalDisposisi: '',
    tujuanDisposisi: '',
    isiDisposisi: '',
    keterangan: '',
    status: 'SELESAI' as const,
    suratMasukId: '',
  })

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session && id) {
      Promise.all([fetchDisposisi(), fetchSuratMasuk()])
    }
  }, [session, id])

  const fetchDisposisi = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/disposisi/${id}`)
      
      if (response.ok) {
        const data = await response.json()
        setDisposisi(data)
        // Parse existing tujuanDisposisi to extract bagian and sub bagian
        const tujuanParts = data.tujuanDisposisi.split(' - ')
        const bagian = tujuanParts[0]
        const subBagian = tujuanParts[1] || ''
        
        if (tujuanOptions.includes(bagian)) {
          setSelectedBagian(bagian)
          setSelectedSubBagian(subBagian)
        }
        
        setFormData({
          noUrut: data.noUrut.toString(),
          tanggalDisposisi: new Date(data.tanggalDisposisi).toISOString().split('T')[0],
          tujuanDisposisi: data.tujuanDisposisi,
          isiDisposisi: data.isiDisposisi,
          keterangan: data.keterangan || '',
          status: data.status,
          suratMasukId: data.suratMasukId,
        })
      } else if (response.status === 404) {
        setError('Disposisi tidak ditemukan')
      } else {
        setError('Gagal mengambil data disposisi')
      }
    } catch (error) {
      console.error('Error fetching disposisi:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setFetchLoading(false)
    }
  }

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
    
    // Jika surat masuk berubah, update noUrut sesuai surat yang dipilih
    if (name === 'suratMasukId') {
      const selectedSurat = suratMasukList.find(s => s.id === value)
      setFormData(prev => ({
        ...prev,
        [name]: value,
        noUrut: selectedSurat ? selectedSurat.noUrut.toString() : prev.noUrut
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'noUrut' ? value : value
      }))
    }
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
      const response = await fetch(`/api/disposisi/${id}`, {
        method: 'PUT',
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
        router.push(`/dashboard/disposisi/${id}`)
      } else {
        setError(data.error || 'Terjadi kesalahan saat menyimpan disposisi')
      }
    } catch (error) {
      console.error('Error updating disposisi:', error)
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || fetchLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
          <div className="mt-6">
            <Link
              href="/dashboard/disposisi"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Daftar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!disposisi) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/disposisi/${id}`}
                className="inline-flex items-center text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Kembali
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Disposisi #{disposisi.noUrut}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Ubah informasi disposisi dan simpan perubahan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Edit */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Form Edit Disposisi
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 cursor-not-allowed"
                        placeholder="Akan mengikuti nomor urut surat masuk"
                      />
                      <p className="mt-1 text-sm text-blue-600">
                        ℹ️ No Urut disposisi akan sama dengan surat masuk yang dipilih
                      </p>
                    </div>

                    <div>
                      <label htmlFor="tanggalDisposisi" className="block text-sm font-medium text-gray-900 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
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
                    <label htmlFor="suratMasukId" className="block text-sm font-medium text-gray-900 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Surat Masuk Terkait <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="suratMasukId"
                      name="suratMasukId"
                      value={formData.suratMasukId}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Pilih Surat Masuk</option>
                      {suratMasukList.map((surat) => (
                        <option key={surat.id} value={surat.id}>
                          #{surat.noUrut} - {surat.nomorSurat || '-'} - {surat.perihal}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="bagianTujuan" className="block text-sm font-medium text-gray-900 mb-2">
                      <Building className="inline h-4 w-4 mr-1" />
                      Bagian Tujuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="bagianTujuan"
                      value={selectedBagian}
                      onChange={(e) => {
                        const value = e.target.value
                        setSelectedBagian(value)
                        setSelectedSubBagian('')
                        // Set tujuanDisposisi langsung dengan nama bagian utama
                        setFormData(prev => ({ ...prev, tujuanDisposisi: value }))
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
                        <Building className="inline h-4 w-4 mr-1" />
                        Sub Bagian <span className="text-gray-500">(Opsional)</span>
                      </label>
                      <select
                        id="subBagianTujuan"
                        value={selectedSubBagian}
                        onChange={(e) => {
                          setSelectedSubBagian(e.target.value)
                          // Jika memilih sub bagian, update tujuanDisposisi dengan format "Bagian - Sub Bagian"
                          // Jika tidak/kosong, gunakan nama bagian utama saja
                          if (e.target.value) {
                            setFormData(prev => ({ 
                              ...prev, 
                              tujuanDisposisi: `${selectedBagian} - ${e.target.value}` 
                            }))
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              tujuanDisposisi: selectedBagian 
                            }))
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="">Pilih sub bagian (atau kosongkan)...</option>
                        {subBagianOptions[selectedBagian as keyof typeof subBagianOptions]?.map((subOption) => (
                          <option key={subOption} value={subOption}>{subOption}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label htmlFor="isiDisposisi" className="block text-sm font-medium text-gray-900 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
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
                      placeholder="Masukkan isi disposisi..."
                    />
                  </div>

                  <div>
                    <label htmlFor="keterangan" className="block text-sm font-medium text-gray-900 mb-2">
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      Keterangan
                    </label>
                    <textarea
                      id="keterangan"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Keterangan tambahan (opsional)"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end space-x-3">
                  <Link
                    href={`/dashboard/disposisi/${id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 bg-white hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar - Info Surat Masuk Terpilih */}
          <div>
            {disposisi.suratMasuk && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Surat Masuk Terkait
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      No Urut
                    </label>
                    <div className="text-blue-600 font-medium">
                      #{disposisi.suratMasuk.noUrut}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Nomor Surat
                    </label>
                    <div className="text-gray-900 font-medium">
                      {disposisi.suratMasuk.nomorSurat || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Perihal
                    </label>
                    <div className="text-gray-900">
                      {disposisi.suratMasuk.perihal}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Asal Surat
                    </label>
                    <div className="text-gray-900">
                      {disposisi.suratMasuk.asalSurat}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}